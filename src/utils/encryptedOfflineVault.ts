import { BookletScope } from '../components/PrintableStudyBooklet';
import {
  ALL_CONCEPTS,
  BOOK_FRONT_MATTER,
  CORE_TEXTBOOK_QUESTIONS,
  MINISTERIAL_QUESTIONS,
  TEXTBOOK_UNITS
} from '../data/bookIndex';
import { TEXTBOOK_MAP_TEMPLATES } from '../data/mapTemplatesData';
import {
  DISAMBIGUATION_ITEMS,
  MINISTERIAL_COMPARATIVE_TABLES
} from '../data/ministerialComparisons';

const DB_NAME = 'geo9_encrypted_booklet_vault';
const DB_VERSION = 1;
const STORE_KEYS = 'keystore';
const STORE_PACKAGES = 'packages';
const MASTER_KEY_ID = 'vault_aes_gcm_256';

export interface EncryptedBookletPayload {
  version: string;
  scope: BookletScope;
  title: string;
  author: string;
  reviewer: string;
  generatedAt: number;
  unitIds: string[];
  mapIds: string[];
  tableIds: string[];
  disambiguationIds: string[];
  conceptCount: number;
  questionCount: number;
}

export interface EncryptedVaultMetadata {
  scope: BookletScope;
  title: string;
  savedAt: number;
  byteSize: number;
  sha256: string;
  algorithm: 'AES-GCM-256';
  unitCount: number;
  mapCount: number;
  tableCount: number;
}

interface StoredEncryptedRecord extends EncryptedVaultMetadata {
  iv: Uint8Array;
  ciphertext: ArrayBuffer;
}

function openVaultDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB غير متاح في هذا المتصفح.'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_KEYS)) {
        db.createObjectStore(STORE_KEYS);
      }
      if (!db.objectStoreNames.contains(STORE_PACKAGES)) {
        db.createObjectStore(STORE_PACKAGES, { keyPath: 'scope' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('تعذر فتح مخزن التشفير المحلي.'));
  });
}

async function getOrCreateMasterKey(db: IDBDatabase): Promise<CryptoKey> {
  const existing = await new Promise<CryptoKey | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_KEYS, 'readonly');
    const store = tx.objectStore(STORE_KEYS);
    const req = store.get(MASTER_KEY_ID);
    req.onsuccess = () => resolve(req.result as CryptoKey | undefined);
    req.onerror = () => reject(req.error ?? new Error('تعذر قراءة مفتاح التشفير.'));
  });

  if (existing) return existing;

  // Non-extractable AES-GCM-256 key so raw key bytes cannot be exported by scripts
  const generated = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_KEYS, 'readwrite');
    const store = tx.objectStore(STORE_KEYS);
    const req = store.put(generated, MASTER_KEY_ID);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error ?? new Error('تعذر حفظ مفتاح التشفير.'));
  });

  return generated;
}

async function computeSha256Hex(bytes: Uint8Array): Promise<string> {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function buildBookletSnapshotPayload(scope: BookletScope): EncryptedBookletPayload {
  const units =
    scope === 'full' || scope === 'maps-tables'
      ? TEXTBOOK_UNITS
      : TEXTBOOK_UNITS.filter((u) => u.id === scope);
  const unitSet = new Set(units.map((u) => u.id));
  const maps = TEXTBOOK_MAP_TEMPLATES.filter((m) => unitSet.has(m.unitId));
  const tables = MINISTERIAL_COMPARATIVE_TABLES.filter((t) => unitSet.has(t.unitId));
  const disambigs = DISAMBIGUATION_ITEMS.filter((d) => unitSet.has(d.unitId));
  const conceptCount = ALL_CONCEPTS.filter((c) => unitSet.has(c.unitId)).length;
  const questionCount = [...MINISTERIAL_QUESTIONS, ...CORE_TEXTBOOK_QUESTIONS].filter((q) =>
    unitSet.has(q.unitId)
  ).length;

  const titleMap: Record<BookletScope, string> = {
    full: 'الملزمة الشاملة الكاملة (الوحدات 1–4)',
    'unit-1': 'ملزمة الوحدة 1: البيئة الطبيعية لليمن',
    'unit-2': 'ملزمة الوحدة 2: السكان والاقتصاد في اليمن',
    'unit-3': 'ملزمة الوحدة 3: البيئة الطبيعية للوطن العربي',
    'unit-4': 'ملزمة الوحدة 4: السكان والاقتصاد في الوطن العربي',
    'maps-tables': 'كتيّب الخرائط الـ 9 والجداول المستقلة الـ 26'
  };

  return {
    version: '2026.1',
    scope,
    title: `${titleMap[scope]} — ${BOOK_FRONT_MATTER.officialTitle}`,
    author: 'الأستاذ إبراهيم أحمد متاش (779424090)',
    reviewer: 'الأستاذ مجدي محمد النوفاني',
    generatedAt: Date.now(),
    unitIds: units.map((u) => u.id),
    mapIds: maps.map((m) => m.id),
    tableIds: tables.map((t) => t.id),
    disambiguationIds: disambigs.map((d) => d.id),
    conceptCount,
    questionCount
  };
}

export async function saveEncryptedBookletPackage(
  scope: BookletScope
): Promise<EncryptedVaultMetadata> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error('واجهة التشفير (Web Crypto API) غير مدعومة في هذا المتصفح.');
  }

  const payload = buildBookletSnapshotPayload(scope);
  const encoded = new TextEncoder().encode(JSON.stringify(payload));
  const sha256 = await computeSha256Hex(encoded);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const db = await openVaultDb();
  const key = await getOrCreateMasterKey(db);

  const plaintextBuf = new ArrayBuffer(encoded.byteLength);
  new Uint8Array(plaintextBuf).set(encoded);

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintextBuf
  );

  const record: StoredEncryptedRecord = {
    scope,
    title: payload.title,
    savedAt: payload.generatedAt,
    byteSize: ciphertext.byteLength,
    sha256,
    algorithm: 'AES-GCM-256',
    unitCount: payload.unitIds.length,
    mapCount: payload.mapIds.length,
    tableCount: payload.tableIds.length,
    iv,
    ciphertext
  };

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_PACKAGES, 'readwrite');
    const store = tx.objectStore(STORE_PACKAGES);
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error ?? new Error('تعذر حفظ الحزمة المشفرة.'));
  });

  const { iv: _iv, ciphertext: _ct, ...meta } = record;
  void _iv;
  void _ct;
  return meta;
}

export async function loadEncryptedBookletPackage(
  scope: BookletScope
): Promise<{ payload: EncryptedBookletPayload; verified: boolean; meta: EncryptedVaultMetadata } | null> {
  const db = await openVaultDb();
  const record = await new Promise<StoredEncryptedRecord | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_PACKAGES, 'readonly');
    const store = tx.objectStore(STORE_PACKAGES);
    const req = store.get(scope);
    req.onsuccess = () => resolve(req.result as StoredEncryptedRecord | undefined);
    req.onerror = () => reject(req.error ?? new Error('تعذر قراءة الحزمة المشفرة.'));
  });

  if (!record) return null;

  const key = await getOrCreateMasterKey(db);
  const ivBuf = new Uint8Array(record.iv);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBuf },
    key,
    record.ciphertext
  );

  const decryptedBytes = new Uint8Array(decrypted);
  const actualSha = await computeSha256Hex(decryptedBytes);
  if (actualSha !== record.sha256) {
    throw new Error('فشل التحقق من سلامة الحزمة المشفرة (SHA-256 mismatch).');
  }

  const json = new TextDecoder().decode(decryptedBytes);
  const payload = JSON.parse(json) as EncryptedBookletPayload;
  const { iv: _iv, ciphertext: _ct, ...meta } = record;
  void _iv;
  void _ct;
  return { payload, verified: true, meta };
}

export async function listEncryptedBookletPackages(): Promise<EncryptedVaultMetadata[]> {
  try {
    const db = await openVaultDb();
    const records = await new Promise<StoredEncryptedRecord[]>((resolve, reject) => {
      const tx = db.transaction(STORE_PACKAGES, 'readonly');
      const store = tx.objectStore(STORE_PACKAGES);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as StoredEncryptedRecord[]) || []);
      req.onerror = () => reject(req.error ?? new Error('تعذر قراءة قائمة الحزم.'));
    });
    return records
      .map(({ iv: _iv, ciphertext: _ct, ...meta }) => {
        void _iv;
        void _ct;
        return meta;
      })
      .sort((a, b) => b.savedAt - a.savedAt);
  } catch {
    return [];
  }
}

export async function deleteEncryptedBookletPackage(scope: BookletScope): Promise<void> {
  const db = await openVaultDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_PACKAGES, 'readwrite');
    const store = tx.objectStore(STORE_PACKAGES);
    const req = store.delete(scope);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error ?? new Error('تعذر حذف الحزمة المشفرة.'));
  });
}
