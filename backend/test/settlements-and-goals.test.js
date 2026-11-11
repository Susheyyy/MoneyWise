const assert = require('node:assert/strict');
const { test } = require('node:test');
const mongoose = require('mongoose');
const Group = require('../models/Group');
const Goal = require('../models/Goal');
const Wallet = require('../models/Wallet');
const { addSharedExpense, getSettlementSummary } = require('../controllers/groupController');
const { deleteGoal } = require('../controllers/goalController');

const response = () => ({
  status(code) { this.code = code; return this; },
  json(data) { this.data = data; return this; },
});

test('settlements honor selected members, ratios, and exact paise', async t => {
  const members = ['Alice', 'Bob', 'Chloe'].map(name => ({ _id: new mongoose.Types.ObjectId(), name }));
  const [alice, bob, chloe] = members.map(member => member._id);
  const group = new Group({ name: 'Home', members: [alice, bob, chloe] });
  t.mock.method(group, 'save', async () => group);
  t.mock.method(Group, 'findOne', () => ({
    then: resolve => Promise.resolve(group).then(resolve),
    populate: async () => ({ members, expenses: group.expenses }),
  }));

  const request = { params: { id: group._id }, user: { id: alice } };
  const addBill = async (amount, splitMode, splitWith) => {
    const res = response();
    await addSharedExpense({ ...request, body: { description: 'Dinner', amount, splitMode, splitWith } }, res);
    return res.code;
  };
  assert.equal(await addBill(100, 'ratio', [{ user: alice, ratio: 80 }, { user: bob, ratio: 20 }]), 200);
  assert.equal(await addBill(0.03, 'equal', [{ user: alice }, { user: bob }]), 200);
  assert.equal(await addBill(10, 'equal', [{ user: bob }, { user: bob }]), 400);

  const res = response();
  await getSettlementSummary(request, res);
  assert.equal(res.code, 200);
  assert.deepEqual(res.data.netBalances, { [alice]: 20.01, [bob]: -20.01, [chloe]: 0 });
  assert.equal(res.data.simplestWayToSettle[0].amount, 20.01);
});

test('legacy split records keep their recorded participants', async t => {
  const members = ['Alice', 'Bob', 'Chloe'].map(name => ({ _id: new mongoose.Types.ObjectId(), name }));
  const [alice, bob, chloe] = members.map(member => member._id);
  t.mock.method(Group, 'findOne', () => ({
    populate: async () => ({ members, expenses: [{ paidBy: alice, amount: 100, splitWith: [alice, bob] }] }),
  }));

  const res = response();
  await getSettlementSummary({ params: { id: 'group' }, user: { id: alice } }, res);
  assert.equal(res.code, 200);
  assert.deepEqual(res.data.netBalances, { [alice]: 50, [bob]: -50, [chloe]: 0 });
});

test('archiving a funded goal requires a wallet and transfers savings only once', async t => {
  const user = new mongoose.Types.ObjectId();
  const wallet = { _id: new mongoose.Types.ObjectId(), balance: 50, save: async () => {} };
  const goal = { _id: new mongoose.Types.ObjectId(), currentSaved: 25.5, contributions: [{ amount: 25.5 }], save: async () => {} };
  const session = {};
  t.mock.method(mongoose.connection, 'transaction', async callback => callback(session));
  t.mock.method(Goal, 'findOne', () => ({ session: async () => goal }));
  t.mock.method(Wallet, 'findOne', filter => ({
    session: async () => filter._id === wallet._id && filter.user === user ? wallet : null,
  }));

  const archive = async refundWalletId => {
    const res = response();
    await deleteGoal({ params: { id: goal._id }, user: { id: user }, body: { refundWalletId } }, res);
    return res.code;
  };
  assert.equal(await archive(), 409);
  assert.equal(await archive(new mongoose.Types.ObjectId()), 400);
  assert.equal(wallet.balance, 50);
  assert.equal(await archive(wallet._id), 200);
  assert.equal(await archive(wallet._id), 200);
  assert.equal(wallet.balance, 75.5);
  assert.ok(goal.archivedAt);
  assert.deepEqual(goal.contributions, [{ amount: 25.5 }]);
});
