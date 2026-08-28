import React, { useState } from 'react';
import { useGetWalletsQuery } from '../../features/wallets/walletApi'; // Assumes walletApi endpoint handles available wallets fetch
import {
  useGetGoalsQuery,
  useCreateGoalMutation,
  useAddContributionMutation,
  useDeleteGoalMutation
} from '../../features/goals/goalApi';
import { getErrorMessage } from '../../utils/errorHandler';

const SavingsGoals = () => {
  // LIVE CORE QUERIES & MUTATIONS HOOKS
  const { data: dbGoals = [], isLoading: goalsLoading } = useGetGoalsQuery();
  const { data: dbWallets = [] } = useGetWalletsQuery();
  const [createGoal] = useCreateGoalMutation();
  const [addContribution] = useAddContributionMutation();
  const [deleteGoal] = useDeleteGoalMutation();

  const [activeTab, setActiveTab] = useState('all');
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  
  // Track selected object reference instead of strings to populate accurate sub-views
  const [selectedGoal, setSelectedGoal] = useState(null);

  // New Goal Input Field State Elements
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [monthlySavings, setMonthlySavings] = useState('');
  const [startDate, setStartDate] = useState('2026-06-10');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('Tech & gadgets');
  const [notes, setNotes] = useState('');

  // Contribution Input Field State Elements
  const [contributionAmount, setContributionAmount] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [contributionNote, setContributionNote] = useState('');

  const [toast, setToast] = useState({ show: false, message: '' });

  const uiColors = {
    tealPrimary: '#364C4F',
    tealDark: '#1E3336',
    border: '#E0E8E8',
    white: '#ffffff',
    accentGreen: '#1D9E75',
    textMuted: '#9BB5B8',
    textDark: '#1E3336',
    lightGreen: '#E1F5EE',
    darkGreen: '#085041',
    lightBlue: '#E6F1FB',
    darkBlue: '#185FA5'
  };

  const triggerToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 4000);
  };

  // MACRO SUMMARY CALCULATIONS STREAMED FROM DATABASE ARRAYS
  const activeGoals = dbGoals.filter(g => g.currentSaved < g.targetAmount);
  const completedGoals = dbGoals.filter(g => g.currentSaved >= g.targetAmount);
  
  const totalSavedAllTime = dbGoals.reduce((sum, g) => sum + g.currentSaved, 0);
  const totalStillNeeded = activeGoals.reduce((sum, g) => sum + (g.targetAmount - g.currentSaved), 0);
  const totalMonthlyCommitment = activeGoals.reduce((sum, g) => sum + g.monthlySavingsTarget, 0);

  // FILTERED COMPONENT MAPPING BALANCER
  const filteredGoals = dbGoals.filter(g => {
    if (activeTab === 'completed') return g.currentSaved >= g.targetAmount;
    if (activeTab === 'all') return true;
    
    const ratio = g.currentSaved / g.targetAmount;
    if (activeTab === 'on_track') return ratio >= 0.5 && g.currentSaved < g.targetAmount;
    if (activeTab === 'at_risk') return ratio < 0.5 && g.currentSaved < g.targetAmount;
    return true;
  });

const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      await createGoal({
        name: goalName,
        targetAmount: Number(targetAmount),
        monthlySavings: Number(monthlySavings), // <-- CHANGED TO MATCH FRONTEND HOOK STATE STREAMS
        category,
        startDate,
        targetDate: targetDate || undefined,
        notes
      }).unwrap();
      
      triggerToast('Savings target successfully cataloged in MongoDB!');
      setIsNewGoalModalOpen(false);
      setGoalName(''); setTargetAmount(''); setMonthlySavings(''); setNotes('');
    } catch (err) {
      // Shorthand error logger that intercepts actual raw Mongo validation failures
      triggerToast(getErrorMessage(err, 'Failed to save new objective vector.'));
    }
  };
  const handleAddContribution = async (e) => {
    e.preventDefault();
    if (!selectedWalletId) {
      triggerToast('Please pick a functional funding account.');
      return;
    }
    try {
      const targetWallet = dbWallets.find(w => w._id === selectedWalletId);
      const res = await addContribution({
        goalId: selectedGoal._id,
        amount: Number(contributionAmount),
        walletId: selectedWalletId,
        note: contributionNote
      }).unwrap();

      triggerToast(`Deposited ₹${Number(contributionAmount).toLocaleString('en-IN')} via ${targetWallet?.name}!`);
      setIsAddFundsModalOpen(false);
      setContributionAmount(''); setContributionNote('');
      
      // Keep selected document structure current with mutation results
      setSelectedGoal(res);
    } catch (err) {
      triggerToast(getErrorMessage(err, 'Transaction allocation refused by balance constraints.'));
    }
  };

  const handleClearGoal = async (id) => {
    if (window.confirm('Wipe this asset tracker profile? Operational records cannot be recovered.')) {
      try {
        await deleteGoal(id).unwrap();
        triggerToast('Objective tracking framework scrubbed.');
        setSelectedGoal(null);
      } catch (err) {
        triggerToast('Failed to drop data mapping properties.');
      }
    }
  };

  if (goalsLoading) {
    return <div style={{ padding: '40px', color: uiColors.tealPrimary, fontWeight: 600 }}>Syncing active goals collections matrix...</div>;
  }

  return (
    <div style={{ background: uiColors.white, padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: '32px', minHeight: '100vh', fontFamily: "'Montserrat', sans-serif" }}>
      
      {toast.show && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', background: uiColors.lightGreen, borderLeft: `4px solid ${uiColors.accentGreen}`, padding: '14px 24px', borderRadius: '8px', boxShadow: '0 8px 24px rgba(30,51,54,0.1)', zIndex: 10000, color: uiColors.darkGreen, fontWeight: 600, fontSize: '0.85rem' }}>
          <span>{toast.message}</span>
        </div>
      )}

      {!selectedGoal ? (
        <>
          {/* VIEW MODULE A: LIST MATRIX CORES */}
          <div style={{ display: 'flex', alignItems: 'center', justifyRules: 'space-between', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: uiColors.tealDark, textTransform: 'uppercase', letterSpacing: '0.8px', borderLeft: `3px solid ${uiColors.accentGreen}`, paddingLeft: '12px', marginBottom: '4px', margin: 0 }}>Savings Goals Matrix</h3>
              <div style={{ fontSize: '12px', color: uiColors.textMuted }}>Track multi-tier asset reserves, target projections, and compounding limits milestones</div>
            </div>
            <button onClick={() => setIsNewGoalModalOpen(true)} style={{ background: uiColors.tealDark, color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              + New Savings Goal
            </button>
          </div>

          {/* DYNAMIC SUMMARIES HUD PANEL GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', border: `1px solid ${uiColors.border}`, borderRadius: '12px', background: '#FAFCFC', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderRight: `1px solid ${uiColors.border}` }}>
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', color: uiColors.textMuted, textTransform: 'uppercase' }}>TOTAL SAVED</div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.8rem', fontWeight: 600, color: uiColors.tealDark, marginTop: '6px' }}>₹{totalSavedAllTime.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: '11px', color: uiColors.accentGreen, fontWeight: 500, marginTop: '2px' }}>Across {activeGoals.length} active goals</div>
            </div>
            <div style={{ padding: '20px', borderRight: `1px solid ${uiColors.border}` }}>
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', color: uiColors.textMuted, textTransform: 'uppercase' }}>STILL NEEDED</div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.8rem', fontWeight: 600, color: uiColors.tealDark, marginTop: '6px' }}>₹{totalStillNeeded.toLocaleString('en-IN')}</div>
            </div>
            <div style={{ padding: '20px', borderRight: `1px solid ${uiColors.border}` }}>
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', color: uiColors.textMuted, textTransform: 'uppercase' }}>MONTHLY SET ASIDE</div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.8rem', fontWeight: 600, color: uiColors.tealDark, marginTop: '6px' }}>₹{totalMonthlyCommitment.toLocaleString('en-IN')}</div>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', color: uiColors.textMuted, textTransform: 'uppercase' }}>COMPLETED ALL TIME</div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.8rem', fontWeight: 600, color: uiColors.accentGreen, marginTop: '6px' }}>{completedGoals.length} goals</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', borderBottom: `1px solid ${uiColors.border}`, paddingBottom: '12px' }}>
            {['all', 'on_track', 'at_risk', 'completed'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '6px 16px', borderRadius: '20px', border: 'none', fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: activeTab === tab ? uiColors.lightGreen : 'transparent', color: activeTab === tab ? uiColors.darkGreen : uiColors.tealPrimary }}>
                {tab.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>

          {/* DYNAMIC CARD GENERATION GRID */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredGoals.map((g) => {
              const currentPct = Math.round((g.currentSaved / g.targetAmount) * 100) || 0;
              return (
                <div key={g._id} onClick={() => setSelectedGoal(g)} style={{ border: `1px solid ${uiColors.border}`, borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', cursor: 'pointer', transition: 'all 0.2s' }} className="goal-card-hover">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: uiColors.textDark }}>{g.name}</div>
                      <div style={{ fontSize: '11px', color: uiColors.textMuted, marginTop: '2px' }}>{g.category} · <span style={{ color: currentPct >= 50 ? uiColors.accentGreen : '#BA7517', fontWeight: 600 }}>{currentPct >= 100 ? 'Completed' : currentPct >= 50 ? 'On track' : 'At risk'}</span></div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.15rem', fontWeight: 600, color: uiColors.textDark }}>₹{g.currentSaved.toLocaleString('en-IN')} <span style={{ fontSize: '11px', color: uiColors.textMuted, fontFamily: "'Montserrat'" }}>saved of ₹{g.targetAmount.toLocaleString('en-IN')}</span></div>
                      <div style={{ fontSize: '11px', color: uiColors.accentGreen, fontWeight: 500, marginTop: '2px' }}>₹{g.monthlySavingsTarget}/mo · {currentPct >= 100 ? 'Goal Met!' : `${Math.ceil((g.targetAmount - g.currentSaved) / (g.monthlySavingsTarget || 1))} months left`}</div>
                    </div>
                  </div>
                  <div style={{ height: '8px', background: '#F2F4F3', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                    <div style={{ width: `${Math.min(currentPct, 100)}%`, height: '100%', background: uiColors.accentGreen, borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {/* VIEW LEVEL B: DYNAMIC BREAKDOWN FOR SELECTING TARGET ELEMENT */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => setSelectedGoal(null)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: uiColors.tealPrimary, outline: 'none' }}>←</button>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: uiColors.textMuted, textTransform: 'uppercase' }}>Objective Focus Matrix</span>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: uiColors.tealDark }}>{selectedGoal.name}</h3>
              </div>
            </div>
            <button onClick={() => handleClearGoal(selectedGoal._id)} style={{ background: 'rgba(163,45,45,0.08)', color: uiColors.redText, border: 'none', padding: '6px 14px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>Drop Objective</button>
          </div>

          {/* HUD MONITOR CHIPS */}
          <div style={{ border: `1px solid ${uiColors.border}`, borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><span style={{ fontSize: '12px', color: uiColors.textMuted }}>{selectedGoal.category} · Notes: {selectedGoal.notes || 'None'}</span></div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '24px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: uiColors.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>RATIO REVOLUTION</div>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.6rem', fontWeight: 600, color: uiColors.tealDark }}>{Math.round((selectedGoal.currentSaved / selectedGoal.targetAmount) * 100)}%</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: uiColors.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>AGGREGATE HELD</div>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.6rem', fontWeight: 600, color: uiColors.tealDark }}>₹{selectedGoal.currentSaved.toLocaleString('en-IN')} <span style={{ fontSize: '12px', color: uiColors.textMuted, fontFamily: "'Montserrat'" }}>of ₹{selectedGoal.targetAmount.toLocaleString('en-IN')}</span></div>
                </div>
              </div>
            </div>
            <div style={{ height: '8px', background: '#F2F4F3', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (selectedGoal.currentSaved / selectedGoal.targetAmount) * 100)}%`, height: '100%', background: uiColors.accentGreen, borderRadius: '4px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.2fr 1fr', gap: '28px', alignItems: 'start' }}>
            
            {/* COLUMN 1: LIVE SERVER ASSIGNED MILESTONES FLAGS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: uiColors.textMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>MILESTONES</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingLeft: '4px' }}>
                <div style={{ opacity: selectedGoal.milestones?.quarterSaved?.isReached ? 1 : 0.4, display: 'flex', gap: '12px' }}>
                  <span style={{ color: uiColors.accentGreen, fontWeight: 700 }}>{selectedGoal.milestones?.quarterSaved?.isReached ? '✓' : '○'} 25%</span>
                  <div><div style={{ fontSize: '13px', fontWeight: 600 }}>Quarter Saved</div><div style={{ fontSize: '11px', color: uiColors.textMuted }}>{selectedGoal.milestones?.quarterSaved?.reachedAt ? new Date(selectedGoal.milestones.quarterSaved.reachedAt).toLocaleDateString() : 'Pending'}</div></div>
                </div>
                <div style={{ opacity: selectedGoal.milestones?.halfway?.isReached ? 1 : 0.4, display: 'flex', gap: '12px' }}>
                  <span style={{ color: uiColors.accentGreen, fontWeight: 700 }}>{selectedGoal.milestones?.halfway?.isReached ? '✓' : '○'} 50%</span>
                  <div><div style={{ fontSize: '13px', fontWeight: 600 }}>Halfway Index</div><div style={{ fontSize: '11px', color: uiColors.textMuted }}>{selectedGoal.milestones?.halfway?.reachedAt ? new Date(selectedGoal.milestones.halfway.reachedAt).toLocaleDateString() : 'Pending'}</div></div>
                </div>
                <div style={{ opacity: selectedGoal.milestones?.almostThere?.isReached ? 1 : 0.4, display: 'flex', gap: '12px' }}>
                  <span style={{ color: '#BA7517', fontWeight: 700 }}>{selectedGoal.milestones?.almostThere?.isReached ? '✓' : '○'} 75%</span>
                  <div><div style={{ fontSize: '13px', fontWeight: 600 }}>Almost There</div><div style={{ fontSize: '11px', color: uiColors.textMuted }}>{selectedGoal.milestones?.almostThere?.reachedAt ? new Date(selectedGoal.milestones.almostThere.reachedAt).toLocaleDateString() : 'Target focus milestone'}</div></div>
                </div>
              </div>
            </div>

            {/* COLUMN 2: REAL HISTORIC DROPS SUB-DOCUMENTS MATRIX */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: uiColors.textMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>CONTRIBUTIONS REVIEWS</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '280px', overflowY: 'auto' }}>
                {selectedGoal.contributions?.length === 0 ? (
                  <div style={{ fontSize: '12px', color: uiColors.textMuted, padding: '12px 0' }}>No wallet funding transfers logged yet.</div>
                ) : (
                  selectedGoal.contributions.map((c, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: uiColors.textMuted }}>{new Date(c.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                        <div>
                          <span style={{ fontWeight: 600, color: uiColors.textDark, display: 'block' }}>{c.note || 'Manual Deposit'}</span>
                          <span style={{ fontSize: '10px', color: uiColors.textMuted }}>via {c.walletName}</span>
                        </div>
                      </div>
                      <span style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 600, color: uiColors.darkGreen }}>+₹{c.amount}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COLUMN 3: ENGINE ESTIMATES PANEL BLOCK */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: uiColors.textMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>FORECAST</span>
              <div style={{ border: `1px solid ${uiColors.border}`, borderRadius: '12px', padding: '20px', background: '#FAFCFC', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.4rem', fontWeight: 600, color: uiColors.tealDark }}>
                    {selectedGoal.currentSaved >= selectedGoal.targetAmount ? 'COMPLETED!' : `~${Math.ceil((selectedGoal.targetAmount - selectedGoal.currentSaved) / (selectedGoal.monthlySavingsTarget || 1))} Months Remaining`}
                  </div>
                  <div style={{ fontSize: '11px', color: uiColors.textMuted, marginTop: '2px' }}>Based on consistent ₹{selectedGoal.monthlySavingsTarget}/mo target burn ratios.</div>
                </div>
                <button onClick={() => setIsAddFundsModalOpen(true)} disabled={selectedGoal.currentSaved >= selectedGoal.targetAmount} style={{ width: '100%', background: uiColors.lightGreen, color: uiColors.darkGreen, border: 'none', padding: '12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', opacity: selectedGoal.currentSaved >= selectedGoal.targetAmount ? 0.5 : 1 }}>
                  Add funds
                </button>
              </div>
            </div>

          </div>
        </>
      )}

      {/* NEW OBJECTIVE ENTRY WINDOW MODAL */}
      {isNewGoalModalOpen && (
        <>
          <div onClick={() => setIsNewGoalModalOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(30,51,54,0.45)', backdropFilter: 'blur(3px)', zIndex: 5000 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '460px', background: uiColors.white, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.18)', zIndex: 5001 }}>
            <div style={{ background: uiColors.accentGreen, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.15rem', fontWeight: 500, color: '#fff', textTransform: 'uppercase' }}>New Savings Goal</span>
              <span onClick={() => setIsNewGoalModalOpen(false)} style={{ cursor: 'pointer', color: '#fff', fontWeight: 'bold' }}>✕</span>
            </div>
            <form onSubmit={handleCreateGoal} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: uiColors.textMuted, marginBottom: '5px' }}>Goal Name</label>
                <input type="text" placeholder="e.g. MacBook Air, Emergency Reserves..." value={goalName} onChange={(e) => setGoalName(e.target.value)} required style={{ width: '100%', padding: '11px 14px', border: `1px solid ${uiColors.border}`, borderRadius: '8px', fontSize: '13px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: uiColors.textMuted, marginBottom: '5px' }}>Target Amount</label>
                  <input type="number" placeholder="₹0" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} required style={{ width: '100%', padding: '11px 14px', border: `1px solid ${uiColors.border}`, borderRadius: '8px', fontSize: '14px', fontWeight: 600 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: uiColors.textMuted, marginBottom: '5px' }}>Monthly Targets</label>
                  <input type="number" placeholder="₹0" value={monthlySavings} onChange={(e) => setMonthlySavings(e.target.value)} required style={{ width: '100%', padding: '11px 14px', border: `1px solid ${uiColors.border}`, borderRadius: '8px', fontSize: '14px', fontWeight: 600 }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: uiColors.textMuted, marginBottom: '5px' }}>Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: `1px solid ${uiColors.border}`, borderRadius: '8px', fontSize: '12px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: uiColors.textMuted, marginBottom: '5px' }}>Target Date</label>
                  <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: `1px solid ${uiColors.border}`, borderRadius: '8px', fontSize: '12px' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: uiColors.textMuted, marginBottom: '5px' }}>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '11px 14px', border: `1px solid ${uiColors.border}`, borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <option>Tech & gadgets</option>
                  <option>Travel & vacations</option>
                  <option>Emergency core fund</option>
                  <option>Education investments</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: uiColors.textMuted, marginBottom: '5px' }}>Notes</label>
                <input type="text" placeholder="Why this goal matters..." value={notes} onChange={(e) => setNotes(e.target.value)} style={{ width: '100%', padding: '11px 14px', border: `1px solid ${uiColors.border}`, borderRadius: '8px', fontSize: '13px' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <button type="button" onClick={() => setIsNewGoalModalOpen(false)} style={{ padding: '12px 22px', background: '#F2F4F3', color: '#6B8B8E', border: 'none', borderRadius: '24px', fontSize: '13px', fontWeight: 600 }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', background: uiColors.accentGreen, color: '#fff', border: 'none', borderRadius: '24px', fontSize: '13px', fontWeight: 600 }}>Create goal</button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* DYNAMIC COMPONENT: CENTRED CONTRIB OVERLAY PANEL FORM */}
      {isAddFundsModalOpen && (
        <>
          <div onClick={() => setIsAddFundsModalOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(30,51,54,0.45)', backdropFilter: 'blur(3px)', zIndex: 6000 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '460px', backgroundColor: uiColors.white, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.2)', zIndex: 6001 }}>
            
            <div style={{ background: uiColors.accentGreen, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.15rem', fontWeight: 500, color: '#fff', textTransform: 'uppercase' }}>ADD TO — {selectedGoal.name}</span>
              <span onClick={() => setIsAddFundsModalOpen(false)} style={{ cursor: 'pointer', color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>✕</span>
            </div>

            <form onSubmit={handleAddContribution} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ background: '#F0FAF6', borderRadius: '10px', padding: '14px 16px', border: '1px solid #CBEFDF' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#0F6E56', textTransform: 'uppercase', marginBottom: '6px' }}>GOAL PROGRESS AFTER ADDING</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '12px', color: uiColors.textMuted }}>₹{selectedGoal.currentSaved.toLocaleString('en-IN')} saved</span>
                  <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.3rem', fontWeight: 600, color: uiColors.tealDark }}>₹{(selectedGoal.currentSaved + Number(contributionAmount || 0)).toLocaleString('en-IN')}</span>
                  <span style={{ fontSize: '12px', color: uiColors.textMuted }}>of ₹{selectedGoal.targetAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: uiColors.textMuted, marginBottom: '6px' }}>AMOUNT</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '16px', fontSize: '1.8rem', fontFamily: "'Oswald', sans-serif", color: uiColors.tealDark }}>₹</span>
                  <input type="number" placeholder="0" value={contributionAmount} onChange={(e) => setContributionAmount(e.target.value)} required style={{ width: '100%', padding: '14px 14px 14px 34px', border: `1px solid ${uiColors.border}`, borderRadius: '8px', fontSize: '1.8rem', fontFamily: "'Oswald', sans-serif', fontWeight: 500" }} />
                </div>
              </div>

              {/* DYNAMIC SYSTEM CHIPS PILLS STREAMED FROM MONGODB USER WALLETS COLLECTION */}
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: uiColors.textMuted, marginBottom: '8px' }}>SOURCE WALLET</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {dbWallets.length === 0 ? (
                    <span style={{ fontSize: '11px', color: uiColors.redText }}>No funding wallets created on server. Configure wallets first.</span>
                  ) : (
                    dbWallets.map((wallet) => {
                      const isSelected = selectedWalletId === wallet._id;
                      return (
                        <button key={wallet._id} type="button" onClick={() => setSelectedWalletId(wallet._id)} style={{ padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: isSelected ? '#E1F5EE' : '#FAFCFC', color: isSelected ? '#0F6E56' : uiColors.tealPrimary, border: isSelected ? '1px solid #9FE1CB' : `1px solid ${uiColors.border}` }}>
                          {wallet.name} ₹{wallet.balance?.toLocaleString('en-IN')}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: uiColors.textMuted, marginBottom: '6px' }}>NOTE (OPTIONAL)</label>
                <input type="text" placeholder="e.g. Monthly transfer, bonus, gift..." value={contributionNote} onChange={(e) => setContributionNote(e.target.value)} style={{ width: '100%', padding: '12px 14px', border: `1px solid ${uiColors.border}`, borderRadius: '8px', fontSize: '13px' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsAddFundsModalOpen(false)} style={{ padding: '12px 24px', background: '#F2F4F3', color: '#6B8B8E', border: 'none', borderRadius: '24px', fontSize: '13px', fontWeight: 600 }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', background: uiColors.accentGreen, color: '#fff', border: 'none', borderRadius: '24px', fontSize: '13px', fontWeight: 600 }}>Add contribution</button>
              </div>

            </form>
          </div>
        </>
      )}

    </div>
  );
};

export default SavingsGoals;