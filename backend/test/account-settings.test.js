const assert = require('node:assert/strict');
const { test } = require('node:test');
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Wallet = require('../models/Wallet');
const { verifyEmail, resetPassword } = require('../controllers/authController');
const { updateProfile } = require('../controllers/userController');
const { deleteWallet } = require('../controllers/walletController');

const response = () => ({
  statusCode: 200,
  status(code) { this.statusCode = code; return this; },
  json(data) { this.body = data; return this; },
  cookie() { return this; },
});

test('verification and recovery use distinct, conditionally consumed challenges', async t => {
  const oldSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'local-account-settings-test-secret';
  t.after(() => {
    if (oldSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = oldSecret;
  });
  const account = { _id: new mongoose.Types.ObjectId(), email: 'person@example.test' };
  let verificationDigest;
  t.mock.method(User, 'findOneAndUpdate', async (filter, update) => {
    assert.equal(filter.email, account.email);
    assert.equal(filter.isVerified, false);
    assert.ok(filter['emailVerification.expiresAt'].$gt instanceof Date);
    verificationDigest = filter['emailVerification.digest'];
    assert.equal(update.$unset.emailVerification, 1);
    assert.equal(update.$set.isVerified, true);
    return account;
  });
  const body = { email: 'Person@Example.test', code: '123456' };
  const verified = response();
  await verifyEmail({ body }, verified);
  assert.equal(verified.statusCode, 200);

  t.mock.method(User, 'exists', async filter => {
    assert.equal(filter.isVerified, true);
    assert.ok(filter['passwordRecovery.digest']);
    assert.notEqual(filter['passwordRecovery.digest'], verificationDigest);
    return { _id: account._id };
  });
  t.mock.method(User, 'updateOne', async (filter, update) => {
    assert.ok(filter['passwordRecovery.expiresAt'].$gt instanceof Date);
    assert.equal(update.$unset.passwordRecovery, 1);
    assert.match(update.$set.password, /^\$2/);
    return { modifiedCount: 0 };
  });
  const replay = response();
  await resetPassword({ body: { ...body, newPassword: 'ValidPass1!' } }, replay);
  assert.equal(replay.statusCode, 400);
});

test('combined settings save uses the same transaction for owned budgets and profile', async t => {
  const session = {};
  const userId = new mongoose.Types.ObjectId();
  const categoryId = new mongoose.Types.ObjectId();
  const user = { _id: userId, set(field, value) { this[field] = value; } };
  let profileWrites = 0;
  user.save = async options => {
    assert.equal(options.session, session);
    profileWrites++;
    return user;
  };
  t.mock.method(mongoose.connection, 'transaction', async save => save(session));
  t.mock.method(User, 'findById', () => ({
    session: async value => { assert.equal(value, session); return user; },
  }));
  let matchedCount = 0;
  t.mock.method(Category, 'bulkWrite', async ([change], options) => {
    assert.equal(options.session, session);
    assert.deepEqual(change.updateOne.filter, { _id: String(categoryId), user: userId });
    assert.equal(change.updateOne.update.$set.budget, 120.5);
    return { matchedCount };
  });
  const request = { user: { id: userId }, body: { name: 'Updated', budgets: [{ id: String(categoryId), budget: 120.5 }] } };
  const rejected = response();
  await updateProfile(request, rejected);
  assert.equal(rejected.statusCode, 400);
  assert.equal(profileWrites, 0);

  matchedCount = 1;
  const updated = response();
  await updateProfile(request, updated);
  assert.equal(updated.statusCode, 200);
  assert.equal(updated.body.name, 'Updated');
  assert.equal(profileWrites, 1);
});

test('wallet removal checks ownership and zero balance in the delete operation', async t => {
  t.mock.method(Wallet, 'findOneAndDelete', async filter => {
    assert.equal(filter._id, 'wallet');
    assert.equal(filter.user, 'owner');
    assert.deepEqual(filter.$or, [{ balancePaise: 0 }, { balancePaise: null, balance: 0 }]);
    return null;
  });
  t.mock.method(Wallet, 'exists', async () => ({ _id: 'wallet' }));
  const res = response();
  await deleteWallet({ params: { id: 'wallet' }, user: { id: 'owner' } }, res);
  assert.equal(res.statusCode, 409);
});
