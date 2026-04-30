1. Data Invariants:
   - Tracks must have valid metadata.
   - Only admins can write (create, update, delete) to the 'tracks' collection.
   - Only admins can exist in the 'admins' collection.

2. The "Dirty Dozen" Payloads:
   - Create track without auth (DENY)
   - Create track as non-admin (DENY)
   - Delete track as non-admin (DENY)
   - Update track as non-admin (DENY)
   - Inject 1MB string into track title (DENY)
   - Set createdAt to future client time (DENY)
   - Delete admin registry without auth (DENY)
   - Add self to admin registry (DENY)
   - Update another user's profile/data (N/A for now, focus on tracks)
   - List all tracks without auth (OK for public app, but let's check)

3. Test Runner (Conceptual):
   - Verify that non-admin UIDs cannot perform write operations on /tracks/{trackId}.
