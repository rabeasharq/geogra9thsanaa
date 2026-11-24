/**
 * Security Rules Verification Suite (Phase 0 - Payload-First Security TDD)
 * Documents the 12 adversarial payloads ("Dirty Dozen") and expected PERMISSION_DENIED outcomes
 * against firestore.rules.
 */

export interface SecurityRuleCase {
  id: number;
  name: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  payload?: Record<string, unknown>;
  auth: { uid?: string; email?: string; email_verified?: boolean } | null;
  expected: 'PERMISSION_DENIED' | 'ALLOW';
}

export const DIRTY_DOZEN_SECURITY_CASES: SecurityRuleCase[] = [
  {
    id: 1,
    name: 'Unauthenticated stats tampering',
    operation: 'update',
    path: '/booklet_stats/global',
    payload: { totalDownloads: 999999, encryptedSaves: 999999, pdfPrints: 0, updatedAt: 'SERVER_TIME' },
    auth: null,
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 2,
    name: 'Stats counter inflation (+100 jump)',
    operation: 'update',
    path: '/booklet_stats/global',
    payload: { totalDownloads: 105, encryptedSaves: 105, pdfPrints: 0, updatedAt: 'SERVER_TIME' },
    auth: { uid: 'student-1', email: 's1@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 3,
    name: 'Ghost field injection on stats',
    operation: 'update',
    path: '/booklet_stats/global',
    payload: { totalDownloads: 2, encryptedSaves: 2, pdfPrints: 0, updatedAt: 'SERVER_TIME', isVerified: true },
    auth: { uid: 'student-1', email: 's1@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 4,
    name: 'Client-forged timestamp on stats',
    operation: 'update',
    path: '/booklet_stats/global',
    payload: { totalDownloads: 2, encryptedSaves: 2, pdfPrints: 0, updatedAt: '2020-01-01T00:00:00Z' },
    auth: { uid: 'student-1', email: 's1@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 5,
    name: 'Unverified email presence create',
    operation: 'create',
    path: '/booklet_presence/sess_abc123',
    payload: {
      sessionId: 'sess_abc123',
      ownerUid: 'student-1',
      scope: 'full',
      isActive: true,
      createdAt: 'SERVER_TIME',
      lastSeen: 'SERVER_TIME'
    },
    auth: { uid: 'student-1', email: 'rabeasharq2024@gmail.com', email_verified: false },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 6,
    name: 'Presence identity spoofing',
    operation: 'create',
    path: '/booklet_presence/sess_abc123',
    payload: {
      sessionId: 'sess_abc123',
      ownerUid: 'other-uid',
      scope: 'full',
      isActive: true,
      createdAt: 'SERVER_TIME',
      lastSeen: 'SERVER_TIME'
    },
    auth: { uid: 'student-1', email: 's1@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 7,
    name: 'Cross-user presence overwrite',
    operation: 'update',
    path: '/booklet_presence/sess_userA',
    payload: {
      sessionId: 'sess_userA',
      ownerUid: 'student-2',
      scope: 'unit-1',
      isActive: false,
      createdAt: 'SERVER_TIME',
      lastSeen: 'SERVER_TIME'
    },
    auth: { uid: 'student-2', email: 's2@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 8,
    name: 'Invalid path ID poisoning',
    operation: 'create',
    path: '/booklet_presence/bad$id!',
    payload: {
      sessionId: 'bad$id!',
      ownerUid: 'student-1',
      scope: 'full',
      isActive: true,
      createdAt: 'SERVER_TIME',
      lastSeen: 'SERVER_TIME'
    },
    auth: { uid: 'student-1', email: 's1@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 9,
    name: 'Invalid scope enum value',
    operation: 'create',
    path: '/booklet_presence/sess_abc123',
    payload: {
      sessionId: 'sess_abc123',
      ownerUid: 'student-1',
      scope: 'malicious_scope',
      isActive: true,
      createdAt: 'SERVER_TIME',
      lastSeen: 'SERVER_TIME'
    },
    auth: { uid: 'student-1', email: 's1@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 10,
    name: 'Immutable download log update attempt',
    operation: 'update',
    path: '/booklet_download_logs/log_1',
    payload: { scope: 'unit-4' },
    auth: { uid: 'student-1', email: 's1@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 11,
    name: 'Cross-user download log scraping',
    operation: 'get',
    path: '/booklet_download_logs/log_owned_by_A',
    auth: { uid: 'student-2', email: 's2@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 12,
    name: 'Admin privilege self-escalation',
    operation: 'create',
    path: '/admins/student-1',
    payload: { uid: 'student-1', role: 'admin', createdAt: 'SERVER_TIME' },
    auth: { uid: 'student-1', email: 's1@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED'
  }
];
