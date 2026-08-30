import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetCategoriesQuery, useUpdateCategoryBudgetMutation } from '../../features/categories/categoryApi';
import { getErrorMessage } from '../../utils/errorHandler';
import { useTheme } from '../../context/ThemeContext';

const ProfileSettings = ({ onBackToDashboard }) => {
  
  const currentUser = useSelector((state) => state.auth.user);

  
  const { data: dbCategories = [], isLoading: catsLoading } = useGetCategoriesQuery();
  const [updateCategoryBudget] = useUpdateCategoryBudgetMutation();
  const { theme, setTheme, fontSize, setFontSize, colors } = useTheme();

  const [activeMenu, setActiveMenu] = useState('Profile');

  const [savedData, setSavedData] = useState({
    firstName: currentUser?.name?.split(' ')[0] || 'Sushmita',
    lastName: currentUser?.name?.split(' ')[1] || 'Das',
    email: currentUser?.email || 'dsushii1511@gmail.com',
    phone: '+91 98765 43210',
    institution: 'IIT Bombay',
    city: 'Mumbai',
    bio: 'Full-stack developer focused on full-stack web development, backend security, and AI integration.',
    budgetAlerts: true,
    subRenewals: true,
    groupUpdates: true,
    weeklyDigest: false,
    goalMilestones: true,
    compactTable: false,
    hideBalance: false,
    budgets: { food: '5000', shopping: '4000', transport: '2000', hostel: '3500', entertainment: '1500', education: '2000', health: '1200' }
  });

  const [firstName, setFirstName] = useState(savedData.firstName);
  const [lastName, setLastName] = useState(savedData.lastName);
  const [email, setEmail] = useState(savedData.email);
  const [phone, setPhone] = useState(savedData.phone);
  const [institution, setInstitution] = useState(savedData.institution);
  const [city, setCity] = useState(savedData.city);
  const [bio, setBio] = useState(savedData.bio);

  const [budgetAlerts, setBudgetAlerts] = useState(savedData.budgetAlerts);
  const [subRenewals, setSubRenewals] = useState(savedData.subRenewals);
  const [groupUpdates, setGroupUpdates] = useState(savedData.groupUpdates);
  const [weeklyDigest, setWeeklyDigest] = useState(savedData.weeklyDigest);
  const [goalMilestones, setGoalMilestones] = useState(savedData.goalMilestones);
  
  const [compactTable, setCompactTable] = useState(savedData.compactTable);
  const [hideBalance, setHideBalance] = useState(savedData.hideBalance);
  
  const [liveBudgets, setLiveBudgets] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (dbCategories.length > 0) {
      const budgetMap = {};
      dbCategories.forEach(cat => {
        budgetMap[cat._id] = cat.budget.toString();
      });
      setLiveBudgets(budgetMap);
    }
  }, [dbCategories]);

  useEffect(() => {
    let budgetModified = false;
    dbCategories.forEach(cat => {
      const currentInputValue = liveBudgets[cat._id] || '0';
      if (currentInputValue !== cat.budget.toString()) {
        budgetModified = true;
      }
    });

    const isChanged = 
      firstName !== savedData.firstName ||
      lastName !== savedData.lastName ||
      email !== savedData.email ||
      phone !== savedData.phone ||
      institution !== savedData.institution ||
      city !== savedData.city ||
      bio !== savedData.bio ||
      budgetAlerts !== savedData.budgetAlerts ||
      subRenewals !== savedData.subRenewals ||
      groupUpdates !== savedData.groupUpdates ||
      weeklyDigest !== savedData.weeklyDigest ||
      goalMilestones !== savedData.goalMilestones ||
      compactTable !== savedData.compactTable ||
      hideBalance !== savedData.hideBalance ||
      budgetModified;
    
    setHasChanges(isChanged);
  }, [firstName, lastName, email, phone, institution, city, bio, budgetAlerts, subRenewals, groupUpdates, weeklyDigest, goalMilestones, compactTable, hideBalance, liveBudgets, savedData, dbCategories]);

  const uiColors = {
    tealPrimary: colors.tealPrimary,
    tealDark: colors.textDark,
    border: colors.border,
    white: colors.white,
    bgMain: colors.background,
    accentGreen: colors.green,
    textMuted: colors.textMuted,
    redText: colors.red,
    redBg: theme === 'Dark' ? 'rgba(217,83,79,0.15)' : '#FCEBEB'
  };

  const showNotification = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
      const updatePromises = dbCategories.map(cat => {
        const inputVal = liveBudgets[cat._id] || '0';
        if (inputVal !== cat.budget.toString()) {
          return updateCategoryBudget({ id: cat._id, budget: Number(inputVal) }).unwrap();
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);

      const updatedMaster = {
        firstName, lastName, email, phone, institution, city, bio,
        budgetAlerts, subRenewals, groupUpdates, weeklyDigest, goalMilestones,
        compactTable, hideBalance, budgets: { ...liveBudgets }
      };
      setSavedData(updatedMaster);
      setHasChanges(false);
      showNotification('Changes saved successfully.', 'success');
    } catch (err) {
      showNotification(getErrorMessage(err, 'Failed to sync budget updates.'), 'error');
    }
  };

  const handleDiscardChanges = () => {
    setFirstName(savedData.firstName);
    setLastName(savedData.lastName);
    setEmail(savedData.email);
    setPhone(savedData.phone);
    setInstitution(savedData.institution);
    setCity(savedData.city);
    setBio(savedData.bio);
    setBudgetAlerts(savedData.budgetAlerts);
    setSubRenewals(savedData.subRenewals);
    setGroupUpdates(savedData.groupUpdates);
    setWeeklyDigest(savedData.weeklyDigest);
    setGoalMilestones(savedData.goalMilestones);
    setCompactTable(savedData.compactTable);
    setHideBalance(savedData.hideBalance);
    
    const budgetMap = {};
    dbCategories.forEach(cat => {
      budgetMap[cat._id] = cat.budget.toString();
    });
    setLiveBudgets(budgetMap);
    setHasChanges(false);
    showNotification('Form modifications discarded.', 'success');
  };

  const getInitials = () => {
    return `${firstName.substring(0, 1)}${lastName.substring(0, 1)}`.toUpperCase();
  };

  const mapCategoryDescriptions = (name) => {
    const descriptions = {
      'Food': 'Food & dining pool',
      'Shopping': 'Shopping parameters',
      'Transport': 'Transport loops',
      'Hostel': 'Hostel & mess ledger',
      'Subscriptions': 'Entertainment channels',
      'Education': 'Education components',
      'Health': 'Health & fitness metrics'
    };
    return descriptions[name] || `${name} configurations`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: uiColors.bgMain, color: uiColors.tealDark, fontFamily: "'Montserrat', sans-serif" }}>
      
      {toast.show && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', background: toast.type === 'success' ? '#E1F5EE' : uiColors.redBg, borderLeft: `4px solid ${toast.type === 'success' ? '#0F6E56' : uiColors.redText}`, padding: '14px 24px', borderRadius: '8px', boxShadow: '0 8px 24px rgba(30,51,54,0.12)', zIndex: 10000, color: toast.type === 'success' ? '#085041' : uiColors.redText, fontWeight: 600, fontSize: '0.85rem' }}>
          <span>{toast.message}</span>
        </div>
      )}

      <header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-end', 
        padding: '0 40px', 
        background: uiColors.white, 
        borderBottom: hasChanges ? `1px solid ${uiColors.border}` : '1px solid transparent',
        position: 'sticky', 
        top: 0, 
        height: hasChanges ? '64px' : '0px',
        opacity: hasChanges ? 1 : 0,
        transform: hasChanges ? 'translateY(0)' : 'translateY(-10px)',
        visibility: hasChanges ? 'visible' : 'hidden',
        boxSizing: 'border-box', 
        zIndex: 20,
        transition: 'height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.35s ease, visibility 0.3s'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={handleDiscardChanges} style={{ background: 'transparent', color: uiColors.tealPrimary, border: `1px solid ${uiColors.border}`, padding: '8px 20px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'background-color 0.2s' }}>Discard</button>
          <button onClick={handleSaveChanges} style={{ background: uiColors.accentGreen, color: '#fff', border: 'none', padding: '8px 22px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background-color 0.2s' }}>Save changes</button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '240px minmax(0, 1fr) 340px', background: uiColors.bgMain }}>
        <aside style={{ background: uiColors.white, borderRight: `1px solid ${uiColors.border}`, padding: '8px 0 24px 0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#B4B2A9', padding: '16px 24px 8px 24px' }}>Account</div>
          <div onClick={() => setActiveMenu('Profile')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', fontSize: '13px', fontWeight: 500, color: activeMenu === 'Profile' ? '#085041' : '#6B8B8E', cursor: 'pointer', borderLeft: `3px solid ${activeMenu === 'Profile' ? uiColors.accentGreen : 'transparent'}`, background: activeMenu === 'Profile' ? '#F0FAF6' : 'transparent' }}>Profile Details</div>
          <div onClick={() => setActiveMenu('Plan')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', fontSize: '13px', fontWeight: 500, color: activeMenu === 'Plan' ? '#085041' : '#6B8B8E', cursor: 'pointer', borderLeft: `3px solid ${activeMenu === 'Plan' ? uiColors.accentGreen : 'transparent'}`, background: activeMenu === 'Plan' ? '#F0FAF6' : 'transparent' }}>Plan</div>
          <div onClick={() => setActiveMenu('Security')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', fontSize: '13px', fontWeight: 500, color: activeMenu === 'Security' ? '#085041' : '#6B8B8E', cursor: 'pointer', borderLeft: `3px solid ${activeMenu === 'Security' ? uiColors.accentGreen : 'transparent'}`, background: activeMenu === 'Security' ? '#F0FAF6' : 'transparent' }}>Security</div>
          <div onClick={() => setActiveMenu('Notifications')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', fontSize: '13px', fontWeight: 500, color: activeMenu === 'Notifications' ? '#085041' : '#6B8B8E', cursor: 'pointer', borderLeft: `3px solid ${activeMenu === 'Notifications' ? uiColors.accentGreen : 'transparent'}`, background: activeMenu === 'Notifications' ? '#F0FAF6' : 'transparent' }}>Notifications</div>
          
          <div style={{ height: '1px', background: uiColors.border, margin: '12px 24px' }}></div>
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#B4B2A9', padding: '4px 24px 8px 24px' }}>Finance</div>
          <div onClick={() => setActiveMenu('Wallets')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', fontSize: '13px', fontWeight: 500, color: activeMenu === 'Wallets' ? '#085041' : '#6B8B8E', cursor: 'pointer', borderLeft: `3px solid ${activeMenu === 'Wallets' ? uiColors.accentGreen : 'transparent'}`, background: activeMenu === 'Wallets' ? '#F0FAF6' : 'transparent' }}>Wallets</div>
          <div onClick={() => setActiveMenu('Budgets')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', fontSize: '13px', fontWeight: 500, color: activeMenu === 'Budgets' ? '#085041' : '#6B8B8E', cursor: 'pointer', borderLeft: `3px solid ${activeMenu === 'Budgets' ? uiColors.accentGreen : 'transparent'}`, background: activeMenu === 'Budgets' ? '#F0FAF6' : 'transparent' }}>Budgets</div>
          <div onClick={() => setActiveMenu('Categories')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', fontSize: '13px', fontWeight: 500, color: activeMenu === 'Categories' ? '#085041' : '#6B8B8E', cursor: 'pointer', borderLeft: `3px solid ${activeMenu === 'Categories' ? uiColors.accentGreen : 'transparent'}`, background: activeMenu === 'Categories' ? '#F0FAF6' : 'transparent' }}>Categories</div>
          
          <div style={{ height: '1px', background: uiColors.border, margin: '12px 24px' }}></div>
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#B4B2A9', padding: '4px 24px 8px 24px' }}>Application</div>
          <div onClick={() => setActiveMenu('Appearance')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', fontSize: '13px', fontWeight: 500, color: activeMenu === 'Appearance' ? '#085041' : '#6B8B8E', cursor: 'pointer', borderLeft: `3px solid ${activeMenu === 'Appearance' ? uiColors.accentGreen : 'transparent'}`, background: activeMenu === 'Appearance' ? '#F0FAF6' : 'transparent' }}>Appearance</div>
          <div onClick={() => setActiveMenu('Export')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', fontSize: '13px', fontWeight: 500, color: activeMenu === 'Export' ? '#085041' : '#6B8B8E', cursor: 'pointer', borderLeft: `3px solid ${activeMenu === 'Export' ? uiColors.accentGreen : 'transparent'}`, background: activeMenu === 'Export' ? '#F0FAF6' : 'transparent' }}>Export Data</div>
          
          <div style={{ height: '1px', background: uiColors.border, margin: '12px 24px' }}></div>
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#B4B2A9', padding: '4px 24px 8px 24px' }}>Settings</div>
          <div onClick={() => setActiveMenu('Settings')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', fontSize: '13px', fontWeight: 500, color: activeMenu === 'Settings' ? '#085041' : '#6B8B8E', cursor: 'pointer', borderLeft: `3px solid ${activeMenu === 'Settings' ? uiColors.accentGreen : 'transparent'}`, background: activeMenu === 'Settings' ? '#F0FAF6' : 'transparent' }}>Settings</div>
        </aside>

        <main style={{ padding: '32px 48px', display: 'flex', flexDirection: 'column', gap: '32px', overflowY: 'auto' }}>
          
          {activeMenu === 'Profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontFamily: "'Montserrat', sans-serif", fontWeight: 700, color: uiColors.tealDark, textTransform: 'uppercase', letterSpacing: '0.8px', borderLeft: '3px solid #648B91', paddingLeft: '12px', marginBottom: '28px' }}>Profile Details</h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #1D9E75, #4E6E72)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Oswald', sans-serif", fontSize: '1.25rem', fontWeight: 600, color: '#fff' }}>
                    {getInitials()}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '1.15rem', fontWeight: 600, color: uiColors.tealDark }}>{firstName} {lastName}</div>
                    <div style={{ fontSize: '12px', color: uiColors.textMuted, marginTop: '2px' }}>{email}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: uiColors.textMuted }}>First Name</span>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={{ padding: '12px 14px', border: `1px solid ${uiColors.border}`, borderRadius: '6px', fontSize: '13px', color: uiColors.tealDark, outline: 'none', background: '#FAFCFC', fontFamily: 'inherit' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: uiColors.textMuted }}>Last Name</span>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} style={{ padding: '12px 14px', border: `1px solid ${uiColors.border}`, borderRadius: '6px', fontSize: '13px', color: uiColors.tealDark, outline: 'none', background: '#FAFCFC', fontFamily: 'inherit' }} />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: uiColors.textMuted }}>Email Address (Immutable)</span>
                    <input type="email" value={email} disabled style={{ padding: '12px 14px', border: `1px solid ${uiColors.border}`, borderRadius: '6px', fontSize: '13px', color: '#7A8C8E', outline: 'none', background: '#F4F7F7', cursor: 'not-allowed', fontFamily: 'inherit' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: uiColors.textMuted }}>Phone Line (Immutable)</span>
                    <input type="text" value={phone} disabled style={{ padding: '12px 14px', border: `1px solid ${uiColors.border}`, borderRadius: '6px', fontSize: '13px', color: '#7A8C8E', outline: 'none', background: '#F4F7F7', cursor: 'not-allowed', fontFamily: 'inherit' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: uiColors.textMuted }}>College / Institution</span>
                    <input type="text" value={institution} onChange={(e) => setInstitution(e.target.value)} style={{ padding: '12px 14px', border: `1px solid ${uiColors.border}`, borderRadius: '6px', fontSize: '13px', color: uiColors.tealDark, outline: 'none', background: '#FAFCFC', fontFamily: 'inherit' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: uiColors.textMuted }}>City Coordinate</span>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} style={{ padding: '12px 14px', border: `1px solid ${uiColors.border}`, borderRadius: '6px', fontSize: '13px', color: uiColors.tealDark, outline: 'none', background: '#FAFCFC', fontFamily: 'inherit' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1/3' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: uiColors.textMuted }}>Bio Summary</span>
                    <input type="text" value={bio} onChange={(e) => setBio(e.target.value)} style={{ padding: '12px 14px', border: `1px solid ${uiColors.border}`, borderRadius: '6px', fontSize: '13px', color: uiColors.tealDark, outline: 'none', background: '#FAFCFC', fontFamily: 'inherit' }} />
                  </div>
                </div>
              </div>

              <section style={{ border: `1.5px solid ${uiColors.border}`, borderRadius: '14px', overflow: 'hidden', background: uiColors.white, marginTop: '16px' }}>
                <div style={{ padding: '20px 24px', borderBottom: `1px solid ${uiColors.border}`, background: uiColors.white }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#791F1F', fontFamily: "'Montserrat', sans-serif" }}>Danger zone</h4>
                </div>
                <div style={{ padding: '8px 24px' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', borderBottom: '1px solid #F8ECEC' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: uiColors.tealDark }}>Export all data</div>
                      <div style={{ fontSize: '12px', color: '#9BB5B8', marginTop: '4px' }}>Download everything as a JSON backup</div>
                    </div>
                    <button type="button" onClick={() => showNotification('Backup archive triggered.', 'success')} style={{ padding: '8px 18px', background: '#F2F4F3', border: '1px solid #E0E8E8', borderRadius: '10px', color: '#6B8B8E', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Export</button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', borderBottom: '1px solid #F8ECEC' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: uiColors.tealDark }}>Clear all transactions</div>
                      <div style={{ fontSize: '12px', color: '#9BB5B8', marginTop: '4px' }}>Permanently removes all transaction history</div>
                    </div>
                    <button type="button" onClick={() => showNotification('Ledger collections cleared.', 'error')} style={{ padding: '8px 18px', background: '#FCEBEB', border: '1px solid #F5BFBF', borderRadius: '10px', color: '#A32D2D', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Clear data</button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: uiColors.tealDark }}>Delete account</div>
                      <div style={{ fontSize: '12px', color: '#9BB5B8', marginTop: '4px' }}>This action is permanent and cannot be undone</div>
                    </div>
                    <button type="button" onClick={() => showNotification('Account deletion process initiated.', 'error')} style={{ padding: '8px 18px', background: '#FCEBEB', border: '1px solid #F5BFBF', borderRadius: '10px', color: '#A32D2D', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Delete account</button>
                  </div>

                </div>
              </section>
            </div>
          )}

          {activeMenu === 'Plan' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: uiColors.tealDark, textTransform: 'uppercase', borderLeft: '3px solid #648B91', paddingLeft: '12px' }}>Account Plan Tier</h3>
              <div style={{ border: `1px solid ${uiColors.border}`, padding: '24px', borderRadius: '12px', background: '#FAFCFC', maxWidth: '400px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: uiColors.tealDark }}>Student Premium Tier</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '4px 10px', background: '#E1F5EE', color: '#085041', borderRadius: '6px' }}>ACTIVE</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: uiColors.tealPrimary }}>
                  <div>· Unlimited master transaction cataloging tracking paths</div>
                  <div>· High-fidelity metrics syncing filters dashboard analytics</div>
                  <div>· Multi-group loop vector container split architectures</div>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'Security' && (
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: uiColors.tealDark, textTransform: 'uppercase', borderLeft: '3px solid #648B91', paddingLeft: '12px', marginBottom: '16px' }}>Security & Authorization Matrix</h3>
              <p style={{ color: uiColors.textMuted, fontSize: '12px', lineHeight: 1.5 }}>Multi-factor access credentials management configuration setups map out here.</p>
            </div>
          )}

          {activeMenu === 'Notifications' && (
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: uiColors.tealDark, textTransform: 'uppercase', borderLeft: '3px solid #648B91', paddingLeft: '12px', marginBottom: '20px' }}>Notifications & Alerts</h3>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { label: 'Budget threshold warnings', sub: 'Notify at 50%, 80%, and 100% of limits', state: budgetAlerts, setter: setBudgetAlerts },
                  { label: 'Subscription renewals pipeline', sub: 'Remind 2 days before cycle charge hits', state: subRenewals, setter: setSubRenewals },
                  { label: 'Group shared roommate vectors', sub: 'When someone logs split additions or completes ledger settlements', state: groupUpdates, setter: setGroupUpdates },
                  { label: 'Weekly macro data updates', sub: 'Summary diagnostics parsed every Sunday morning', state: weeklyDigest, setter: setWeeklyDigest },
                  { label: 'Goal benchmark indicators', sub: 'Notify at 25%, 50%, 75%, and 100% completions', state: goalMilestones, setter: setGoalMilestones }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: `1px solid ${uiColors.border}` }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: uiColors.tealDark }}>{item.label}</div>
                      <div style={{ fontSize: '11px', color: uiColors.textMuted, marginTop: '2px' }}>{item.sub}</div>
                    </div>
                    <div onClick={() => item.setter(!item.state)} style={{ width: '38px', height: '22px', borderRadius: '11px', background: item.state ? uiColors.accentGreen : '#D3D1C7', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                      <div style={{ position: 'absolute', top: '3px', left: item.state ? '19px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeMenu === 'Wallets' && (
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: uiColors.tealDark, textTransform: 'uppercase', borderLeft: '3px solid #648B91', paddingLeft: '12px', marginBottom: '24px' }}>Payment Gateways Matrix</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['Primary Bank Account', 'GPay UPI Wallet', 'Cash Ledger'].map(w => (
                  <div key={w} style={{ padding: '16px 20px', border: `1px solid ${uiColors.border}`, borderRadius: '10px', fontSize: '13px', color: uiColors.tealDark, fontWeight: 500, background: uiColors.white, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    {w}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeMenu === 'Budgets' && (
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: uiColors.tealDark, textTransform: 'uppercase', borderLeft: '3px solid #648B91', paddingLeft: '12px', marginBottom: '20px' }}>Monthly Proportions Limits</h3>
              {catsLoading ? (
                <div style={{ fontSize: '12px', color: uiColors.textMuted }}>Pulling server budget maps...</div>
              ) : dbCategories.length === 0 ? (
                <div style={{ fontSize: '12px', color: uiColors.textMuted }}>No category configurations located on server. Create one first.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {dbCategories.map((cat) => (
                    <div key={cat._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${uiColors.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: cat.color || '#6B8B8E' }} />
                        <span style={{ fontSize: '13px', fontWeight: 500, color: uiColors.tealDark }}>{mapCategoryDescriptions(cat.name)}</span>
                      </div>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <span style={{ position: 'absolute', left: '12px', fontSize: '12px', fontFamily: "'Oswald', sans-serif", fontWeight: 600, color: uiColors.tealDark }}>₹</span>
                        <input 
                          type="text" 
                          value={liveBudgets[cat._id] || ''} 
                          onChange={(e) => setLiveBudgets({ ...liveBudgets, [cat._id]: e.target.value.replace(/[^0-9]/g, '') })} 
                          style={{ width: '110px', padding: '6px 12px 6px 22px', border: `1px solid ${uiColors.border}`, borderRadius: '6px', fontSize: '12px', fontFamily: "'Oswald', sans-serif", fontWeight: 600, color: uiColors.tealDark, outline: 'none', textAlign: 'right', background: '#FAFCFC', boxSizing: 'border-box' }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeMenu === 'Categories' && (
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: uiColors.tealDark, textTransform: 'uppercase', borderLeft: '3px solid #648B91', paddingLeft: '12px', marginBottom: '16px' }}>Category Allocations Map</h3>
              <p style={{ color: uiColors.textMuted, fontSize: '12px' }}>Manage structural sorting parameters for ledger transactions entries inside this viewport grid.</p>
            </div>
          )}

          {activeMenu === 'Appearance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', animation: 'fadeIn 0.2s ease' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: uiColors.tealDark }}>Appearance</span>
                </div>
                <div style={{ fontSize: '11px', color: uiColors.textMuted }}>Theme, font, and display preferences</div>
              </div>

              <div>
                <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', color: uiColors.tealPrimary, textTransform: 'uppercase', marginBottom: '10px' }}>THEME</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  {[
                    { id: 'Light', label: 'Light', borderCol: '#1D9E75', innerBg: '#F4F7F7' },
                    { id: 'Dark', label: 'Dark', borderCol: '#1E3336', innerBg: '#111F21' },
                    { id: 'System', label: 'System', borderCol: '#9BB5B8', innerBg: '#E6EBEB' }
                  ].map(t => {
                    const isThemeSelected = theme === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        style={{
                          border: `1.5px solid ${isThemeSelected ? '#1D9E75' : uiColors.border}`,
                          borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', background: uiColors.white,
                          display: 'flex', flexDirection: 'column', height: '88px', transition: 'border-color 0.2s'
                        }}
                      >
                        <div style={{ flex: 1, background: t.innerBg, padding: '10px', position: 'relative' }}>
                          <div style={{ width: '70%', height: '6px', background: isThemeSelected ? '#1D9E75' : '#D8E2E2', borderRadius: '3px', marginBottom: '4px' }} />
                          <div style={{ width: '40%', height: '4px', background: '#E2ECEC', borderRadius: '2px' }} />
                          {isThemeSelected && <div style={{ position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px', borderRadius: '50%', background: '#1D9E75' }} />}
                        </div>
                        <div style={{ padding: '8px 0', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: uiColors.tealDark, borderTop: `1px solid ${uiColors.border}` }}>
                          {t.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1px', color: uiColors.tealPrimary, textTransform: 'uppercase', marginBottom: '10px' }}>FONT SIZE</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  {['Small', 'Default', 'Large'].map(size => {
                    const isFontSelected = fontSize === size;
                    return (
                      <div
                        key={size}
                        onClick={() => setFontSize(size)}
                        style={{
                          border: `1.5px solid ${isFontSelected ? '#1D9E75' : uiColors.border}`,
                          background: isFontSelected ? '#E1F5EE' : '#fff', borderRadius: '8px',
                          padding: '14px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ fontSize: size === 'Small' ? '14px' : size === 'Large' ? '22px' : '18px', fontWeight: 700, color: uiColors.tealDark }}>A</div>
                        <div style={{ fontSize: '11px', fontWeight: 500, color: uiColors.tealPrimary, marginTop: '4px' }}>{size}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyRules: 'space-between', justifyContent: 'space-between', padding: '16px 0', borderBottom: `1px solid ${uiColors.border}` }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: uiColors.tealDark }}>Compact table view</div>
                    <div style={{ fontSize: '11px', color: uiColors.textMuted, marginTop: '2px' }}>Reduce row height in transaction list sheet rows</div>
                  </div>
                  <div onClick={() => setCompactTable(!compactTable)} style={{ width: '38px', height: '22px', borderRadius: '11px', background: compactTable ? uiColors.accentGreen : '#D3D1C7', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                    <div style={{ position: 'absolute', top: '3px', left: compactTable ? '19px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyRules: 'space-between', justifyContent: 'space-between', padding: '16px 0' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: uiColors.tealDark }}>Hide balance by default</div>
                    <div style={{ fontSize: '11px', color: uiColors.textMuted, marginTop: '2px' }}>Mask amount fields until explicitly tapped — privacy protection profile mode</div>
                  </div>
                  <div onClick={() => setHideBalance(!hideBalance)} style={{ width: '38px', height: '22px', borderRadius: '11px', background: hideBalance ? uiColors.accentGreen : '#D3D1C7', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
                    <div style={{ position: 'absolute', top: '3px', left: hideBalance ? '19px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'Export' && (
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: uiColors.tealDark, textTransform: 'uppercase', borderLeft: '3px solid #648B91', paddingLeft: '12px', marginBottom: '16px' }}>Export Transaction History Data</h3>
              <button type="button" onClick={() => showNotification('Data package download initialized.', 'success')} style={{ padding: '11px 22px', background: uiColors.tealPrimary, border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Download JSON Workbook Backup</button>
            </div>
          )}

          {activeMenu === 'Settings' && (
            <div style={{ animation: 'fadeIn 0.2s ease' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: uiColors.tealDark, textTransform: 'uppercase', borderLeft: '3px solid #648B91', paddingLeft: '12px', marginBottom: '16px' }}>Settings</h3>
              <p style={{ color: uiColors.textMuted, fontSize: '12px', marginBottom: '24px' }}>Manage system security runtime access profiles or discharge credentials context locks cleanly.</p>
              
              <div style={{ border: `1px solid ${uiColors.border}`, borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', justifyRules: 'space-between', justifyContent: 'space-between', background: '#FFFDFD' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#A32D2D' }}>Terminate account access profile session</div>
                  <div style={{ fontSize: '11px', color: uiColors.textMuted, marginTop: '2px' }}>Clears local encrypted authorization storage vectors to sign out.</div>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    if (window.confirm('Are you certain you want to sign out?')) {
                      showNotification('Clearing authorizations keys...', 'error');
                    }
                  }}
                  style={{ padding: '8px 16px', background: uiColors.redBg, border: '1px solid #F5BFBF', borderRadius: '6px', color: uiColors.redText, fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Log Out
                </button>
              </div>
            </div>
          )}

        </main>

        <aside style={{ background: uiColors.white, borderLeft: `1px solid ${uiColors.border}`, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '28px', overflowY: 'auto' }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#B4B2A9', marginBottom: '14px' }}>Your Stats</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div style={{ background: '#F2F4F3', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.6rem', fontWeight: 600, color: uiColors.tealDark, lineHeight: '1.1' }}>18</div>
                <div style={{ fontSize: '10px', color: uiColors.textMuted, marginTop: '4px', fontWeight: 500, lineHeight: '1.3' }}>Transactions this month</div>
              </div>
              <div style={{ background: '#F2F4F3', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.6rem', fontWeight: 600, color: uiColors.tealDark, lineHeight: '1.1' }}>₹7.7k</div>
                <div style={{ fontSize: '10px', color: uiColors.textMuted, marginTop: '4px', fontWeight: 500, lineHeight: '1.3' }}>Saved in June</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div style={{ background: '#F2F4F3', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.6rem', fontWeight: 600, color: uiColors.tealDark, lineHeight: '1.1' }}>6</div>
                <div style={{ fontSize: '10px', color: uiColors.textMuted, marginTop: '4px', fontWeight: 500, lineHeight: '1.3' }}>Active subscriptions</div>
              </div>
              <div style={{ background: '#F2F4F3', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.6rem', fontWeight: 600, color: uiColors.tealDark, lineHeight: '1.1' }}>3</div>
                <div style={{ fontSize: '10px', color: uiColors.textMuted, marginTop: '4px', fontWeight: 500, lineHeight: '1.3' }}>Goals in progress</div>
              </div>
            </div>

            <div style={{ background: '#F2F4F3', borderRadius: '12px', padding: '16px', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.8rem', fontWeight: 600, color: uiColors.tealDark, lineHeight: '1.1' }}>₹62,920</div>
              <div style={{ fontSize: '10px', color: uiColors.textMuted, marginTop: '4px', fontWeight: 500 }}>Total tracked since joined</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#B4B2A9', marginBottom: '12px' }}>Timeline Log History</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                { text: 'Security validation credentials synced perfectly', time: '2 days ago', dot: '#1D9E75' },
                { text: 'Access token validated smoothly from client node', time: 'Today', dot: '#378ADD' },
                { text: 'Spending limits configuration rewrites processed', time: '4 days ago', dot: '#EF9F27' }
              ].map((act, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 0', borderBottom: i === 2 ? 'none' : '0.5px solid #F2F4F3' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: act.dot, flexShrink: 0, marginTop: '5px' }} />
                  <div style={{ fontSize: '12px', color: '#364C4F', flex: 1, lineHeight: '1.4' }}>{act.text}</div>
                  <div style={{ fontSize: '10px', color: '#B4B2A9', flexShrink: 0, marginTop: '1px' }}>{act.time}</div>
                </div>
              ))}
            </div>
          </div>

        </aside>
      </div>

    </div>
  );
};

export default ProfileSettings;