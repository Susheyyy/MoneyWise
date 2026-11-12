import { localDateInput, nextSubscriptionBillingDay, subscriptionBillingDay } from '../../utils/calendarDate';
import React, { useState } from 'react';
import { 
  useGetSubscriptionsQuery, 
  useAddSubscriptionMutation, 
  useToggleSubscriptionStatusMutation,
  useDeleteSubscriptionMutation,
  useEditSubscriptionMutation
} from '../../features/subscriptions/subscriptionApi';
import { getErrorMessage } from '../../utils/errorHandler';
import { useTheme } from '../../context/ThemeContext';


const CATEGORIES = ['Streaming & Video', 'Music & Podcasts', 'Fitness & Health', 'AI & Coding Tools', 'Study & Productivity', 'Cloud & Storage', 'Entertainment'];

const palette = (dark) => (dark ? {
  bg: '#1D292B', surface: '#243638', card: '#2C4144', text: '#F2F5F5',
  muted: '#A7A7A9', accent: '#85BAC2', border: '#405558',
  btnBg: '#85BAC2', btnText: '#1D292B', toggleOn: '#85BAC2', toggleKnob: '#1D292B',
} : {
  bg: '#FFFFFF', surface: '#F2F5F5', card: '#FFFFFF', text: '#1D292B',
  muted: '#647477', accent: '#628B91', border: '#DCE4E5',
  btnBg: '#1D292B', btnText: '#FFFFFF', toggleOn: '#628B91', toggleKnob: '#FFFFFF',
});

const inr = (n) => '\u20B9' + Number(n || 0).toLocaleString('en-IN');

const SubscriptionCard = ({ sub, p, mapCategoryIcons, daysText, onToggle, onEdit, onDelete }) => {
  const billingDay = sub.isActive ? nextSubscriptionBillingDay(sub) : subscriptionBillingDay(sub);
  const renewal = billingDay
    ? new Date(billingDay).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' })
    : 'N/A';
  const actionBtn = {
    background: 'none', border: `1px solid ${p.border}`, borderRadius: '8px', padding: '6px 12px',
    fontSize: '12px', fontWeight: 600, color: p.text, cursor: 'pointer', fontFamily: 'inherit',
  };
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: '14px', alignItems: 'center',
      background: p.card, border: `1px solid ${p.border}`, borderRadius: '14px', padding: '16px 18px',
      opacity: sub.isActive ? 1 : 0.75,
    }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: p.surface, color: p.accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {mapCategoryIcons(sub.category)}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '15px', fontWeight: 600, color: p.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.name}</div>
        <div style={{ fontSize: '12px', color: p.muted, marginTop: '3px' }}>
          {sub.category} · {sub.billingCycle} · {sub.isActive ? 'expected renewal' : 'billing date'} {renewal}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: p.text }}>{inr(sub.amount)}</div>
        <div style={{ fontSize: '11px', color: p.muted, marginTop: '2px' }}>{sub.isActive ? daysText(billingDay) : 'Paused'}</div>
      </div>
      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button type="button" onClick={onToggle} style={actionBtn}>{sub.isActive ? 'Pause' : 'Resume'}</button>
        <button type="button" onClick={onEdit} style={actionBtn}>Edit</button>
        <button type="button" onClick={onDelete} style={{ ...actionBtn, color: '#B3261E', borderColor: 'transparent' }}>Delete</button>
      </div>
    </div>
  );
};

const SubscriptionVault = () => {
  const { data: subscriptions = [], isLoading, isError, refetch } = useGetSubscriptionsQuery();
  const [addSubscription, { isLoading: isAdding }] = useAddSubscriptionMutation();
  const [toggleStatus] = useToggleSubscriptionStatusMutation();
  const [deleteSubscription] = useDeleteSubscriptionMutation();
  const [editSubscription, { isLoading: isEditing }] = useEditSubscriptionMutation();
  const isSaving = isAdding || isEditing;

  const [editingId, setEditingId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);  
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  const [newSubData, setNewSubData] = useState({
    name: '', amount: '', category: 'Streaming & Video', billingCycle: 'monthly', nextBillingDate: ''
  });

  const { colors, theme } = useTheme();

  const extendedColors = {
    ...colors,
    darkTeal: colors.tealDark,
    amberBg: theme === 'Dark' ? 'rgba(245, 158, 11, 0.12)' : '#FAEEDA',
    amberText: theme === 'Dark' ? '#F59E0B' : '#633806',
  };

  const pageColors = extendedColors;

  const showNotification = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 3500);
  };

  if (isLoading) {
    return <div style={{ padding: '40px', color: pageColors.darkTeal, fontWeight: '600' }}>Synchronizing upcoming renewals...</div>;
  }
  if (isError) {
    return <div role="alert" style={{ padding: '40px' }}>Could not load subscriptions. <button type="button" onClick={refetch}>Try again</button></div>;
  }

  const activePlans = subscriptions.filter(s => s.isActive);
  const pausedPlans = subscriptions.filter(s => !s.isActive);
  
  const monthlyBurnSum = activePlans.reduce((sum, s) => {
    return sum + (s.billingCycle === 'yearly' ? s.amount / 12 : s.amount);
  }, 0);
  
  const pausedSavingsSum = pausedPlans.reduce((sum, s) => sum + s.amount, 0);

  const sortedUpcoming = activePlans.filter(plan => nextSubscriptionBillingDay(plan))
    .sort((a, b) => nextSubscriptionBillingDay(a).localeCompare(nextSubscriptionBillingDay(b)));
  const primaryUpcoming = sortedUpcoming[0];

  const getDaysRemainingText = (dateStr) => {
    if (!dateStr) return 'N/A';
    const days = (Date.parse(dateStr) - Date.parse(localDateInput())) / 86400000;
    if (days < 0) return `${-days} days overdue`;
    return days === 0 ? 'Today' : `${days} days`;
  };

  const handleFormReset = () => {
    setEditingId(null);
    setNewSubData({ name: '', amount: '', category: 'Streaming & Video', billingCycle: 'monthly', nextBillingDate: '' });
  };

  const handleCreateOrUpdateSubscriptionSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    try {
      const payload = {
        ...newSubData,
        amount: Number(newSubData.amount),
        billingDay: newSubData.nextBillingDate,
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
    const formattedDate = subscriptionBillingDay(sub);
    setNewSubData({
      name: sub.name,
      amount: sub.amount,
      category: sub.category || 'Streaming & Video',
      billingCycle: sub.billingCycle || 'monthly',
      nextBillingDate: formattedDate
    });
    setEditingId(sub._id);
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

  const dark = theme === 'Dark';
  const p = palette(dark);
  const daysText = (d) => getDaysRemainingText(d);

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '10px', border: `1px solid ${p.border}`,
    background: p.surface, color: p.text, fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none',
  };
  const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 600, color: p.muted, marginBottom: '6px' };
  const sectionLabel = (text) => (
    <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: p.muted, margin: '4px 0 12px' }}>{text}</div>
  );
  const emptyBox = (text) => (
    <div style={{ background: p.card, border: `1px dashed ${p.border}`, borderRadius: '14px', padding: '24px', textAlign: 'center', color: p.muted, fontSize: '13px' }}>{text}</div>
  );

  const summaryCards = [
    { label: 'Monthly cost', value: inr(monthlyBurnSum), sub: `${activePlans.length} active` },
    { label: 'Yearly projection', value: inr(monthlyBurnSum * 12), sub: 'at current plans' },
    { label: 'Next expected renewal', value: primaryUpcoming ? primaryUpcoming.name : 'None', sub: primaryUpcoming ? daysText(nextSubscriptionBillingDay(primaryUpcoming)) : 'Add a subscription' },
    { label: 'Paused', value: inr(pausedSavingsSum), sub: `${pausedPlans.length} paused` },
  ];

  return (
    <div style={{ width: '100%', boxSizing: 'border-box', padding: '32px 40px', background: p.bg, color: p.text, minHeight: '100%', position: 'relative' }}>

      {toast.show && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 6000, padding: '12px 18px', borderRadius: '10px',
          background: toast.type === 'success' ? p.card : '#FDECEA', color: toast.type === 'success' ? p.text : '#B3261E',
          border: `1px solid ${p.border}`, fontSize: '13px', fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        }}>
          {toast.message}
        </div>
      )}

      {deleteTargetId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: p.card, padding: '24px', borderRadius: '16px', border: `1px solid ${p.border}`, width: '380px', maxWidth: '90%' }}>
            <div style={{ fontSize: '17px', fontWeight: 700, color: p.text }}>Delete subscription?</div>
            <p style={{ color: p.muted, fontSize: '13px', lineHeight: 1.5, margin: '8px 0 20px' }}>This removes the plan from your tracker. This can't be undone.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setDeleteTargetId(null)} style={{ background: 'none', border: `1px solid ${p.border}`, borderRadius: '10px', padding: '9px 16px', color: p.text, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Cancel</button>
              <button type="button" onClick={handleConfirmedDeleteExecute} style={{ background: '#B3261E', border: 'none', borderRadius: '10px', padding: '9px 16px', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: p.text }}>Subscriptions</div>
          <div style={{ fontSize: '13px', color: p.muted, marginTop: '4px' }}>Track what renews, what you're paying, and what's paused.</div>
        </div>
        <button type="button" onClick={handleFormReset} style={{ background: p.btnBg, color: p.btnText, border: 'none', borderRadius: '20px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          + New subscription
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        {summaryCards.map((c) => (
          <div key={c.label} style={{ background: p.card, border: `1px solid ${p.border}`, borderRadius: '14px', padding: '16px 18px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: p.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>{c.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: p.text, marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.value}</div>
            <div style={{ fontSize: '12px', color: p.muted, marginTop: '4px' }}>{c.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
        <div style={{ minWidth: 0 }}>
          {sectionLabel(`Active · ${activePlans.length}`)}
          {activePlans.length === 0
            ? emptyBox('No active subscriptions yet.')
            : <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activePlans.map((sub) => (
                  <SubscriptionCard key={sub._id} sub={sub} p={p} mapCategoryIcons={mapCategoryIcons} daysText={daysText}
                    onToggle={() => toggleStatus(sub._id)} onEdit={() => handleInitiateEditMode(sub)} onDelete={() => setDeleteTargetId(sub._id)} />
                ))}
              </div>}

          <div style={{ marginTop: '28px' }}>
            {sectionLabel(`Paused · ${pausedPlans.length}`)}
            {pausedPlans.length === 0
              ? emptyBox('Nothing paused.')
              : <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pausedPlans.map((sub) => (
                    <SubscriptionCard key={sub._id} sub={sub} p={p} mapCategoryIcons={mapCategoryIcons} daysText={daysText}
                      onToggle={() => toggleStatus(sub._id)} onEdit={() => handleInitiateEditMode(sub)} onDelete={() => setDeleteTargetId(sub._id)} />
                  ))}
                </div>}
          </div>
        </div>

        <form onSubmit={handleCreateOrUpdateSubscriptionSubmit} style={{ background: p.card, border: `1px solid ${p.border}`, borderRadius: '16px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '24px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: p.text }}>{editingId ? 'Edit subscription' : 'New subscription'}</div>
            <div style={{ fontSize: '12px', color: p.muted, marginTop: '4px' }}>Add it once and it's tracked from then on.</div>
          </div>

          <div>
            <label style={labelStyle}>Name</label>
            <input type="text" placeholder="e.g. YouTube Premium" value={newSubData.name} required
              onChange={(e) => setNewSubData({ ...newSubData, name: e.target.value })} style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Amount (₹)</label>
              <input type="number" min="0" placeholder="0" value={newSubData.amount} required
                onChange={(e) => setNewSubData({ ...newSubData, amount: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Billing</label>
              <select value={newSubData.billingCycle} onChange={(e) => setNewSubData({ ...newSubData, billingCycle: e.target.value })} style={inputStyle}>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Category</label>
            <select value={newSubData.category} onChange={(e) => setNewSubData({ ...newSubData, category: e.target.value })} style={inputStyle}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Next renewal date</label>
            <input type="date" value={newSubData.nextBillingDate} required
              onChange={(e) => setNewSubData({ ...newSubData, nextBillingDate: e.target.value })} style={inputStyle} />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            {editingId && (
              <button type="button" onClick={handleFormReset} style={{ background: 'none', border: `1px solid ${p.border}`, borderRadius: '10px', padding: '10px 16px', color: p.text, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            )}
            <button type="submit" disabled={isSaving} style={{ flex: 1, background: p.btnBg, color: p.btnText, border: 'none', borderRadius: '10px', padding: '10px 16px', fontWeight: 600, fontSize: '14px', cursor: isSaving ? 'default' : 'pointer', opacity: isSaving ? 0.6 : 1, fontFamily: 'inherit' }}>
              {isSaving ? 'Saving…' : editingId ? 'Save changes' : 'Add subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionVault;
