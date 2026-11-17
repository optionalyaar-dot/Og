# Security Specification & Payload Audit

## 1. Data Invariants
1. **Owner Exclusivity**: Only the verified owner account (`optionalyaar@gmail.com` with `email_verified == true`) can create, edit, or delete tournaments, update Room ID & Password secrets, update global site settings, adjust player winnings/kills, or approve/reject withdrawals.
2. **PII Isolation**: User email addresses are isolated in `/users/{userId}/private/info` and are only readable/writable by the owning `userId` or the verified owner.
3. **Room Credential Gate**: `/tournaments/{tournamentId}/secrets/room` is strictly inaccessible unless the caller is the verified owner OR has an existing registration document at `/tournaments/{tournamentId}/registrations/$(request.auth.uid)`.
4. **Atomic Registration & Capacity Lock**: A player cannot join a tournament without atomically creating `/tournaments/{tournamentId}/registrations/{userId}`, creating `/users/{userId}/myMatches/{tournamentId}`, and incrementing `joinedCount` by exact `+1` without exceeding `maxSpots`.
5. **Wallet Integrity**: Players start with `winningCoins: 0`, `bonusCoins: 10`. Bonus conversion preserves total coin sum (`winningCoins + bonusCoins`) and requires `existing().bonusCoins >= 10`. Withdrawals require `amount >= 100` and `winningCoins` deduction atomically or owner approval.
6. **Temporal & Identity Integrity**: All `createdAt`/`updatedAt`/`joinedAt` fields must equal `request.time`. All path IDs match `^[a-zA-Z0-9_\-]+$` and <= 128 chars.

## 2. The "Dirty Dozen" Attack Payloads (Expected: PERMISSION_DENIED)
1. **Unverified Admin Email Spoof**: Auth token with `email == 'optionalyaar@gmail.com'` and `email_verified == false` writing to `/tournaments/t1`.
2. **Non-Owner Tournament Creation**: Verified player `player1@gmail.com` attempting `create` on `/tournaments/t1`.
3. **Ghost Field Shadow Update**: Player updating `/users/uid1` with an extra field `{ isAdmin: true }`.
4. **Self-Crediting Coins**: Player updating `/users/uid1` with `{ winningCoins: 99999 }` without matching bonus reduction.
5. **Negative Bonus Conversion**: Player updating `/users/uid1` with `{ bonusCoins: -50, winningCoins: 60 }`.
6. **Unjoined Room Spying**: Player `uid2` (not registered for `t1`) reading `/tournaments/t1/secrets/room`.
7. **Orphan Registration Without Tournament Increment**: Player writing `/tournaments/t1/registrations/uid2` directly without incrementing `/tournaments/t1.joinedCount`.
8. **Over-Capacity Join**: Player joining `/tournaments/t1` when `joinedCount == maxSpots`.
9. **Identity Spoofing in Registration**: Player `uid2` creating `/tournaments/t1/registrations/uid3` with `userId: 'uid3'`.
10. **PII Blanket Read**: Player `uid2` reading `/users/uid1/private/info`.
11. **Withdrawal Below Minimum / Pre-Approved**: Player creating `/withdrawals/w1` with `amount: 20` or `status: 'approved'`.
12. **Oversized ID Poisoning**: Creating document with 500-character ID or invalid characters (`../admin`).
