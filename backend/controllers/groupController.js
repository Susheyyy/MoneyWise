const mongoose = require('mongoose');
const GroupEntry = require('../models/GroupEntry');
const { toPaise } = require('../utils/money');
const financialWrite = require('../utils/financialWrite');
const Group = require('../models/Group');
const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const sendInviteEmail = async (email, groupName, inviteToken) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const joinLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/join-group/${inviteToken}`;

    const mailOptions = {
      from: '"MoneyWise Splitter" <' + process.env.EMAIL_USER + '>',
      to: email,
      subject: 'Invite to join expense group: ' + groupName,
      html: '<h2>Invitation</h2><p>Join group workspace: <strong>' + groupName + '</strong></p><a href="' + joinLink + '">Join Group Workspace</a>'
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Email delivery failed to ' + email + ':', err.message);
  }
};

exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id, archivedAt: null })
      .select('-expenses -activityLog')
      .populate('members', 'name email')
      .sort({ updatedAt: -1 });
    res.status(200).json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const { name, members } = req.body; 

    if (!name || !members || !Array.isArray(members)) {
      return res.status(400).json({ message: 'Invalid group title or member payload.' });
    }

    const cleanEmails = members.map(e => e.trim().toLowerCase()).filter(Boolean);
    if (req.user.email && cleanEmails.includes(req.user.email.toLowerCase())) {
      return res.status(400).json({ message: "You can't invite yourself to a group." });
    }
    const existingUsers = await User.find({ email: { $in: cleanEmails } });
    const existingEmails = existingUsers.map(u => u.email.toLowerCase());
    
    const memberIds = existingUsers.map(u => u._id);
    if (!memberIds.some(id => id.toString() === req.user.id.toString())) {
      memberIds.push(req.user.id); 
    }
    
    const pendingInvites = cleanEmails.filter(email => !existingEmails.includes(email));
    const inviteToken = crypto.randomBytes(16).toString('hex');
    const inviteTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const newGroup = await Group.create({
      name: name.trim(),
      owner: req.user.id,
      members: memberIds,
      pendingInvites,
      inviteToken,
      inviteTokenExpires,
      expenses: [],
      activityLog: [{ text: (req.user.name || 'Someone') + ' created this group.' }]
    });

    // Only send invite emails to addresses not already registered
    pendingInvites.forEach(email => {
      sendInviteEmail(email, name.trim(), inviteToken);
    });

    const populatedGroup = await Group.findById(newGroup._id).populate('members', 'name email');
    res.status(201).json(populatedGroup);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Allocate leftover paise to the largest fractional shares so the bill balances.
const allocateShares = (totalPaise, participants) => {
  const weightTotal = participants.reduce((sum, participant) => sum + participant.weight, 0);
  const allocations = participants.map(({ user, weight }) => {
    const exact = totalPaise * (weight / weightTotal);
    return { user, paise: Math.floor(exact), remainder: exact % 1 };
  });
  const unallocated = totalPaise - allocations.reduce((sum, share) => sum + share.paise, 0);
  [...allocations].sort((a, b) => b.remainder - a.remainder)
    .slice(0, unallocated).forEach(share => { share.paise++; });
  return allocations.map(({ user, paise }) => ({ user, paise }));
};

exports.getGroupExpenses = async (req, res) => {
  try {
    const offset = Number(req.query.offset ?? 0);
    const limit = 21;
    if (!Number.isSafeInteger(offset) || offset < 0 || offset > 2147483626) {
      return res.status(400).json({ message: 'Invalid page offset.' });
    }
    const group = await Group.findOne({ _id: req.params.id, members: req.user.id, archivedAt: null }).select('_id');
    if (!group) return res.status(404).json({ message: 'Group not found.' });

    const filter = { group: group._id, kind: 'expense' };
    const [recent, count] = await Promise.all([
      GroupEntry.find(filter).sort({ createdAt: -1, _id: -1 }).skip(offset).limit(limit).lean(),
      GroupEntry.countDocuments(filter),
    ]);
    const expenses = recent.map(entry => ({ ...entry, amount: entry.paise / 100, date: entry.createdAt }));
    if (expenses.length < limit) {
      const [legacy] = await Group.aggregate([
        { $match: { _id: group._id } },
        { $project: { expenses: { $slice: [{ $reverseArray: { $ifNull: ['$expenses', []] } }, Math.max(0, offset - count), limit - expenses.length] } } },
      ]);
      expenses.push(...(legacy?.expenses || []));
    }
    res.json(expenses);
  } catch (err) {
    res.status(400).json({ message: 'Could not load group expenses.' });
  }
};

exports.addSharedExpense = async (req, res) => {
  try {
    const { description, amount, splitMode, splitWith } = req.body;
    const result = await financialWrite(req, `group-expense:${req.params.id}`, async session => {
      const group = await Group.findOneAndUpdate(
        { _id: req.params.id, members: req.user.id, archivedAt: null },
        { $inc: { ledgerVersion: 1 } },
        { new: true, session, projection: { members: 1 } }
      );

      if (!group) {
        throw Object.assign(new Error('Group not found.'), { status: 404 });
      }

      const totalPaise = toPaise(amount);
      if (totalPaise <= 0) {
        throw new Error('Enter a positive amount with at most two decimal places.');
      }
      if (!['equal', 'ratio'].includes(splitMode) || !Array.isArray(splitWith) || !splitWith.length) {
        throw new Error('Select at least one participant and a split type.');
      }

      const members = new Set(group.members.map(String));
      const participants = splitWith.map(entry => ({
        user: String(entry?.user?._id ?? entry?.user ?? entry),
        weight: splitMode === 'ratio' ? Number(entry?.ratio) : 1
      }));
      if (new Set(participants.map(({ user }) => user)).size !== participants.length ||
          participants.some(({ user, weight }) => !members.has(user) || !Number.isFinite(weight) || weight <= 0)) {
        throw new Error('Choose distinct group members with positive shares.');
      }
      if (splitMode === 'ratio' && Math.abs(participants.reduce((sum, entry) => sum + entry.weight, 0) - 100) > 1e-8) {
        throw new Error('Ratios must add up to 100%.');
      }

      const [entry] = await GroupEntry.create([{
        group: group._id,
        kind: 'expense',
        description: description.trim(),
        paise: totalPaise,
        paidBy: req.user.id,
        shares: allocateShares(totalPaise, participants),
      }], { session });
      return entry;
    });
    res.status(200).json(result);
  } catch (err) {
    console.error('Expense Log Failure:', err.message);
    res.status(err.status || 400).json({ message: err.message });
  }
};

exports.addMembersAfterFact = async (req, res) => {
  try {
    const { emails } = req.body; 
    const group = await Group.findOne({ _id: req.params.id, members: req.user.id, archivedAt: null });

    if (!group) return res.status(404).json({ message: 'Group context not found.' });

    const cleanEmails = emails.map(e => e.trim().toLowerCase()).filter(Boolean);
    if (req.user.email && cleanEmails.includes(req.user.email.toLowerCase())) {
      return res.status(400).json({ message: "You can't invite yourself to a group." });
    }
    const existingUsers = await User.find({ email: { $in: cleanEmails } });
    
    if (!group.activityLog) {
      group.activityLog = [];
    }
    
    existingUsers.forEach(user => {
      if (!group.members.some(mId => mId.toString() === user._id.toString())) {
        group.members.push(user._id);
        group.activityLog.push({ text: (req.user.name || 'Someone') + ' added ' + user.name });
      }
    });

    // Only process emails not already registered
    cleanEmails.forEach(email => {
      if (!group.pendingInvites.includes(email)) {
        const isExistingUser = existingUsers.some(u => u.email.toLowerCase() === email);
        group.pendingInvites.push(email);
        group.activityLog.push({ text: (req.user.name || 'Someone') + ' invited ' + email });
        if (!isExistingUser) {
          sendInviteEmail(email, group.name, group.inviteToken);
        }
      }

    });

    if (group.activityLog.length > 50) group.activityLog = group.activityLog.slice(-50);
    await group.save();
    const updatedGroup = await Group.findById(group._id).populate('members', 'name email');
    res.status(200).json(updatedGroup);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.editGroupMetadata = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Name cannot be blank.' });

    const group = await Group.findOne({ _id: req.params.id, members: req.user.id, archivedAt: null });
    if (!group) return res.status(404).json({ message: 'Group workspace not found.' });

    const oldName = group.name;
    group.name = name.trim();

    if (!group.activityLog) {
      group.activityLog = [];
    }
    
    group.activityLog.push({ text: (req.user.name || 'Someone') + ' changed name from ' + oldName + ' to ' + group.name });
    if (group.activityLog.length > 50) group.activityLog = group.activityLog.slice(-50);
    
    await group.save();
    res.status(200).json(group);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.removeGroupMatrix = async (req, res) => {
  try {
    const group = await Group.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id, archivedAt: null },
      { archivedAt: new Date() }
    );
    if (!group) return res.status(403).json({ message: 'Only the group owner can archive this group.' });
    res.status(200).json({ message: 'Group archived.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

async function readGroupBalances(group, session) {
  const balances = Object.fromEntries(group.members.map(member => [String(member._id ?? member), 0]));

  let total = 0;
  const applyExpense = (expense, totalPaise) => {
    const payer = String(expense.paidBy);
    total += totalPaise;
    if (balances[payer] === undefined) return;

    const participants = expense.splitWith?.length ? expense.splitWith : Object.keys(balances);
    const shares = expense.shares?.length ? expense.shares : allocateShares(
      totalPaise, participants.map(user => ({ user, weight: 1 }))
    );
    balances[payer] += totalPaise;
    for (const { user, paise } of shares) {
      if (balances[user] !== undefined) balances[user] -= paise;
      else balances[payer] -= paise;
    }
  };

  for (const expense of group.expenses) applyExpense(expense, Math.round(expense.amount * 100));

  const query = GroupEntry.find({ group: group._id }).lean();
  if (session) query.session(session);
  for await (const entry of query.cursor()) {
    if (entry.kind === 'expense') applyExpense(entry, entry.paise);
    else if (balances[entry.paidBy] !== undefined && balances[entry.recipient] !== undefined) {
      balances[entry.paidBy] += entry.paise;
      balances[entry.recipient] -= entry.paise;
    }
  }
  return { balances, total };
}

exports.recordRepayment = async (req, res) => {
  try {
    const recipient = String(req.user.id);
    const { payer: payerId, amount } = req.body;
    const paise = toPaise(amount);
    if (paise <= 0 || !mongoose.isObjectIdOrHexString(payerId)) {
      return res.status(400).json({ message: 'Choose another group member and a positive amount.' });
    }
    const payer = String(new mongoose.Types.ObjectId(payerId));
    if (payer === recipient) return res.status(400).json({ message: 'Choose another group member.' });
    const repayment = await financialWrite(req, `repayment:${req.params.id}`, async session => {
      const group = await Group.findOneAndUpdate(
        { _id: req.params.id, members: { $all: [payer, recipient] }, archivedAt: null },
        { $inc: { ledgerVersion: 1 } },
        { new: true, session }
      );
      if (!group) throw new Error('Group or member not found.');
      const { balances } = await readGroupBalances(group, session);
      if (!(paise <= Math.min(-balances[payer], balances[recipient]))) {
        throw new Error('The repayment exceeds the current debt or amount owed to this member.');
      }
      const [entry] = await GroupEntry.create([{
        group: group._id, kind: 'repayment', paidBy: payer, recipient, paise,
      }], { session });
      return entry;
    });
    res.status(201).json(repayment);
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
  }
};

exports.getSettlementSummary = async (req, res) => {
  try {
    // Verify the requesting user is actually a member of this group
    const group = await Group.findOne({ _id: req.params.id, members: req.user.id, archivedAt: null }).populate('members', 'name email');
    if (!group) return res.status(404).json({ message: 'Group workspace matrix container not found.' });

    const { balances, total } = await readGroupBalances(group);

    const creditors = [];
    const debtors = [];

    Object.entries(balances).forEach(([userId, netAmt]) => {
      const userObj = group.members.find(m => m._id.toString() === userId);
      if (netAmt > 0) creditors.push({ user: userObj, amount: netAmt });
      if (netAmt < 0) debtors.push({ user: userObj, amount: Math.abs(netAmt) });
    });

    const simpleSettlementPaths = [];
    let cIdx = 0, dIdx = 0;

    while (cIdx < creditors.length && dIdx < debtors.length) {
      const creditor = creditors[cIdx];
      const debtor = debtors[dIdx];
      const settledAmount = Math.min(creditor.amount, debtor.amount);

      if (settledAmount > 0) {
        simpleSettlementPaths.push({
          from: debtor.user.name,
          fromId: debtor.user._id,
          to: creditor.user.name,
          toId: creditor.user._id,
          amount: settledAmount / 100
        });
      }

      creditor.amount -= settledAmount;
      debtor.amount -= settledAmount;

      if (creditor.amount === 0) cIdx++;
      if (debtor.amount === 0) dIdx++;
    }

    res.status(200).json({
      totalSpent: total / 100,
      netBalances: Object.fromEntries(Object.entries(balances).map(([user, paise]) => [user, paise / 100])),
      simplestWayToSettle: simpleSettlementPaths,
      activityLog: group.activityLog || []
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.joinGroupViaLink = async (req, res) => {
  try {
    const { token } = req.params;
    const group = await Group.findOne({ inviteToken: token, archivedAt: null });

    if (!group) {
      return res.status(404).json({ message: 'Invite link is invalid or expired.' });
    }
    
    if (group.inviteTokenExpires && Date.now() > new Date(group.inviteTokenExpires).getTime()) {
      return res.status(400).json({ message: 'Invite link has expired.' });
    }

    const userEmail = req.user.email.toLowerCase();
    const userId = req.user.id;

    if (group.pendingInvites.includes(userEmail)) {
      group.pendingInvites = group.pendingInvites.filter(e => e !== userEmail);
    }

    if (!group.members.some(id => id.toString() === userId.toString())) {
      group.members.push(userId);
      if (!group.activityLog) group.activityLog = [];
      group.activityLog.push({ text: (req.user.name || 'Someone') + ' joined via link.' });
      if (group.activityLog.length > 50) group.activityLog = group.activityLog.slice(-50);
      await group.save();
    }

    res.status(200).json({ message: `Successfully joined ${group.name}!`, groupId: group._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
