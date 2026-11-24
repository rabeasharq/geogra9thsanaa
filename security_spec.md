# Firestore Security Specification (Phase 0)

## 1. Data Invariants
1. **Default-Deny Catch-All:** Any unmatched collection or subcollection is denied (`allow read, write: if false`).
2. **BookletStats (`/booklet_stats/{statId}`):**
   - Only document ID `'global'` is valid for telemetry counters.
   - Contains zero PII (`totalDownloads`, `encryptedSaves`, `pdfPrints`, `updatedAt`).
   - Updates are strictly bounded by `+1` integer increment per action (`totalDownloads == existing().totalDownloads + 1`) and `updatedAt == request.time`, or Admin override.
   - `list` queries on `booklet_stats` are disabled (`allow list: if false`).
3. **BookletPresence (`/booklet_presence/{sessionId}`):**
   - Contains zero PII (`sessionId`, `ownerUid`, `scope`, `isActive`, `createdAt`, `lastSeen`).
   - Can only be created, updated, or deleted by the authenticated owner (`ownerUid == request.auth.uid` with verified email).
   - `createdAt` and `ownerUid` and `sessionId` are immutable after creation; `lastSeen` must equal `request.time`.
   - `list` queries only return active sessions (`resource.data.isActive == true`) to signed-in users.
4. **BookletDownloadLog (`/booklet_download_logs/{logId}`):**
   - Immutable append-only event log (`allow update, delete: if false`).
   - Requires verified authenticated `ownerUid == request.auth.uid`, valid `scope`, valid `mode` (`encrypted_offline` | `pdf_print`), and `createdAt == request.time`.
   - `list` and `get` are strictly restricted to the owning user (`resource.data.ownerUid == request.auth.uid`) or verified Admin (`rabeasharq2024@gmail.com` or `/admins/{uid}`).
5. **Admins (`/admins/{userId}`):**
   - Only Admin can read or write `/admins/{userId}`. Self-promotion is blocked.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unauthenticated Stats Tampering:** Write `{ totalDownloads: 999999 }` to `/booklet_stats/global` without `request.auth` -> `PERMISSION_DENIED`.
2. **Counter Inflation (+100 Jump):** Verified user updates `/booklet_stats/global` with `totalDownloads: existing + 100` -> `PERMISSION_DENIED`.
3. **Ghost Field Injection (Stats):** Update `/booklet_stats/global` adding `{ hacked: true }` -> `PERMISSION_DENIED` (`hasOnly` check).
4. **Spoofed Timestamp (Stats):** Update `/booklet_stats/global` with `updatedAt` in the past/future instead of `request.time` -> `PERMISSION_DENIED`.
5. **Unverified Email Write:** Signed-in user with `email_verified: false` creates `/booklet_presence/sess1` -> `PERMISSION_DENIED`.
6. **Presence Identity Spoofing:** User A creates `/booklet_presence/sess1` with `ownerUid: "userB"` -> `PERMISSION_DENIED`.
7. **Presence Immutable Owner Hijack:** User B updates User A's `/booklet_presence/sess1` or mutates `createdAt` -> `PERMISSION_DENIED`.
8. **Resource Poisoning / Invalid Document ID:** Create `/booklet_presence/invalid$id!` or 300-char ID -> `PERMISSION_DENIED` (`isValidId`).
9. **Invalid Scope Enum:** Create `/booklet_presence/sess1` with `scope: "arbitrary-payload"` -> `PERMISSION_DENIED`.
10. **Download Log Mutation:** Owner attempts `update` or `delete` on `/booklet_download_logs/{logId}` -> `PERMISSION_DENIED`.
11. **Cross-User Log Scraping:** User B attempts `get` or `list` on User A's `/booklet_download_logs` -> `PERMISSION_DENIED`.
12. **Admin Privilege Escalation:** Non-admin user attempts `create` on `/admins/{uid}` -> `PERMISSION_DENIED`.
