import { doc, getDocFromServer, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export interface OwnerVaultRecord {
  uid: string;
  pinSalt: string;
  pinHash: string;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.trim();
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function constantTimeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function derivePinHashHex(pin: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const saltBytes = hexToBytes(saltHex);
  const saltBuf = saltBytes.buffer.slice(
    saltBytes.byteOffset,
    saltBytes.byteOffset + saltBytes.byteLength
  ) as ArrayBuffer;
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuf,
      iterations: 100_000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  return bytesToHex(new Uint8Array(derived));
}

export async function fetchOwnerVaultPinRecord(): Promise<OwnerVaultRecord | null> {
  const uid = auth.currentUser?.uid;
  if (!uid) return null;
  const ref = doc(db, 'owner_vault', uid);
  const snap = await getDocFromServer(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid: String(data.uid || uid),
    pinSalt: String(data.pinSalt || ''),
    pinHash: String(data.pinHash || '')
  };
}

export async function setupOrUpdateOwnerVaultPin(
  newPin: string,
  hasExistingRecord: boolean
): Promise<OwnerVaultRecord> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('يجب تسجيل الدخول بحساب المالك أولاً.');

  const trimmed = newPin.trim();
  if (trimmed.length < 4 || trimmed.length > 32) {
    throw new Error('يجب أن يتكون الرقم السري من 4 إلى 32 خانة.');
  }

  const saltBytes = new Uint8Array(16);
  crypto.getRandomValues(saltBytes);
  const pinSalt = bytesToHex(saltBytes);
  const pinHash = await derivePinHashHex(trimmed, pinSalt);

  const ref = doc(db, 'owner_vault', uid);
  if (hasExistingRecord) {
    await updateDoc(ref, {
      pinSalt,
      pinHash,
      updatedAt: serverTimestamp()
    });
  } else {
    await setDoc(ref, {
      uid,
      pinSalt,
      pinHash,
      updatedAt: serverTimestamp()
    });
  }

  return { uid, pinSalt, pinHash };
}

export async function verifyOwnerVaultPin(
  candidatePin: string,
  record: OwnerVaultRecord
): Promise<boolean> {
  const trimmed = candidatePin.trim();
  if (!trimmed || !record.pinSalt || !record.pinHash) return false;
  const candidateHash = await derivePinHashHex(trimmed, record.pinSalt);
  return constantTimeEqualHex(candidateHash, record.pinHash);
}
