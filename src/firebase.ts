import { initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  User
} from 'firebase/auth';
import {
  disableNetwork,
  doc,
  enableNetwork,
  Firestore,
  getDocFromServer,
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  setLogLevel
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Suppress internal SDK offline/transport retry console.error spam in offline-capable PWA environments;
// actionable permission/schema errors are still surfaced explicitly via handleFirestoreError.
setLogLevel('silent');

let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch {
  firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const db = firestoreInstance;
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export function isInsideIframe(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export function formatFirebaseAuthError(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code || '')
      : '';
  const host = typeof window !== 'undefined' ? window.location.hostname : '';

  switch (code) {
    case 'auth/unauthorized-domain':
      return `النطاق الحالي (${host}) غير مضاف في النطاقات المصرح بها في مشروع Firebase (Authentication ← Settings ← Authorized domains).`;
    case 'auth/popup-blocked':
      return 'تم حظر النافذة المنبثقة لتسجيل الدخول في المتصفح؛ يُرجى السماح بالنوافذ المنبثقة لهذا الموقع أو المحاولة مجدداً.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'تم إغلاق نافذة تسجيل الدخول قبل إتمام العملية. أعد المحاولة وأبقِ النافذة مفتوحة حتى يكتمل الدخول.';
    case 'auth/operation-not-supported-in-this-environment':
    case 'auth/web-storage-unsupported':
      return 'المتصفح يمنع تخزين الجلسة أو ملفات تعريف الارتباط اللازمة للدخول؛ تأكد من تفعيل الكوكيز وعدم استخدام التصفح المتخفي المقيد.';
    case 'auth/network-request-failed':
      return 'تعذر الاتصال بالإنترنت لإتمام تسجيل الدخول. تحقق من الشبكة وحاول مجدداً.';
    case 'auth/user-disabled':
      return 'تم تعطيل هذا الحساب في المشروع.';
    default: {
      const msg = error instanceof Error ? error.message : String(error || '');
      if (msg.includes('unauthorized-domain')) {
        return `النطاق الحالي (${host}) غير مصرح به في إعدادات Firebase Authentication.`;
      }
      return code ? `تعذر تسجيل الدخول (${code}).` : 'تعذر تسجيل الدخول عبر Google.';
    }
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function isFirestoreUnavailableError(error: unknown): boolean {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code || '').toLowerCase()
      : '';
  const msg = (error instanceof Error ? error.message : String(error || '')).toLowerCase();
  return (
    code === 'unavailable' ||
    code === 'deadline-exceeded' ||
    code.endsWith('/unavailable') ||
    msg.includes('offline') ||
    msg.includes('unavailable') ||
    msg.includes('could not reach') ||
    msg.includes('the operation could not be completed') ||
    msg.includes('network')
  );
}

export async function syncFirestoreNetworkState(online: boolean): Promise<void> {
  try {
    if (online) {
      await enableNetwork(db);
    } else {
      await disableNetwork(db);
    }
  } catch {
    // Ignore network toggle errors during transitions or teardown
  }
}

export async function testConnection(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    await syncFirestoreNetworkState(false);
    return false;
  }
  try {
    await enableNetwork(db).catch(() => undefined);
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (isFirestoreUnavailableError(error)) {
      return false;
    }
    console.error('Please check your Firebase configuration.', error);
    return false;
  }
}

void testConnection();

export async function resolveRedirectSignIn(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    return result?.user ?? null;
  } catch (err) {
    throw new Error(formatFirebaseAuthError(err));
  }
}

export async function signInWithGoogleAccount(): Promise<User | null> {
  await setPersistence(auth, browserLocalPersistence).catch(() => undefined);

  try {
    const cred = await signInWithPopup(auth, googleProvider);
    return cred.user;
  } catch (err) {
    const code =
      typeof err === 'object' && err !== null && 'code' in err
        ? String((err as { code?: unknown }).code || '')
        : '';

    const shouldFallbackToRedirect =
      !isInsideIframe() &&
      (code === 'auth/popup-blocked' ||
        code === 'auth/operation-not-supported-in-this-environment' ||
        code === 'auth/web-storage-unsupported');

    if (shouldFallbackToRedirect) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }

    throw new Error(formatFirebaseAuthError(err));
  }
}

export async function signOutAccount(): Promise<void> {
  await signOut(auth);
}

export { onAuthStateChanged };
export type { User };
