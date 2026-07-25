import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFirebaseUserCreateData } from '../src/utils/firebaseUserData.js';

test('buildFirebaseUserCreateData creates a deterministic fallback for missing email and username', () => {
  const user = buildFirebaseUserCreateData({
    uid: 'abc123',
    email: null,
    name: null,
  });

  assert.equal(user.email, 'firebase-abc123@local.dailywise');
  assert.equal(user.username, 'firebase-abc123');
  assert.match(user.passwordHash, /^firebase:/);
});

test('buildFirebaseUserCreateData preserves provided values and normalizes them', () => {
  const user = buildFirebaseUserCreateData({
    uid: 'abc123',
    email: 'User@Example.com',
    name: 'Jane Doe',
  });

  assert.equal(user.email, 'user@example.com');
  assert.equal(user.username, 'jane-doe');
  assert.match(user.passwordHash, /^firebase:/);
});
