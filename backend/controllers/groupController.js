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

    const joinLink = `http://localhost:3000/join-group/${inviteToken}`;

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
    const groups = await Group.find({ members: req.user.id })
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
    const existingUsers = await User.find({ email: { $in: cleanEmails } });
    const existingEmails = existingUsers.map(u => u.email.toLowerCase());
    
    const memberIds = existingUsers.map(u => u._id);
    if (!memberIds.some(id => id.toString() === req.user.id.toString())) {
      memberIds.push(req.user.id); 
    }
    
    const pendingInvites = cleanEmails.filter(email => !existingEmails.includes(email));
    const inviteToken = crypto.randomBytes(16).toString('hex');

    const newGroup = await Group.create({
      name: name.trim(),
      members: memberIds,
      pendingInvites,
      inviteToken,
      expenses: [],
      activityLog: [{ text: req.user.name + ' created this group.' }]
    });

    cleanEmails.forEach(email => {
      sendInviteEmail(email, name.trim(), inviteToken);
    });

    const populatedGroup = await Group.findById(newGroup._id).populate('members', 'name email');
    res.status(201).json(populatedGroup);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.addSharedExpense = async (req, res) => {
  try {
    const { description, amount, splitMode, splitWith } = req.body;
    const group = await Group.findOne({ _id: req.params.id, members: req.user.id });

    if (!group) {
      return res.status(404).json({ message: 'Group workspace pool context not found.' });
    }

    let participantIds = [];
    const totalAmount = Number(amount);

    if (splitMode === 'equal') {
      participantIds = group.members.map(member => member._id ? member._id.toString() : member.toString());
    } else {
      let rawSplits = splitWith;

      if (typeof rawSplits === 'string') {
        try {
          rawSplits = JSON.parse(rawSplits.replace(/'/g, '"'));
        } catch (e) {
          return res.status(400).json({ message: 'Invalid split data format string.' });
        }
      }

      if (Array.isArray(rawSplits) && Array.isArray(rawSplits[0])) {
        rawSplits = rawSplits[0];
      }

      if (!rawSplits || !Array.isArray(rawSplits)) {
        return res.status(400).json({ message: 'Missing split allocation breakdown matrix.' });
      }

      participantIds = rawSplits.map(item => {
        if (item.user) {
          return item.user._id ? item.user._id.toString() : item.user.toString();
        }
        return item.toString();
      });
    }

    group.expenses.push({
      description: description.trim(),
      amount: totalAmount,
      paidBy: req.user.id,
      splitWith: participantIds
    });

    if (!group.activityLog) group.activityLog = [];
    group.activityLog.push({ text: req.user.name + ' added "' + description.trim() + '" for ₹' + totalAmount });
    
    await group.save();
    res.status(200).json(group);
  } catch (err) {
    console.error('Expense Log Failure:', err.message);
    res.status(400).json({ message: err.message });
  }
};

exports.addMembersAfterFact = async (req, res) => {
  try {
    const { emails } = req.body; 
    const group = await Group.findOne({ _id: req.params.id, members: req.user.id });

    if (!group) return res.status(404).json({ message: 'Group context not found.' });

    const cleanEmails = emails.map(e => e.trim().toLowerCase()).filter(Boolean);
    const existingUsers = await User.find({ email: { $in: cleanEmails } });
    
    if (!group.activityLog) {
      group.activityLog = [];
    }
    
    existingUsers.forEach(user => {
      if (!group.members.some(mId => mId.toString() === user._id.toString())) {
        group.members.push(user._id);
        group.activityLog.push({ text: req.user.name + ' added ' + user.name });
      }
    });

    cleanEmails.forEach(email => {
      if (!group.pendingInvites.includes(email)) {
        group.pendingInvites.push(email);
        group.activityLog.push({ text: req.user.name + ' invited ' + email });
      }
      sendInviteEmail(email, group.name, group.inviteToken);
    });

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

    const group = await Group.findOne({ _id: req.params.id, members: req.user.id });
    if (!group) return res.status(404).json({ message: 'Group workspace not found.' });

    const oldName = group.name;
    group.name = name.trim();

    if (!group.activityLog) {
      group.activityLog = [];
    }
    
    group.activityLog.push({ text: req.user.name + ' changed name from ' + oldName + ' to ' + group.name });
    
    await group.save();
    res.status(200).json(group);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.removeGroupMatrix = async (req, res) => {
  try {
    const group = await Group.findOneAndDelete({ _id: req.params.id, members: req.user.id });
    if (!group) return res.status(404).json({ message: 'Group workspace wiped successfully or unauthorized.' });
    res.status(200).json({ message: 'Group workspace wiped successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSettlementSummary = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('members', 'name email');
    if (!group) return res.status(404).json({ message: 'Group workspace matrix container not found.' });

    const balances = {};
    group.members.forEach(m => { balances[m._id] = 0; });

    group.expenses.forEach(exp => {
      const payer = exp.paidBy.toString();
      if (balances[payer] !== undefined) balances[payer] += exp.amount;

      const splitParticipants = exp.splitWith && exp.splitWith.length > 0 ? exp.splitWith : group.members;
      const share = exp.amount / splitParticipants.length;

      splitParticipants.forEach(userIdObj => {
        const debtor = userIdObj.toString();
        if (balances[debtor] !== undefined) {
          balances[debtor] -= share;
        }
      });
    });

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

      if (Math.round(settledAmount) > 0) {
        simpleSettlementPaths.push({
          from: debtor.user.name,
          fromId: debtor.user._id,
          to: creditor.user.name,
          toId: creditor.user._id,
          amount: Math.round(settledAmount)
        });
      }

      creditor.amount -= settledAmount;
      debtor.amount -= settledAmount;

      if (Math.round(creditor.amount) <= 0) cIdx++;
      if (Math.round(debtor.amount) <= 0) dIdx++;
    }

    res.status(200).json({
      netBalances: balances,
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
    const group = await Group.findOne({ inviteToken: token });

    if (!group) {
      return res.status(404).json({ message: 'Invite link is invalid or expired.' });
    }

    const userEmail = req.user.email.toLowerCase();
    const userId = req.user.id;

    if (group.pendingInvites.includes(userEmail)) {
      group.pendingInvites = group.pendingInvites.filter(e => e !== userEmail);
    }

    if (!group.members.some(id => id.toString() === userId.toString())) {
      group.members.push(userId);
      if (!group.activityLog) group.activityLog = [];
      group.activityLog.push({ text: req.user.name + ' joined via link.' });
      await group.save();
    }

    res.status(200).json({ message: `Successfully joined ${group.name}!`, groupId: group._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};