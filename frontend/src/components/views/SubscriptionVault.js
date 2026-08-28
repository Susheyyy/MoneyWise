import React, { useState, useEffect, useRef } from 'react';
import { 
  useGetSubscriptionsQuery, 
  useAddSubscriptionMutation, 
  useToggleSubscriptionStatusMutation,
  useDeleteSubscriptionMutation,
  useEditSubscriptionMutation
} from '../../features/subscriptions/subscriptionApi';
import { getErrorMessage } from '../../utils/errorHandler';

const SubscriptionRow = ({ sub, colors, mapCategoryIcons, getCategoryThemeColor, getDaysRemainingText, toggleStatus, handleInitiateEditMode, setDeleteTargetId }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const categoryColor = getCategoryThemeColor(sub.category);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  return (
    <div style={{ background: colors.white, borderRadius: '14px', border: `0.5px solid ${colors.border}`, padding: '14px 18px', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'visible', opacity: sub.isActive ? 1 : 0.75 }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: categoryColor }} />
      
      <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: `${categoryColor}12`, color: categoryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '14px', flexShrink: 0 }}>
        {mapCategoryIcons(sub.category)}
      </div>
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: colors.textDark }}>{sub.name}</div>
        <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px' }}>
          {sub.category} · <span style={{ textTransform: 'capitalize', fontSize: '10px' }}>{sub.billingCycle} loop</span>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '12px', overflow: 'visible' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.25rem', fontWeight: 600, color: colors.textDark }}>₹{sub.amount}</div>
        </div>
        
        <div style={{ width: '70px', textAlign: 'center', background: sub.isActive ? colors.bgLight : '#E8EEEE', color: sub.isActive ? colors.textPrimary : '#B4B2A9', padding: '4px 0', borderRadius: '8px', fontSize: '11px', fontWeight: 600 }}>
          {sub.isActive ? getDaysRemainingText(sub.nextBillingDate) : 'Paused'}
        </div>

        <label style={{ position: 'relative', display: 'inline-block', width: '36px', height: '20px', cursor: 'pointer', flexShrink: 0 }}>
          <input type="checkbox" checked={sub.isActive} onChange={() => toggleStatus(sub._id)} style={{ opacity: 0, width: 0, height: 0 }} />
          <span style={{ position: 'absolute', inset: 0, backgroundColor: sub.isActive ? colors.successText : '#D6DCDC', borderRadius: '20px', transition: '0.2s', display: 'block' }}>
            <span style={{ position: 'absolute', left: sub.isActive ? '18px' : '3px', bottom: '3px', backgroundColor: colors.white, width: '14px', height: '14px', borderRadius: '50%', transition: '0.2s' }} />
          </span>
        </label>

        <div ref={menuRef} style={{ position: 'relative', display: 'inline-block', overflow: 'visible' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px', fontSize: '16px', color: colors.textMuted, fontWeight: 'bold', outline: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ⋮
          </button>

          {showMenu && (
            <div style={{ position: 'absolute', right: 0, top: '28px', backgroundColor: colors.white, borderRadius: '8px', border: `0.5px solid ${colors.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', zIndex: 100, width: '110px', padding: '4px 0' }}>
              <button 
                onClick={() => { setShowMenu(false); handleInitiateEditMode(sub); }}
                style={{ width: '100%', border: 'none', background: 'none', padding: '8px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: colors.textPrimary, cursor: 'pointer' }}
              >
                Edit Details
              </button>
              <button 
                onClick={() => { setShowMenu(false); setDeleteTargetId(sub._id); }} 
                style={{ width: '100%', border: 'none', background: 'none', padding: '8px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: colors.redText, cursor: 'pointer' }}
              >
                Delete Plan
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

const SubscriptionVault = () => {
  const { data: subscriptions = [], isLoading } = useGetSubscriptionsQuery();
  const [addSubscription, { isLoading: isAdding }] = useAddSubscriptionMutation();
  const [toggleStatus] = useToggleSubscriptionStatusMutation();
  const [deleteSubscription] = useDeleteSubscriptionMutation();
  const [editSubscription] = useEditSubscriptionMutation();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);  
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  const [newSubData, setNewSubData] = useState({
    name: '', amount: '', category: 'Streaming & Video', billingCycle: 'monthly', nextBillingDate: ''
  });

  const colors = {
    darkTeal: '#1E3336', border: '#E0E8E8', white: '#ffffff', bgLight: '#EEF2F2',
    textPrimary: '#364C4F', textMuted: '#9BB5B8', textDark: '#1E3336',
    successBg: '#E1F5EE', successText: '#0F6E56', amberBg: '#FAEEDA', 
    amberText: '#633806', redBg: '#FCEBEB', redText: '#791F1F'
  };

  const showNotification = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 3500);
  };

  const getCategoryThemeColor = (category) => {
    switch (category) {
      case 'Streaming & Video': return '#A32D2D';
      case 'Music & Podcasts': return '#0F6E56';
      case 'Fitness & Health': return '#BA7517';
      case 'AI & Coding Tools': return '#185FA5';
      case 'Study & Productivity': return '#3B6D11';
      case 'Cloud & Storage': return '#534AB7';
      default: return '#6B8B8E';
    }
  };

  if (isLoading) {
    return <div style={{ padding: '40px', color: colors.darkTeal, fontWeight: '600' }}>Synchronizing upcoming renewals...</div>;
  }

  const activePlans = subscriptions.filter(s => s.isActive);
  const pausedPlans = subscriptions.filter(s => !s.isActive);
  
  const monthlyBurnSum = activePlans.reduce((sum, s) => {
    return sum + (s.billingCycle === 'yearly' ? Math.round(s.amount / 12) : s.amount);
  }, 0);
  
  const annualCostSum = Math.round((monthlyBurnSum * 12) / 1000);
  const pausedSavingsSum = pausedPlans.reduce((sum, s) => sum + s.amount, 0);

  const sortedUpcoming = [...activePlans].sort((a, b) => new Date(a.nextBillingDate) - new Date(b.nextBillingDate));
  const primaryUpcoming = sortedUpcoming[0];

  const getDaysRemainingText = (dateStr) => {
    if (!dateStr) return 'N/A';
    const diff = new Date(dateStr) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days <= 0 ? 'Today' : `${days} days`;
  };

  const handleFormReset = () => {
    setShowAddForm(false);
    setEditingId(null);
    setNewSubData({ name: '', amount: '', category: 'Streaming & Video', billingCycle: 'monthly', nextBillingDate: '' });
  };

  const handleCreateOrUpdateSubscriptionSubmit = async (e) => {
    e.preventDefault();
    const [year, month, day] = newSubData.nextBillingDate.split('-');
    const localDate = new Date(year, month - 1, day); 

    try {
      const payload = {
        ...newSubData,
        amount: Number(newSubData.amount),
        nextBillingDate: localDate.toISOString(),
        billingCycle: newSubData.billingCycle.toLowerCase()
      };

      if (editingId) {
        await editSubscription({ id: editingId, ...payload }).unwrap();
        showNotification('Subscription entry modified.', 'success');
      } else {
        await addSubscription(payload).unwrap();
        showNotification('Plan registered successfully.', 'success');
      }
      handleFormReset();
    } catch (err) {
      showNotification(getErrorMessage(err, 'Server rejected subscription layout parameters.'), 'error');
    }
  };

  const handleInitiateEditMode = (sub) => {
    const formattedDate = sub.nextBillingDate ? new Date(sub.nextBillingDate).toISOString().split('T')[0] : '';
    setNewSubData({
      name: sub.name,
      amount: sub.amount,
      category: sub.category || 'Streaming & Video',
      billingCycle: sub.billingCycle || 'monthly',
      nextBillingDate: formattedDate
    });
    setEditingId(sub._id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmedDeleteExecute = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteSubscription(deleteTargetId).unwrap();
      showNotification('Subscription plan deleted entirely.', 'success');
    } catch (err) {
      showNotification('Failed to remove subscription line item.', 'error');
    } finally {
      setDeleteTargetId(null);
    }
  };

  const IconMusic = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13M9 9l12-2M6 21a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm12-2a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>
  );
  const IconTv = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
  );
  const IconDumbbell = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="12" x2="18" y2="12"/><line x1="6" y1="7" x2="6" y2="17"/><line x1="18" y1="7" x2="18" y2="17"/></svg>
  );
  const IconCode = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
  );
  const IconBookOpen = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  );
  const IconCloud = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
  );
  const IconSparkles = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v3M12 18v3M4.22 4.22l2.12 2.12" /></svg>
  );

  const mapCategoryIcons = (category) => {
    switch (category) {
      case 'Music & Podcasts': return <IconMusic />;
      case 'Streaming & Video': return <IconTv />;
      case 'Fitness & Health': return <IconDumbbell />;
      case 'AI & Coding Tools': return <IconCode />;
      case 'Study & Productivity': return <IconBookOpen />;
      default: return <IconCloud />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', position: 'relative', overflow: 'visible' }}>
      
      {deleteTargetId && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(30, 51, 54, 0.4)', backdropFilter: 'blur(4px)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.15s ease' }}>
          <div style={{ background: colors.white, padding: '28px', borderRadius: '16px', border: `0.5px solid ${colors.border}`, width: '380px', maxWidth: '90%', boxShadow: '0 12px 36px rgba(30,51,54,0.18)', animation: 'scaleUp 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h4 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.25rem', fontWeight: 500, color: colors.textDark, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Delete Subscription?</h4>
              <p style={{ color: colors.textMuted, fontSize: '0.88rem', lineHeight: '1.5', marginTop: '6px' }}>Are you sure you want to completely remove this plan from your active transaction curves? This action cannot be undone.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button 
                onClick={() => setDeleteTargetId(null)}
                style={{ background: colors.bgLight, color: colors.textPrimary, border: 'none', padding: '10px 20px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Montserrat', sans-serif" }}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmedDeleteExecute}
                style={{ background: colors.redText, color: colors.white, border: 'none', padding: '10px 20px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Montserrat', sans-serif" }}
              >
                Delete Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', background: toast.type === 'success' ? colors.successBg : colors.redBg, borderLeft: `4px solid ${toast.type === 'success' ? colors.successText : colors.redText}`, padding: '14px 24px', borderRadius: '6px', boxShadow: '0 8px 20px rgba(54,76,79,0.12)', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '12px', color: toast.type === 'success' ? colors.successText : colors.redText, fontWeight: 600, fontSize: '0.85rem', animation: 'fadeIn 0.2s ease' }}>
          {toast.type === 'success' ? '✓' : '✕'}
          <span>{toast.message}</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: colors.darkTeal, fontFamily: "'Oswald', sans-serif", fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SUBSCRIPTIONS/PLANS</h2>
          <p style={{ color: colors.textMuted, fontSize: '0.85rem', marginTop: '2px' }}>Monitor ongoing student plan cycles and service configurations</p>
        </div>
        
        {showAddForm ? (
          <button onClick={handleFormReset} style={{ background: 'none', border: 'none', color: colors.textPrimary, fontSize: '20px', fontWeight: '300', cursor: 'pointer', outline: 'none', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: 'rgba(54,76,79,0.06)' }}>✕</button>
        ) : (
          <button onClick={() => setShowAddForm(true)} style={{ background: colors.darkTeal, color: colors.white, border: 'none', padding: '10px 22px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Montserrat', sans-serif" }}>＋ Add Subscription</button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateOrUpdateSubscriptionSubmit} style={{ background: colors.white, padding: '24px', borderRadius: '16px', border: `0.5px solid ${colors.border}`, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'end', animation: 'slideDown 0.2s ease' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: colors.textPrimary, marginBottom: '6px' }}>Service Name</label>
            <input type="text" placeholder="e.g. YouTube Premium" value={newSubData.name} onChange={(e) => setNewSubData({...newSubData, name: e.target.value})} required style={{ width: '100%', padding: '10px', border: `1px solid ${colors.border}`, borderRadius: '6px', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: colors.textPrimary, marginBottom: '6px' }}>Cost (₹)</label>
            <input type="number" placeholder="0" value={newSubData.amount} onChange={(e) => setNewSubData({...newSubData, amount: e.target.value})} required style={{ width: '100%', padding: '10px', border: `1px solid ${colors.border}`, borderRadius: '6px', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: colors.textPrimary, marginBottom: '6px' }}>Category</label>
            <select value={newSubData.category} onChange={(e) => setNewSubData({...newSubData, category: e.target.value})} style={{ width: '100%', padding: '10px', border: `1px solid ${colors.border}`, borderRadius: '6px', outline: 'none', background: colors.white }}>
              <option value="Streaming & Video">Streaming & Video</option>
              <option value="Music & Podcasts">Music & Podcasts</option>
              <option value="Fitness & Health">Fitness & Health</option>
              <option value="AI & Coding Tools">AI & Coding Tools</option>
              <option value="Study & Productivity">Study & Productivity</option>
              <option value="Cloud & Storage">Cloud & Storage</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: colors.textPrimary, marginBottom: '6px' }}>Billing Interval</label>
            <select value={newSubData.billingCycle} onChange={(e) => setNewSubData({...newSubData, billingCycle: e.target.value})} style={{ width: '100%', padding: '10px', border: `1px solid ${colors.border}`, borderRadius: '6px', outline: 'none', background: colors.white }}>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: colors.textPrimary, marginBottom: '6px' }}>Next Renewal Date</label>
            <input type="date" value={newSubData.nextBillingDate} onChange={(e) => setNewSubData({...newSubData, nextBillingDate: e.target.value})} required style={{ width: '100%', padding: '10px', border: `1px solid ${colors.border}`, borderRadius: '6px', outline: 'none' }} />
          </div>
          <button type="submit" disabled={isAdding} style={{ background: editingId ? '#BA7517' : '#0F6E56', color: colors.white, border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
            {editingId ? 'Save Changes' : 'Register Plan'}
          </button>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        <div style={{ background: colors.darkTeal, borderRadius: '18px', padding: '20px 24px', color: colors.white }}>
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#5DCAA5', marginBottom: '6px' }}>Monthly Burn</div>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '2.4rem', fontWeight: 600 }}>₹{monthlyBurnSum.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>{activePlans.length} active • {pausedPlans.length} paused</div>
        </div>

        <div style={{ background: colors.white, borderRadius: '18px', padding: '20px', border: `0.5px solid ${colors.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '6px' }}>Annual Cost</div>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.8rem', fontWeight: 600, color: colors.textDark }}>₹{annualCostSum}k</div>
        </div>

        <div style={{ background: colors.white, borderRadius: '18px', padding: '20px', border: `0.5px solid ${colors.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '6px' }}>Next Renewal</div>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.8rem', fontWeight: 600, color: colors.textDark }}>
            {primaryUpcoming ? new Date(primaryUpcoming.nextBillingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'None'}
          </div>
          {primaryUpcoming && (
            <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '4px', fontWeight: 500 }}>🕒 {getDaysRemainingText(primaryUpcoming.nextBillingDate)} left</div>
          )}
        </div>

        <div style={{ background: colors.white, borderRadius: '18px', padding: '20px', border: `0.5px solid ${colors.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '6px' }}>Paused Savings</div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.8rem', fontWeight: 600, color: colors.textDark }}>₹{pausedSavingsSum}</div>
          </div>
          <div style={{ width: 'fit-content', background: colors.successBg, color: colors.successText, fontSize: '10px', fontWeight: 600, padding: '4px 10px', borderRadius: '12px' }}>saved / month</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 0.75fr)', gap: '18px', alignItems: 'start', overflow: 'visible' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', overflow: 'visible' }}>
          
          <div style={{ overflow: 'visible' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>ACTIVE • {activePlans.length}</span>
              <div style={{ flex: 1, height: '0.5px', backgroundColor: colors.border }} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflow: 'visible' }}>
              {activePlans.length === 0 ? (
                <div style={{ background: colors.white, padding: '20px', borderRadius: '14px', border: `0.5px solid ${colors.border}`, color: colors.textMuted, textAlign: 'center' }}>No active plans tracked.</div>
              ) : activePlans.map(sub => (
                <SubscriptionRow 
                  key={sub._id} sub={sub} colors={colors} 
                  mapCategoryIcons={mapCategoryIcons} getCategoryThemeColor={getCategoryThemeColor} 
                  getDaysRemainingText={getDaysRemainingText} toggleStatus={toggleStatus} 
                  handleInitiateEditMode={handleInitiateEditMode} setDeleteTargetId={setDeleteTargetId} 
                />
              ))}
            </div>
          </div>

          <div style={{ overflow: 'visible' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>PAUSED • {pausedPlans.length}</span>
              <div style={{ flex: 1, height: '0.5px', backgroundColor: colors.border }} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflow: 'visible' }}>
              {pausedPlans.length === 0 ? (
                <div style={{ background: colors.white, padding: '20px', borderRadius: '14px', border: `0.5px solid ${colors.border}`, color: colors.textMuted, textAlign: 'center' }}>No current plans held in paused retention loop.</div>
              ) : pausedPlans.map(sub => (
                <SubscriptionRow 
                  key={sub._id} sub={sub} colors={colors} 
                  mapCategoryIcons={mapCategoryIcons} getCategoryThemeColor={getCategoryThemeColor} 
                  getDaysRemainingText={getDaysRemainingText} toggleStatus={toggleStatus} 
                  handleInitiateEditMode={handleInitiateEditMode} setDeleteTargetId={setDeleteTargetId} 
                />
              ))}
            </div>
          </div>

        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ background: colors.white, borderRadius: '18px', padding: '20px', border: `0.5px solid ${colors.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: colors.textDark }}>Renewal timeline</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingLeft: '16px', borderLeft: `1px solid ${colors.border}`, marginLeft: '6px', gap: '16px' }}>
              {sortedUpcoming.slice(0, 5).map(sub => {
                const subColor = getCategoryThemeColor(sub.category);
                return (
                  <div key={sub._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                    <div style={{ position: 'absolute', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: subColor, left: '-20px', top: '50%', transform: 'translateY(-50%)', border: `2px solid ${colors.white}`, boxSizing: 'content-box' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '6px', backgroundColor: `${subColor}10`, color: subColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {mapCategoryIcons(sub.category)}
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textDark }}>{sub.name}</div>
                        <div style={{ fontSize: '9px', color: colors.textMuted, marginTop: '1px' }}>{new Date(sub.nextBillingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {getDaysRemainingText(sub.nextBillingDate)}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 600, fontFamily: "'Oswald', sans-serif", color: colors.textDark }}>₹{sub.amount}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {activePlans.some(p => p.name.toLowerCase().includes('netflix')) && activePlans.some(p => p.name.toLowerCase().includes('youtube')) && (
            <div style={{ background: 'linear-gradient(135deg, #E8F6F0, #F0FAF6)', borderRadius: '14px', padding: '16px', border: '0.5px solid #9FE1CB' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <div style={{ width: '20px', height: '20px', background: colors.successText, borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.white }}><IconSparkles /></div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#085041' }}>Smart Nudge</div>
              </div>
              <div style={{ fontSize: '11px', color: colors.textPrimary, lineHeight: '1.5' }}>
                You have multiple entertainment streaming plans active simultaneously. Consider auditing usage velocity curves to salvage passive burn lines.
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SubscriptionVault;