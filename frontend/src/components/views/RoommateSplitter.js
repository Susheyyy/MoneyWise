import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  useGetGroupsQuery,
  useCreateGroupMutation,
  useAddSharedExpenseMutation,
  useGetSettlementSummaryQuery,
  useAddMembersAfterFactMutation,
  useEditGroupMetadataMutation,
  useRemoveGroupMatrixMutation
} from '../../features/groups/groupApi';
import { getErrorMessage } from '../../utils/errorHandler';
import { useTheme } from '../../context/ThemeContext';

const RoommateSplitter = () => {
  const { theme, colors } = useTheme();
  const currentUser = useSelector((state) => state.auth.user);
  const { data: groups = [], refetch } = useGetGroupsQuery();
  
  const [createGroup] = useCreateGroupMutation();
  const [addExpense] = useAddSharedExpenseMutation();
  const [addMembersAfterFact] = useAddMembersAfterFactMutation();
  const [editGroupMetadata] = useEditGroupMetadataMutation();
  const [removeGroupMatrix] = useRemoveGroupMatrixMutation();

  const [activeGroupId, setActiveGroupId] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [splitMode, setSplitMode] = useState('equal');
  
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [groupName, setGroupName] = useState('');
  const [editNameInput, setEditNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [stagedEmails, setStagedEmails] = useState([]);
  const [appendEmailInput, setAppendEmailInput] = useState('');

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [customRatios, setCustomRatios] = useState({});
  
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  useEffect(() => {
    if (groups.length > 0 && !activeGroupId) {
      setActiveGroupId(groups[0]._id);
    }
  }, [groups, activeGroupId]);

  const currentGroup = groups.find(g => g._id === activeGroupId);

  useEffect(() => {
    if (currentGroup) {
      setEditNameInput(currentGroup.name);
    }
    setIsDeleteConfirming(false);
  }, [currentGroup]);

  useEffect(() => {
    if (currentGroup?.members) {
      setSelectedParticipants(currentGroup.members.map(m => m._id.toString()));
    }
  }, [showExpenseModal, currentGroup]);

  const { data: summary = { netBalances: {}, simplestWayToSettle: [], activityLog: [] } } = 
    useGetSettlementSummaryQuery(activeGroupId, { skip: !activeGroupId });

  const uiColors = {
    tealPrimary: colors.tealPrimary,
    tealDark: colors.textDark,
    border: colors.border,
    white: colors.white,
    bgMain: colors.background,
    greenText: colors.green,
    greenBg: theme === 'Dark' ? 'rgba(29, 158, 117, 0.15)' : '#E1F5EE',
    redText: colors.red,
    redBg: theme === 'Dark' ? 'rgba(217, 83, 79, 0.15)' : '#FCEBEB',
    textMuted: colors.textMuted,
    bannerGreenGrad: theme === 'Dark' ? 'linear-gradient(135deg, #1A282A 0%, #2A484C 51%, #1A282A 100%)' : 'linear-gradient(135deg, #1D292B 0%, #628B91 51%, #1D292B 100%)',
    avatarBg: ['#D6EAF8', '#D5F5E3', '#FCF3CF', '#FEDBB6', '#E8DAEF']
  };

  const showNotification = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  const handleToggleParticipant = (memberId) => {
    if (selectedParticipants.includes(memberId)) {
      if (selectedParticipants.length === 1) {
        showNotification('An expense must include at least one roommate.', 'error');
        return;
      }
      setSelectedParticipants(selectedParticipants.filter(id => id !== memberId));
    } else {
      setSelectedParticipants([...selectedParticipants, memberId]);
    }
  };

  const handleStageEmail = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    const targetEmail = emailInput.trim().toLowerCase();
    if (stagedEmails.includes(targetEmail)) {
      showNotification('Member email is already staged.', 'error');
      return;
    }
    setStagedEmails([...stagedEmails, targetEmail]);
    setEmailInput('');
  };

  const handleGroupSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    try {
      await createGroup({ name: groupName.trim(), members: stagedEmails }).unwrap();
      showNotification('Group configured successfully.', 'success');
      setShowAddForm(false);
      setGroupName('');
      setStagedEmails([]);
      refetch();
    } catch (err) { 
      showNotification(getErrorMessage(err, 'Error configuring group workspace.'), 'error');
    }
  };

  const handleAppendMembers = async (e) => {
    e.preventDefault();
    if (!appendEmailInput.trim()) return;
    try {
      await addMembersAfterFact({ groupId: activeGroupId, emails: [appendEmailInput.trim().toLowerCase()] }).unwrap();
      showNotification('Member invitation processed successfully.', 'success');
      setAppendEmailInput('');
      setShowEditModal(false);
      refetch();
    } catch (err) {
      showNotification(getErrorMessage(err, 'Error updating member lists.'), 'error');
    }
  };

  const handleEditGroupName = async (e) => {
    e.preventDefault();
    if (!editNameInput.trim()) return;
    try {
      await editGroupMetadata({ groupId: activeGroupId, name: editNameInput.trim() }).unwrap();
      showNotification('Group title modified successfully.', 'success');
      setShowEditModal(false);
      refetch();
    } catch (err) {
      showNotification(getErrorMessage(err, 'Failed modification routine.'), 'error');
    }
  };

  const handleConfirmedDeleteGroup = async () => {
    try {
      await removeGroupMatrix(activeGroupId).unwrap();
      showNotification('Group dismantled cleanly.', 'success');
      setShowEditModal(false);
      setIsDeleteConfirming(false);
      setActiveGroupId('');
      refetch();
    } catch (err) {
      showNotification(getErrorMessage(err, 'Deletion prohibited.'), 'error');
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    let splitPayload = [];
    
    if (splitMode === 'equal') {
      const equalPercentage = 100 / selectedParticipants.length;
      splitPayload = selectedParticipants.map(id => ({
        user: id,
        ratio: equalPercentage,
        amountOwed: Number(amount) / selectedParticipants.length
      }));
    } else {
      const activeRatioIds = selectedParticipants.filter(id => Number(customRatios[id] || 0) > 0);
      
      if (activeRatioIds.length === 0) {
        showNotification('Please allocate percentages to selected members.', 'error');
        return;
      }

      const totalRatio = activeRatioIds.reduce((sum, id) => sum + Number(customRatios[id] || 0), 0);
      if (totalRatio !== 100) {
        showNotification('Total proportions must equal exactly 100% (Current: ' + totalRatio + '%).', 'error');
        return;
      }

      splitPayload = activeRatioIds.map(id => ({
        user: id,
        ratio: Number(customRatios[id] || 0),
        amountOwed: Number(amount) * (Number(customRatios[id] || 0) / 100)
      }));
    }

    try {
      await addExpense({ 
        groupId: activeGroupId, 
        description: title.trim(), 
        amount: Number(amount), 
        splitMode, 
        splitWith: splitPayload 
      }).unwrap();
      
      showNotification('Shared bill logged.', 'success');
      setTitle('');
      setAmount('');
      setCustomRatios({});
      setShowExpenseModal(false);
      refetch();
    } catch (err) { 
      console.error(err);
      showNotification(getErrorMessage(err, 'Could not post shared split.'), 'error');
    }
  };

  const getInitials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  const userNetGlobal = summary?.netBalances?.[currentUser?._id] || 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 340px', background: uiColors.bgMain, height: 'calc(100vh - 64px)', width: '100%', fontFamily: "'Montserrat', sans-serif", overflow: 'hidden', position: 'relative' }}>
      
      {toast.show && (
        <div style={{ position: 'fixed', top: '84px', right: '24px', background: toast.type === 'success' ? uiColors.greenBg : uiColors.redBg, borderLeft: `4px solid ${toast.type === 'success' ? uiColors.greenText : uiColors.redText}`, padding: '14px 24px', borderRadius: '8px', boxShadow: '0 8px 24px rgba(30,51,54,0.12)', zIndex: 10000, color: toast.type === 'success' ? uiColors.greenText : uiColors.redText, fontWeight: 600, fontSize: '0.85rem' }}>
          <span>{toast.message}</span>
        </div>
      )}

      {showExpenseModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(30, 51, 54, 0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: uiColors.white, padding: '28px', borderRadius: '16px', width: '440px', border: `1px solid ${uiColors.border}`, boxShadow: '0 12px 36px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: uiColors.tealPrimary }}>LOG SHARED EXPENSE</span>
              <span onClick={() => setShowExpenseModal(false)} style={{ cursor: 'pointer', fontWeight: 'bold', color: uiColors.textMuted }}>✕</span>
            </div>
            <form onSubmit={handleExpenseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input type="text" placeholder="Bill Title (e.g. WiFi)" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: '100%', padding: '10px 12px', border: `1px solid ${uiColors.border}`, borderRadius: '8px', fontSize: '12px', boxSizing: 'border-box' }} />
              <input type="number" placeholder="Amount (₹)" value={amount} onChange={(e) => setAmount(e.target.value)} required style={{ width: '100%', padding: '10px 12px', border: `1px solid ${uiColors.border}`, borderRadius: '8px', fontSize: '12px', boxSizing: 'border-box' }} />
              
              <div style={{ display: 'flex', gap: '4px', background: uiColors.bgMain, padding: '4px', borderRadius: '8px' }}>
                <button type="button" onClick={() => setSplitMode('equal')} style={{ flex: 1, border: 'none', background: splitMode === 'equal' ? '#fff' : 'transparent', padding: '6px', fontSize: '11px', fontWeight: 600, borderRadius: '6px', cursor: 'pointer' }}>Equal</button>
                <button type="button" onClick={() => setSplitMode('ratio')} style={{ flex: 1, border: 'none', background: splitMode === 'ratio' ? '#fff' : 'transparent', padding: '6px', fontSize: '11px', fontWeight: 600, borderRadius: '6px', cursor: 'pointer' }}>Ratios</button>
              </div>

              <div style={{ margin: '6px 0', border: `1px solid ${uiColors.border}`, borderRadius: '8px', padding: '10px', maxHeight: '160px', overflowY: 'auto' }}>
                <span style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: uiColors.textMuted, marginBottom: '8px', letterSpacing: '0.5px' }}>SELECT ROOMMATES TO SPLIT WITH</span>
                
                {currentGroup?.members?.map(m => {
                  const isChecked = selectedParticipants.includes(m._id.toString());
                  return (
                    <div key={m._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${uiColors.bgMain}` }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: uiColors.tealPrimary, fontWeight: 500, cursor: 'pointer', width: '100%' }}>
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          onChange={() => handleToggleParticipant(m._id.toString())}
                          style={{ accentColor: uiColors.tealPrimary, cursor: 'pointer' }}
                        />
                        <span style={{ opacity: isChecked ? 1 : 0.5 }}>{m.name}</span>
                      </label>

                      
                      {splitMode === 'ratio' && isChecked && (
                        <input 
                          type="number" 
                          placeholder="%" 
                          value={customRatios[m._id] || ''} 
                          onChange={(e) => setCustomRatios({ ...customRatios, [m._id]: e.target.value })} 
                          style={{ width: '60px', padding: '4px 8px', border: `1px solid ${uiColors.border}`, borderRadius: '6px', fontSize: '11px', textAlign: 'right' }} 
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <button type="submit" style={{ width: '100%', padding: '12px', background: uiColors.tealPrimary, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', textTransform: 'uppercase' }}>Compute Split</button>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(30, 51, 54, 0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: uiColors.white, padding: '32px', borderRadius: '16px', width: '400px', border: `1px solid ${uiColors.border}`, boxShadow: '0 12px 36px rgba(0,0,0,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: uiColors.tealPrimary, letterSpacing: '1px' }}>GROUP SETTINGS</span>
              <span onClick={() => { setShowEditModal(false); setIsDeleteConfirming(false); }} style={{ cursor: 'pointer', fontWeight: 'bold', color: uiColors.textMuted, fontSize: '14px' }}>✕</span>
            </div>
            {!isDeleteConfirming ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: uiColors.tealPrimary, marginBottom: '8px', letterSpacing: '0.3px' }}>RENAME GROUP</label>
                  <form onSubmit={handleEditGroupName} style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" value={editNameInput} onChange={(e) => setEditNameInput(e.target.value)} required style={{ flex: 1, padding: '10px 12px', border: `1px solid ${uiColors.border}`, borderRadius: '8px', fontSize: '12px', outline: 'none', background: uiColors.bgMain }} />
                    <button type="submit" style={{ padding: '0 16px', background: uiColors.greenText, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>Update</button>
                  </form>
                </div>
                <div style={{ height: '1px', backgroundColor: uiColors.border }} />
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: uiColors.tealPrimary, marginBottom: '8px', letterSpacing: '0.3px' }}>ADD MEMBER</label>
                  <form onSubmit={handleAppendMembers} style={{ display: 'flex', gap: '8px' }}>
                    <input type="email" placeholder="friend-email@gmail.com" value={appendEmailInput} onChange={(e) => setAppendEmailInput(e.target.value)} required style={{ flex: 1, padding: '10px 12px', border: `1px solid ${uiColors.border}`, borderRadius: '8px', fontSize: '12px', outline: 'none', background: uiColors.bgMain }} />
                    <button type="submit" style={{ padding: '0 16px', background: uiColors.tealPrimary, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>Invite</button>
                  </form>
                </div>
                <div style={{ height: '1px', backgroundColor: uiColors.border }} />
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: uiColors.tealPrimary, marginBottom: '8px', letterSpacing: '0.3px' }}>SHARE INVITE LINK</label>
                  <button type="button" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/join-group/${currentGroup.inviteToken}`); showNotification('Invite link copied to clipboard.', 'success'); setShowEditModal(false); }} style={{ width: '100%', padding: '12px', background: uiColors.bgMain, border: `1px solid ${uiColors.border}`, color: uiColors.tealPrimary, borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textAlign: 'center' }}>Copy Invitation Link URL</button>
                </div>
                <div style={{ height: '1px', backgroundColor: uiColors.border, marginTop: '4px' }} />
                <button type="button" onClick={() => setIsDeleteConfirming(true)} style={{ width: '100%', padding: '12px', background: 'rgba(163,45,45,0.05)', color: uiColors.redText, border: `1px solid rgba(163,45,45,0.15)`, borderRadius: '8px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', cursor: 'pointer' }}>Delete Group Permanently</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '10px 0' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: uiColors.tealPrimary }}>Dissolve group workspace?</div>
                <div style={{ fontSize: '11px', color: uiColors.textMuted, lineHeight: '1.5' }}>This action cannot be undone and will erase all recorded expense balances.</div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button onClick={() => setIsDeleteConfirming(false)} style={{ flex: 1, padding: '12px', background: uiColors.bgMain, color: uiColors.tealPrimary, border: `1px solid ${uiColors.border}`, borderRadius: '8px', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={handleConfirmedDeleteGroup} style={{ flex: 1, padding: '12px', background: uiColors.redText, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', textTransform: 'uppercase' }}>Confirm Delete</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ background: uiColors.white, padding: '24px', borderRight: `1px solid ${uiColors.border}`, display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: uiColors.tealPrimary, letterSpacing: '1px' }}>YOUR GROUPS</span>
          <button onClick={() => setShowAddForm(!showAddForm)} style={{ background: uiColors.bgMain, border: 'none', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{showAddForm ? '✕' : '＋'}</button>
        </div>
        {showAddForm ? (
          <form onSubmit={handleGroupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: uiColors.bgMain, padding: '16px', borderRadius: '12px', border: `1px solid ${uiColors.border}`, boxSizing: 'border-box', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: uiColors.tealPrimary }}>NEW GROUP SETUP</span>
              <span onClick={() => { setShowAddForm(false); setStagedEmails([]); }} style={{ cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: uiColors.redText }}>Cancel</span>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: uiColors.tealPrimary, marginBottom: '6px' }}>GROUP NAME</label>
              <input type="text" placeholder="e.g., Room 204 Squad" value={groupName} onChange={(e) => setGroupName(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: `1px solid ${uiColors.border}`, borderRadius: '8px', fontSize: '12px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: uiColors.tealPrimary, marginBottom: '6px' }}>INVITE VIA GMAIL</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input type="email" placeholder="friend@gmail.com" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: `1px solid ${uiColors.border}`, borderRadius: '8px', fontSize: '12px', boxSizing: 'border-box' }} />
                <button type="button" onClick={handleStageEmail} style={{ width: '100%', padding: '10px', background: uiColors.tealPrimary, color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Stage Member</button>
              </div>
            </div>
            {stagedEmails.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: `1px solid ${uiColors.border}`, paddingTop: '12px' }}>
                <span style={{ fontSize: '9px', fontWeight: 700, color: uiColors.textMuted }}>STAGED FRIENDS ({stagedEmails.length})</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '80px', overflowY: 'auto' }}>
                  {stagedEmails.map(email => (
                    <div key={email} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: uiColors.white, border: `1px solid ${uiColors.border}`, padding: '4px 8px', borderRadius: '6px', fontSize: '10px', color: uiColors.tealPrimary }}>
                      <span>{email}</span>
                      <span onClick={() => setStagedEmails(stagedEmails.filter(e => e !== email))} style={{ cursor: 'pointer', fontWeight: 700, color: uiColors.redText }}>✕</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button type="submit" style={{ width: '100%', padding: '12px', background: uiColors.greenText, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', boxSizing: 'border-box' }}>Create Group</button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {groups.map(g => (
              <div key={g._id} onClick={() => setActiveGroupId(g._id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '10px', background: activeGroupId === g._id ? '#EEF4F4' : 'transparent', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: uiColors.tealPrimary }}>{g.name}</div>
                  <div style={{ fontSize: '10px', color: uiColors.textMuted, marginTop: '2px' }}>{g.members?.length || 1} members</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '30px', overflowY: 'auto' }}>
        {currentGroup ? (
          <>
            <div style={{ background: uiColors.bannerGreenGrad, borderRadius: '20px', padding: '32px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', boxShadow: '0 4px 20px rgba(30,51,54,0.08)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', width: '80px', height: '80px', background: 'rgba(255,255,255,0.04)', transform: 'rotate(45deg)', top: '-20px', left: '25%' }} />
              <div style={{ position: 'absolute', width: '150px', height: '150px', background: 'rgba(255,255,255,0.02)', borderRadius: '50%', bottom: '-50px', left: '40%' }} />
              <div>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#5DCAA5', fontWeight: 700, letterSpacing: '1.5px' }}>{currentGroup.members?.length} {currentGroup.members?.length === 1 ? 'MEMBER' : 'MEMBERS'}</span>
                <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '2.4rem', fontWeight: 500, color: '#ffffff', textAlign: 'left', margin: '6px 0 0 0', textTransform: 'uppercase' }}>{currentGroup.name}</h1>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', marginTop: '8px', fontWeight: 500 }}>₹{(currentGroup.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0).toLocaleString()} total spent</div>
                <div style={{ display: 'flex', gap: '4px', marginTop: '20px' }}>
                  {currentGroup.members?.map((m, idx) => (
                    <div key={m._id} title={m.name} style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: uiColors.avatarBg[idx % 5], border: '2px solid #1D292B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#1D292B' }}>{getInitials(m.name)}</div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end', marginTop: '16px', position: 'relative', zIndex: 2 }}>
                <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)', padding: '14px 20px', borderRadius: '14px', textAlign: 'right', minWidth: '150px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '10px', color: '#5DCAA5', fontWeight: 700 }}>{userNetGlobal >= 0 ? 'YOU ARE OWED' : 'YOU OWE'}</div>
                  <div style={{ fontSize: '1.8rem', fontFamily: "'Oswald', sans-serif", fontWeight: 600, marginTop: '2px' }}>₹{Math.abs(userNetGlobal).toLocaleString()}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={() => setShowExpenseModal(true)} style={{ background: '#5DCAA5', color: '#1D292B', border: 'none', padding: '10px 24px', borderRadius: '20px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', transition: '0.15s', boxShadow: '0 4px 12px rgba(93,202,165,0.25)' }}>Add Expense</button>
                  <button onClick={() => setShowEditModal(true)} title="Open Workspace Settings" style={{ background: 'rgba(255,255,255,0.08)', width: '36px', height: '36px', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5DCAA5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${uiColors.border}`, paddingBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: uiColors.tealPrimary }}>Shared expenses</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {currentGroup.expenses?.map((exp, idx) => (
                <div key={idx} style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: `1px solid ${uiColors.border}`, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: uiColors.tealPrimary }}>{exp.description}</div>
                      <div style={{ fontSize: '11px', color: uiColors.textMuted, marginTop: '4px' }}>
                        <span>Paid by {currentGroup.members.find(m => m._id === exp.paidBy)?.name || 'Flatmate'}</span>
                      </div>
                    </div>
                    <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.6rem', fontWeight: 600, color: uiColors.tealPrimary }}>₹{exp.amount}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: uiColors.textMuted }}>Select or create an active group workspace matrix container loop.</div>
        )}
      </div>

      <div style={{ background: uiColors.white, padding: '24px', borderLeft: `1px solid ${uiColors.border}`, display: 'flex', flexDirection: 'column', gap: '28px', overflowY: 'auto' }}>
        <div>
          <span style={{ fontSize: '10px', fontWeight: 700, color: uiColors.textMuted }}>YOUR NET BALANCE</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '2.2rem', fontFamily: "'Oswald', sans-serif", fontWeight: 600, color: uiColors.tealPrimary }}>{userNetGlobal >= 0 ? `+₹${Math.abs(userNetGlobal)}` : `-₹${Math.abs(userNetGlobal)}`}</span>
            <span style={{ fontSize: '10px', fontWeight: 700, background: userNetGlobal >= 0 ? uiColors.greenBg : uiColors.redBg, color: userNetGlobal >= 0 ? uiColors.greenText : uiColors.redText, padding: '4px 8px', borderRadius: '6px' }}>{userNetGlobal >= 0 ? "You're owed" : "You owe"}</span>
          </div>
        </div>

        <div>
          <span style={{ fontSize: '10px', fontWeight: 700, color: uiColors.textMuted, textTransform: 'uppercase' }}>MEMBER BALANCES</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
            {currentGroup?.members?.map((m, idx) => {
              if (m._id === currentUser?._id) return null;
              const individualNet = summary?.netBalances?.[m._id] || 0;
              return (
                <div key={m._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${uiColors.bgMain}` }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: uiColors.avatarBg[idx % 5], fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', color: uiColors.tealDark }}>{getInitials(m.name)}</div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: uiColors.tealPrimary }}>{m.name}</div>
                      <div style={{ fontSize: '10px', color: individualNet >= 0 ? uiColors.greenText : uiColors.redText }}>{individualNet >= 0 ? 'owes you' : 'you owe'}</div>
                    </div>
                  </div>
                  <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.2rem', fontWeight: 600, color: uiColors.tealPrimary }}>₹{Math.abs(individualNet)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <span style={{ fontSize: '10px', fontWeight: 700, color: uiColors.textMuted, textTransform: 'uppercase' }}>SIMPLEST WAY TO SETTLE</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            {summary?.simplestWayToSettle?.map((path, idx) => (
              <div key={idx} style={{ background: uiColors.bgMain, borderRadius: '12px', padding: '14px', border: `1px solid ${uiColors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: uiColors.tealPrimary }}>{path.fromId === currentUser?._id ? `You pay ${path.to}` : `${path.from} pays you`}</div>
                <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.3rem', fontWeight: 600, color: uiColors.tealPrimary }}>₹{path.amount}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${uiColors.border}`, paddingTop: '20px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: uiColors.textMuted, textTransform: 'uppercase' }}>RECENT ACTIVITY</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
            {summary?.activityLog?.slice().reverse().slice(0, 4).map((log, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: uiColors.greenText, marginTop: '5px' }} />
                <div style={{ fontSize: '12px', color: uiColors.tealPrimary, fontWeight: 500 }}>{log.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default RoommateSplitter;