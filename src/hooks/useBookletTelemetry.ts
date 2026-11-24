import { useCallback, useEffect, useRef, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import {
  ADMIN_EMAIL,
  auth,
  db,
  handleFirestoreError,
  onAuthStateChanged,
  OperationType,
  signInWithGoogleAccount,
  signOutAccount,
  User
} from '../firebase';
import { BookletScope } from '../components/PrintableStudyBooklet';

const LOCAL_STATS_KEY = 'geo9_local_booklet_stats_v1';

export type DeviceCategory = 'mobile' | 'tablet' | 'desktop';
export type AppRunMode = 'pwa' | 'web';

export interface BookletPublicStats {
  totalDownloads: number;
  activeReaders: number;
  totalUsers: number;
}

export interface BookletAdminBreakdown {
  totalDownloads: number;
  encryptedSaves: number;
  pdfPrints: number;
  activeReaders: number;
  totalUsers: number;
}

export interface AdminPresenceDetail {
  sessionId: string;
  ownerUid: string;
  displayName: string;
  email: string;
  deviceType: DeviceCategory;
  appMode: AppRunMode;
  scope: BookletScope;
  createdAtMs: number;
  lastSeenMs: number;
}

export interface AdminDownloadLogDetail {
  id: string;
  ownerUid: string;
  displayName: string;
  email: string;
  deviceType: DeviceCategory;
  appMode: AppRunMode;
  scope: BookletScope;
  mode: 'encrypted_offline' | 'pdf_print';
  createdAtMs: number;
}

export interface AdminUserProfileDetail {
  uid: string;
  displayName: string;
  email: string;
  deviceType: DeviceCategory;
  appMode: AppRunMode;
  downloadsCount: number;
  encryptedSavesCount: number;
  pdfPrintsCount: number;
  lastScope: BookletScope;
  firstSeenAtMs: number;
  lastActiveAtMs: number;
}

function createFreshSessionId(): string {
  try {
    const bytes = new Uint8Array(12);
    crypto.getRandomValues(bytes);
    return (
      'sess_' +
      Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
    );
  } catch {
    return 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
  }
}

function detectClientDeviceMeta(): { deviceType: DeviceCategory; appMode: AppRunMode } {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { deviceType: 'desktop', appMode: 'web' };
  }
  const ua = navigator.userAgent.toLowerCase();
  let deviceType: DeviceCategory = 'desktop';
  if (/ipad|tablet|playbook|silk|(android(?!.*mobi))/i.test(ua)) {
    deviceType = 'tablet';
  } else if (/mobi|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
    deviceType = 'mobile';
  }
  const isStandalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return {
    deviceType,
    appMode: isStandalone ? 'pwa' : 'web'
  };
}

function sanitizeUserMeta(user: User): { displayName: string; email: string } {
  const displayName = (user.displayName || 'مستخدم').trim().slice(0, 120) || 'مستخدم';
  const email = (user.email || '').trim().slice(0, 160);
  return { displayName, email };
}

function readLocalTotalDownloads(): number {
  try {
    const raw = localStorage.getItem(LOCAL_STATS_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { totalDownloads?: number };
    return Number(parsed.totalDownloads) || 0;
  } catch {
    return 0;
  }
}

function writeLocalTotalDownloads(totalDownloads: number) {
  try {
    localStorage.setItem(LOCAL_STATS_KEY, JSON.stringify({ totalDownloads }));
  } catch {
    // Ignore storage quota errors
  }
}

export function useBookletTelemetry(activeScope: BookletScope, isReadingBooklet: boolean) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [authReady, setAuthReady] = useState(false);
  const [cloudStats, setCloudStats] = useState<BookletAdminBreakdown | null>(null);
  const [localTotalDownloads, setLocalTotalDownloads] = useState<number>(readLocalTotalDownloads);

  // Admin-only collections (never queried or exposed to non-admin clients)
  const [adminPresenceList, setAdminPresenceList] = useState<AdminPresenceDetail[]>([]);
  const [adminUserProfiles, setAdminUserProfiles] = useState<AdminUserProfileDetail[]>([]);
  const [adminDownloadLogs, setAdminDownloadLogs] = useState<AdminDownloadLogDetail[]>([]);

  const [authBusy, setAuthBusy] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const sessionIdRef = useRef<string>(createFreshSessionId());
  const presenceCreatedRef = useRef(false);
  const countedInGlobalActiveRef = useRef(false);

  const isAdmin = Boolean(user?.email === ADMIN_EMAIL && user?.emailVerified);

  // 1. Track Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // 2. Listen to public aggregate non-PII counter doc (`booklet_stats/global`)
  useEffect(() => {
    const statsRef = doc(db, 'booklet_stats', 'global');
    const unsub = onSnapshot(
      statsRef,
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setCloudStats({
            totalDownloads: Number(d.totalDownloads) || 0,
            encryptedSaves: Number(d.encryptedSaves) || 0,
            pdfPrints: Number(d.pdfPrints) || 0,
            activeReaders: Number(d.activeReaders) || 0,
            totalUsers: Number(d.totalUsers) || 0
          });
        } else {
          setCloudStats({
            totalDownloads: 0,
            encryptedSaves: 0,
            pdfPrints: 0,
            activeReaders: 0,
            totalUsers: 0
          });
        }
      },
      (err) => {
        if (err.message.includes('offline')) return;
        try {
          handleFirestoreError(err, OperationType.GET, 'booklet_stats/global');
        } catch (wrapped) {
          setSyncError(wrapped instanceof Error ? wrapped.message : String(wrapped));
        }
      }
    );
    return () => unsub();
  }, []);

  // 3. Maintain private session heartbeat + user profile + global activeReaders delta
  useEffect(() => {
    if (!authReady || !user || !user.emailVerified || !isReadingBooklet) return;

    const sessionId = sessionIdRef.current;
    const presenceRef = doc(db, 'booklet_presence', sessionId);
    const statsRef = doc(db, 'booklet_stats', 'global');
    const profileRef = doc(db, 'booklet_user_profiles', user.uid);
    let stopped = false;

    const adjustGlobalActive = async (delta: 1 | -1) => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) return;
      try {
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(statsRef);
          if (!snap.exists()) {
            if (delta === 1) {
              tx.set(statsRef, {
                totalDownloads: 0,
                encryptedSaves: 0,
                pdfPrints: 0,
                activeReaders: 1,
                totalUsers: 0,
                updatedAt: serverTimestamp()
              });
            }
          } else {
            const cur = snap.data();
            const curActive = Number(cur.activeReaders) || 0;
            const nextActive = Math.max(0, curActive + delta);
            if (nextActive !== curActive) {
              tx.update(statsRef, {
                activeReaders: nextActive,
                updatedAt: serverTimestamp()
              });
            }
          }
        });
      } catch {
        // Silent fallback if offline or concurrent
      }
    };

    const ensureUserProfile = async () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) return;
      const { displayName, email } = sanitizeUserMeta(user);
      const { deviceType, appMode } = detectClientDeviceMeta();
      try {
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(profileRef);
          const statsSnap = await tx.get(statsRef);
          if (!snap.exists()) {
            tx.set(profileRef, {
              uid: user.uid,
              displayName,
              email,
              deviceType,
              appMode,
              downloadsCount: 0,
              encryptedSavesCount: 0,
              pdfPrintsCount: 0,
              lastScope: activeScope,
              firstSeenAt: serverTimestamp(),
              lastActiveAt: serverTimestamp()
            });
            if (!statsSnap.exists()) {
              tx.set(statsRef, {
                totalDownloads: 0,
                encryptedSaves: 0,
                pdfPrints: 0,
                activeReaders: 1,
                totalUsers: 1,
                updatedAt: serverTimestamp()
              });
            } else {
              const curTotalUsers = Number(statsSnap.data().totalUsers) || 0;
              tx.update(statsRef, {
                totalUsers: curTotalUsers + 1,
                updatedAt: serverTimestamp()
              });
            }
          } else {
            tx.update(profileRef, {
              displayName,
              email,
              deviceType,
              appMode,
              lastScope: activeScope,
              lastActiveAt: serverTimestamp()
            });
          }
        });
      } catch {
        // Non-blocking profile sync
      }
    };

    const sendHeartbeat = async () => {
      if (stopped || (typeof navigator !== 'undefined' && !navigator.onLine)) return;
      const { displayName, email } = sanitizeUserMeta(user);
      const { deviceType, appMode } = detectClientDeviceMeta();

      try {
        if (!presenceCreatedRef.current) {
          await setDoc(presenceRef, {
            sessionId,
            ownerUid: user.uid,
            displayName,
            email,
            deviceType,
            appMode,
            scope: activeScope,
            isActive: true,
            createdAt: serverTimestamp(),
            lastSeen: serverTimestamp()
          });
          presenceCreatedRef.current = true;
          if (!countedInGlobalActiveRef.current) {
            countedInGlobalActiveRef.current = true;
            await adjustGlobalActive(1);
          }
          await ensureUserProfile();
        } else {
          await updateDoc(presenceRef, {
            displayName,
            email,
            deviceType,
            appMode,
            scope: activeScope,
            isActive: true,
            lastSeen: serverTimestamp()
          });
        }
      } catch (err) {
        if (err instanceof Error && err.message.includes('offline')) return;
        try {
          handleFirestoreError(err, OperationType.WRITE, `booklet_presence/${sessionId}`);
        } catch {
          // Recorded via console
        }
      }
    };

    void sendHeartbeat();
    const interval = window.setInterval(() => {
      void sendHeartbeat();
    }, 30_000);

    return () => {
      stopped = true;
      window.clearInterval(interval);
      if (presenceCreatedRef.current) {
        presenceCreatedRef.current = false;
        void deleteDoc(presenceRef).catch(() => undefined);
      }
      if (countedInGlobalActiveRef.current) {
        countedInGlobalActiveRef.current = false;
        void adjustGlobalActive(-1);
      }
    };
  }, [authReady, user, activeScope, isReadingBooklet]);

  // 4. Hidden Admin-Only Subscriptions (strictly never subscribed for non-admins)
  useEffect(() => {
    if (!authReady || !isAdmin) {
      setAdminPresenceList([]);
      setAdminUserProfiles([]);
      setAdminDownloadLogs([]);
      return;
    }

    const unsubPresence = onSnapshot(
      query(collection(db, 'booklet_presence'), orderBy('lastSeen', 'desc'), limit(50)),
      (snap) => {
        const now = Date.now();
        const active: AdminPresenceDetail[] = [];
        snap.forEach((d) => {
          const data = d.data();
          const lastSeenMs = data.lastSeen?.toMillis ? data.lastSeen.toMillis() : now;
          const createdAtMs = data.createdAt?.toMillis ? data.createdAt.toMillis() : lastSeenMs;
          if (data.isActive === true && now - lastSeenMs <= 95_000) {
            active.push({
              sessionId: String(data.sessionId || d.id),
              ownerUid: String(data.ownerUid || ''),
              displayName: String(data.displayName || 'مستخدم'),
              email: String(data.email || ''),
              deviceType: (data.deviceType as DeviceCategory) || 'desktop',
              appMode: (data.appMode as AppRunMode) || 'web',
              scope: (data.scope as BookletScope) || 'full',
              createdAtMs,
              lastSeenMs
            });
          }
        });
        setAdminPresenceList(active);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'booklet_presence');
        } catch {
          // Recorded in console
        }
      }
    );

    const unsubProfiles = onSnapshot(
      query(collection(db, 'booklet_user_profiles'), orderBy('lastActiveAt', 'desc'), limit(100)),
      (snap) => {
        const users: AdminUserProfileDetail[] = [];
        snap.forEach((d) => {
          const data = d.data();
          users.push({
            uid: String(data.uid || d.id),
            displayName: String(data.displayName || 'مستخدم'),
            email: String(data.email || ''),
            deviceType: (data.deviceType as DeviceCategory) || 'desktop',
            appMode: (data.appMode as AppRunMode) || 'web',
            downloadsCount: Number(data.downloadsCount) || 0,
            encryptedSavesCount: Number(data.encryptedSavesCount) || 0,
            pdfPrintsCount: Number(data.pdfPrintsCount) || 0,
            lastScope: (data.lastScope as BookletScope) || 'full',
            firstSeenAtMs: data.firstSeenAt?.toMillis ? data.firstSeenAt.toMillis() : Date.now(),
            lastActiveAtMs: data.lastActiveAt?.toMillis ? data.lastActiveAt.toMillis() : Date.now()
          });
        });
        setAdminUserProfiles(users);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'booklet_user_profiles');
        } catch {
          // Recorded in console
        }
      }
    );

    const unsubLogs = onSnapshot(
      query(collection(db, 'booklet_download_logs'), orderBy('createdAt', 'desc'), limit(40)),
      (snap) => {
        const logs: AdminDownloadLogDetail[] = [];
        snap.forEach((d) => {
          const data = d.data();
          logs.push({
            id: d.id,
            ownerUid: String(data.ownerUid || ''),
            displayName: String(data.displayName || 'مستخدم'),
            email: String(data.email || ''),
            deviceType: (data.deviceType as DeviceCategory) || 'desktop',
            appMode: (data.appMode as AppRunMode) || 'web',
            scope: (data.scope as BookletScope) || 'full',
            mode: data.mode === 'pdf_print' ? 'pdf_print' : 'encrypted_offline',
            createdAtMs: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now()
          });
        });
        setAdminDownloadLogs(logs);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'booklet_download_logs');
        } catch {
          // Recorded in console
        }
      }
    );

    return () => {
      unsubPresence();
      unsubProfiles();
      unsubLogs();
    };
  }, [authReady, isAdmin]);

  // 5. Record download / print actions cleanly
  const recordBookletAction = useCallback(
    async (scope: BookletScope, mode: 'encrypted_offline' | 'pdf_print') => {
      setLocalTotalDownloads((prev) => {
        const next = prev + 1;
        writeLocalTotalDownloads(next);
        return next;
      });

      if (!user || !user.emailVerified) return;
      if (typeof navigator !== 'undefined' && !navigator.onLine) return;

      const { displayName, email } = sanitizeUserMeta(user);
      const { deviceType, appMode } = detectClientDeviceMeta();

      const statsRef = doc(db, 'booklet_stats', 'global');
      try {
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(statsRef);
          if (!snap.exists()) {
            tx.set(statsRef, {
              totalDownloads: 1,
              encryptedSaves: mode === 'encrypted_offline' ? 1 : 0,
              pdfPrints: mode === 'pdf_print' ? 1 : 0,
              activeReaders: isReadingBooklet ? 1 : 0,
              totalUsers: 1,
              updatedAt: serverTimestamp()
            });
          } else {
            const cur = snap.data();
            const curTotal = Number(cur.totalDownloads) || 0;
            const curEnc = Number(cur.encryptedSaves) || 0;
            const curPdf = Number(cur.pdfPrints) || 0;
            tx.update(statsRef, {
              totalDownloads: curTotal + 1,
              encryptedSaves: curEnc + (mode === 'encrypted_offline' ? 1 : 0),
              pdfPrints: curPdf + (mode === 'pdf_print' ? 1 : 0),
              updatedAt: serverTimestamp()
            });
          }
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'booklet_stats/global');
      }

      const profileRef = doc(db, 'booklet_user_profiles', user.uid);
      try {
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(profileRef);
          if (!snap.exists()) {
            tx.set(profileRef, {
              uid: user.uid,
              displayName,
              email,
              deviceType,
              appMode,
              downloadsCount: 1,
              encryptedSavesCount: mode === 'encrypted_offline' ? 1 : 0,
              pdfPrintsCount: mode === 'pdf_print' ? 1 : 0,
              lastScope: scope,
              firstSeenAt: serverTimestamp(),
              lastActiveAt: serverTimestamp()
            });
          } else {
            const cur = snap.data();
            const dCount = Number(cur.downloadsCount) || 0;
            const eCount = Number(cur.encryptedSavesCount) || 0;
            const pCount = Number(cur.pdfPrintsCount) || 0;
            tx.update(profileRef, {
              displayName,
              email,
              deviceType,
              appMode,
              downloadsCount: dCount + 1,
              encryptedSavesCount: eCount + (mode === 'encrypted_offline' ? 1 : 0),
              pdfPrintsCount: pCount + (mode === 'pdf_print' ? 1 : 0),
              lastScope: scope,
              lastActiveAt: serverTimestamp()
            });
          }
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `booklet_user_profiles/${user.uid}`);
      }

      const logId = `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const logRef = doc(db, 'booklet_download_logs', logId);
      try {
        await setDoc(logRef, {
          ownerUid: user.uid,
          displayName,
          email,
          deviceType,
          appMode,
          scope,
          mode,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `booklet_download_logs/${logId}`);
      }
    },
    [user, isReadingBooklet]
  );

  const handleSignIn = useCallback(async () => {
    setAuthBusy(true);
    setSyncError(null);
    try {
      await signInWithGoogleAccount();
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'تعذر تسجيل الدخول.');
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    setAuthBusy(true);
    try {
      if (presenceCreatedRef.current && user) {
        presenceCreatedRef.current = false;
        await deleteDoc(doc(db, 'booklet_presence', sessionIdRef.current)).catch(() => undefined);
      }
      if (countedInGlobalActiveRef.current) {
        countedInGlobalActiveRef.current = false;
        const statsRef = doc(db, 'booklet_stats', 'global');
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(statsRef);
          if (snap.exists()) {
            const curActive = Number(snap.data().activeReaders) || 0;
            if (curActive > 0) {
              tx.update(statsRef, {
                activeReaders: curActive - 1,
                updatedAt: serverTimestamp()
              });
            }
          }
        }).catch(() => undefined);
      }
      await signOutAccount();
    } finally {
      setAuthBusy(false);
    }
  }, [user]);

  // 6. Reconcile pre-existing totalUsers when admin profile directory loads
  useEffect(() => {
    if (!authReady || !isAdmin || !cloudStats) return;
    if (adminUserProfiles.length <= cloudStats.totalUsers) return;
    const statsRef = doc(db, 'booklet_stats', 'global');
    void updateDoc(statsRef, {
      totalUsers: adminUserProfiles.length,
      updatedAt: serverTimestamp()
    }).catch(() => undefined);
  }, [authReady, isAdmin, cloudStats, adminUserProfiles.length]);

  const activeReaders =
    isAdmin && adminPresenceList.length > 0
      ? adminPresenceList.length
      : Math.max(cloudStats?.activeReaders ?? 0, isReadingBooklet ? 1 : 0);

  const publicStats: BookletPublicStats = {
    totalDownloads: Math.max(cloudStats?.totalDownloads ?? 0, localTotalDownloads),
    activeReaders,
    totalUsers: Math.max(
      cloudStats?.totalUsers ?? 0,
      isAdmin ? adminUserProfiles.length : 0,
      activeReaders
    )
  };

  return {
    user,
    authReady,
    isAdmin,
    authBusy,
    syncError,
    publicStats,
    adminBreakdown: isAdmin
      ? {
          totalDownloads: publicStats.totalDownloads,
          encryptedSaves: cloudStats?.encryptedSaves ?? 0,
          pdfPrints: cloudStats?.pdfPrints ?? 0,
          activeReaders: publicStats.activeReaders,
          totalUsers: publicStats.totalUsers
        }
      : null,
    adminPresenceList: isAdmin ? adminPresenceList : [],
    adminUserProfiles: isAdmin ? adminUserProfiles : [],
    adminDownloadLogs: isAdmin ? adminDownloadLogs : [],
    recordBookletAction,
    handleSignIn,
    handleSignOut
  };
}

export type BookletTelemetryHandle = ReturnType<typeof useBookletTelemetry>;
