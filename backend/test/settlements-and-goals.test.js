const assert = require('node:assert/strict');
const { test } = require('node:test');
const mongoose = require('mongoose');
const Group = require('../models/Group');
const GroupEntry = require('../models/GroupEntry');
const Goal = require('../models/Goal');
const Wallet = require('../models/Wallet');
const WalletEntry = require('../models/WalletEntry');
const Operation = require('../models/Operation');
const { addSharedExpense, getSettlementSummary, recordRepayment } = require('../controllers/groupController');
const { deleteGoal } = require('../controllers/goalController');
const financialWrite = require('../utils/financialWrite');
const { toPaise } = require('../utils/money');

const response = () => ({
  status(code) { this.code = code; return this; },
  json(data) { this.data = data; return this; },
});

function mockGroupEntries(t, entries) {
  t.mock.method(GroupEntry, 'find', () => ({
    lean() { return this; },
    session() { return this; },
    async *cursor() { yield* entries; },
  }));
  t.mock.method(GroupEntry, 'create', async rows => {
    entries.push(...rows.map(row => ({ ...row, createdAt: new Date() })));
    return rows;
  });
}

test('settlements honor selected members, ratios, and exact paise', async t => {
  const members = ['Alice', 'Bob', 'Chloe'].map(name => ({ _id: new mongoose.Types.ObjectId(), name }));
  const [alice, bob, chloe] = members.map(member => member._id);
  const group = new Group({ name: 'Home', members: [alice, bob, chloe] });
  mockGroupEntries(t, []);
  t.mock.method(mongoose.connection, 'transaction', async callback => callback({}));
  t.mock.method(Group, 'findOneAndUpdate', async () => group);
  t.mock.method(Group, 'findOne', () => ({
    then: resolve => Promise.resolve(group).then(resolve),
    populate: async () => ({ members, expenses: group.expenses }),
  }));

  const request = { params: { id: group._id }, user: { id: alice }, get: () => undefined };
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

  const repaid = response();
  await recordRepayment({ ...request, body: { payer: String(bob), amount: 20.01 } }, repaid);
  assert.equal(repaid.code, 201);
  const settled = response();
  await getSettlementSummary(request, settled);
  assert.deepEqual(settled.data.simplestWayToSettle, []);
  assert.ok(settled.data.activityLog.some(entry => entry.text.includes('Alice added "Dinner"')));
  assert.ok(settled.data.activityLog.some(entry => entry.text.includes('received from Bob')));
});

test('legacy split records keep their recorded participants', async t => {
  mockGroupEntries(t, []);
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
  const ledger = [];
  t.mock.method(WalletEntry, 'insertMany', async rows => ledger.push(...rows));
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
  assert.deepEqual(ledger.map(entry => entry.deltaPaise), [5000, 2550]);
  assert.ok(goal.archivedAt);
  assert.deepEqual(goal.contributions, [{ amount: 25.5 }]);
});

test('a repeated financial request returns its original result without posting twice', async t => {
  const records = new Map();
  t.mock.method(mongoose.connection, 'transaction', async callback => callback({}));
  t.mock.method(Operation, 'findById', id => ({
    session() { return this; },
    lean: async () => records.get(id),
  }));
  t.mock.method(Operation, 'create', async ([record]) => records.set(record._id, record));
  const request = { user: { id: 'user' }, get: () => 'same-key', body: { amount: 12.34 } };
  let writes = 0;
  const write = async () => {
    writes++;
    return { toObject: () => ({ amount: request.body.amount }) };
  };
  assert.deepEqual(await financialWrite(request, 'transaction', write), { amount: 12.34 });
  assert.deepEqual(await financialWrite(request, 'transaction', write), { amount: 12.34 });
  await assert.rejects(financialWrite({ ...request, body: { amount: 15 } }, 'transaction', write), { status: 409 });
  assert.equal(writes, 1);
});

test('money writes reject sub-paise amounts and legacy balances can be rounded', () => {
  assert.equal(toPaise('1.03'), 103);
  assert.throws(() => toPaise('0.001'), /two decimal places/);
  assert.equal(toPaise(0.1 + 0.2, { legacy: true }), 30);
});

test('goal replay snapshots omit history and receive an expiration', async t => {
  let saved;
  t.mock.method(mongoose.connection, 'transaction', async callback => callback({}));
  t.mock.method(Operation, 'findById', () => ({
    session() { return this; },
    lean: async () => saved,
  }));
  t.mock.method(Operation, 'create', async ([record]) => { saved = record; });
  const request = { user: { id: 'user' }, get: () => 'deposit-key', body: { amount: 12.34 } };
  const goal = { _id: 'goal', currentSaved: 20, contributions: [{ amount: 12.34 }] };
  const summarize = ({ _id, currentSaved }) => ({ _id, currentSaved });
  const receipt = await financialWrite(request, 'goal:goal', async () => goal, { summarize });
  assert.deepEqual(receipt, { _id: 'goal', currentSaved: 20 });
  assert.deepEqual(saved.result, receipt);
  assert.ok(saved.expiresAt > new Date());
  assert.deepEqual(await financialWrite(request, 'goal:goal', assert.fail, { summarize }), receipt);
});
