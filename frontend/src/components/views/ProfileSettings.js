import './ProfileSettings.css';
import { downloadTransactionExport } from '../../utils/downloadTransactionExport';
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { useGetCategoriesQuery, useAddCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } from '../../features/categories/categoryApi';
import { useUpdateProfileMutation, useSignOut, useGetProfileQuery, useChangePasswordMutation } from '../../features/auth/authApi';
import { useGetWalletsQuery, useCreateWalletMutation, useUpdateWalletMutation, useDeleteWalletMutation } from '../../features/wallets/walletApi';
import { updateUser } from '../../features/auth/authSlice';
import { getErrorMessage } from '../../utils/errorHandler';
import { useTheme } from '../../context/ThemeContext';

const settingsSections = [
  ['Account', [['Profile', 'Profile details'], ['Security', 'Security'], ['Notifications', 'Reminders']]],
  ['Finance', [['Wallets', 'Wallets'], ['Budgets', 'Budgets'], ['Categories', 'Categories']]],
  ['Application', [['Appearance', 'Appearance'], ['Export', 'Export data'], ['Settings', 'Session']]],
];

const ProfileSettings = () => {
  
  const currentUser = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [updateProfileApi, { isLoading: isSaving }] = useUpdateProfileMutation();
  const [signOut, isSigningOut] = useSignOut();
  
  const { data: dbCategories = [], isLoading: catsLoading, isError: categoriesError, refetch: retryCategories } = useGetCategoriesQuery();
  const { data: wallets = [], isLoading: walletsLoading, isError: walletsError, refetch: retryWallets } = useGetWalletsQuery();
  const [createWallet, { isLoading: isCreatingWallet }] = useCreateWalletMutation();
  const [addCategory, { isLoading: isCreatingCategory }] = useAddCategoryMutation();
  const [updateWallet, walletUpdate] = useUpdateWalletMutation();
  const [deleteWallet, walletRemoval] = useDeleteWalletMutation();
  const [updateCategory, categoryUpdate] = useUpdateCategoryMutation();
  const [deleteCategory, categoryRemoval] = useDeleteCategoryMutation();
  const [editingWallet, setEditingWallet] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const walletBusy = isCreatingWallet || walletUpdate.isLoading || walletRemoval.isLoading;
  const categoryBusy = isCreatingCategory || categoryUpdate.isLoading || categoryRemoval.isLoading;
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [walletName, setWalletName] = useState('');
  const [walletType, setWalletType] = useState('Cash');
  const [openingBalance, setOpeningBalance] = useState('0');
  const [categoryName, setCategoryName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const profileLoaded = useRef(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme, setTheme, fontSize, setFontSize, colors } = useTheme();

  const requestedTab = searchParams.get('tab');
  const activeMenu = settingsSections.some(([, links]) => links.some(([tab]) => tab === requestedTab)) ? requestedTab : 'Profile';
  const setActiveMenu = tab => setSearchParams(tab === 'Profile' ? {} : { tab });

  const [savedData, setSavedData] = useState({
    firstName: currentUser?.name?.split(' ')[0] || '',
    lastName: currentUser?.name?.split(' ')[1] || '',
    email: currentUser?.email || '',
    phone: '',
    institution: '',
    city: '',
    bio: '',
    monthlyLogPreference: currentUser?.monthlyLogPreference || 'start',
    monthlyLogCustomDate: currentUser?.monthlyLogCustomDate || 1,
  });

  const [firstName, setFirstName] = useState(savedData.firstName);
  const [lastName, setLastName] = useState(savedData.lastName);
  const [email, setEmail] = useState(savedData.email);
  const [phone, setPhone] = useState(savedData.phone);
  const [institution, setInstitution] = useState(savedData.institution);
  const [city, setCity] = useState(savedData.city);
  const [bio, setBio] = useState(savedData.bio);

  // Load the real profile from the server instead of showing placeholder values.
  const { data: profile } = useGetProfileQuery();
  useEffect(() => {
    if (!profile || profileLoaded.current) return;
    profileLoaded.current = true;
    const parts = (profile.name || '').split(' ');
    const first = parts[0] || '';
    const last = parts.slice(1).join(' ');
    const values = {
      firstName: first,
      lastName: last,
      email: profile.email || '',
      phone: profile.phone || '',
      institution: profile.institution || '',
      city: profile.city || '',
      bio: profile.bio || '',
    };
    setFirstName(values.firstName);
    setLastName(values.lastName);
    setEmail(values.email);
    setPhone(values.phone);
    setInstitution(values.institution);
    setCity(values.city);
    setBio(values.bio);
    setSavedData(prev => ({ ...prev, ...values }));
  }, [profile]);

  
  
  const [monthlyLogPreference, setMonthlyLogPreference] = useState(savedData.monthlyLogPreference);
  const [monthlyLogCustomDate, setMonthlyLogCustomDate] = useState(savedData.monthlyLogCustomDate);

  const [liveBudgets, setLiveBudgets] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const changedBudgets = Object.entries(liveBudgets).filter(([id, value]) => {
    const saved = dbCategories.find(category => category._id === id);
    return !saved || Number(value) !== saved.budget;
  });
  const hasChanges =
    firstName !== savedData.firstName ||
    lastName !== savedData.lastName ||
    phone !== savedData.phone ||
    institution !== savedData.institution ||
    city !== savedData.city ||
    bio !== savedData.bio ||
    monthlyLogPreference !== savedData.monthlyLogPreference ||
    monthlyLogCustomDate !== savedData.monthlyLogCustomDate ||
    changedBudgets.length > 0;

  const uiColors = {
    ...colors,
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
    if (isSaving) return;
    try {
      const updatedMaster = {
        firstName, lastName, email, phone, institution, city, bio,
        monthlyLogPreference, monthlyLogCustomDate
      };
      const profileData = await updateProfileApi({
        name: `${firstName} ${lastName}`.trim(),
        phone, institution, city, bio, monthlyLogPreference, monthlyLogCustomDate,
        budgets: changedBudgets.map(([id, value]) => ({ id, budget: Number(value) })),
      }).unwrap();
      dispatch(updateUser(profileData));
      setSavedData(updatedMaster);
      setLiveBudgets({});
      showNotification('Changes saved.');
    } catch (err) {
      showNotification(getErrorMessage(err, 'Could not save changes.'), 'error');
    }
  };

  const handleCreateWallet = async event => {
    event.preventDefault();
    if (walletBusy || !walletName.trim()) return;
    try {
      const wallet = { name: walletName.trim(), type: walletType };
      if (editingWallet) await updateWallet({ id: editingWallet, ...wallet }).unwrap();
      else await createWallet({ ...wallet, balance: Number(openingBalance) }).unwrap();
      setEditingWallet(null);
      setWalletName('');
      setOpeningBalance('0');
      showNotification(editingWallet ? 'Wallet updated.' : 'Wallet created.');
    } catch (err) {
      showNotification(getErrorMessage(err, 'Could not save wallet.'), 'error');
    }
  };

  const handleAddCategory = async event => {
    event.preventDefault();
    if (categoryBusy || !categoryName.trim()) return;
    try {
      const category = { name: categoryName.trim() };
      if (editingCategory) await updateCategory({ id: editingCategory, ...category }).unwrap();
      else await addCategory(category).unwrap();
      setEditingCategory(null);
      setCategoryName('');
      showNotification(editingCategory ? 'Category updated.' : 'Category created.');
    } catch (err) {
      showNotification(getErrorMessage(err, 'Could not save category.'), 'error');
    }
  };

  const handleRemoveWallet = async wallet => {
    if (walletBusy || !window.confirm(`Remove "${wallet.name}"? Past transactions will remain in your ledger.`)) return;
    try {
      await deleteWallet(wallet._id).unwrap();
      if (editingWallet === wallet._id) { setEditingWallet(null); setWalletName(''); setOpeningBalance('0'); }
      showNotification('Wallet removed.');
    } catch (err) {
      showNotification(getErrorMessage(err, 'Could not remove wallet.'), 'error');
    }
  };

  const handleRemoveCategory = async category => {
    if (categoryBusy || isSaving || !window.confirm(`Remove "${category.name}"? Past transactions will remain in your ledger.`)) return;
    try {
      await deleteCategory(category._id).unwrap();
      setLiveBudgets(current => Object.fromEntries(Object.entries(current).filter(([id]) => id !== category._id)));
      if (editingCategory === category._id) { setEditingCategory(null); setCategoryName(''); }
      showNotification('Category removed.');
    } catch (err) {
      showNotification(getErrorMessage(err, 'Could not remove category.'), 'error');
    }
  };

  const handleChangePassword = async event => {
    event.preventDefault();
    if (isChangingPassword) return;
    if (newPassword !== confirmPassword) return showNotification('New passwords do not match.', 'error');
    try {
      await changePassword({ oldPassword, newPassword }).unwrap();
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showNotification('Password updated.');
    } catch (err) {
      showNotification(getErrorMessage(err, 'Could not update password.'), 'error');
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
    setMonthlyLogPreference(savedData.monthlyLogPreference);
    setMonthlyLogCustomDate(savedData.monthlyLogCustomDate);
    
    setLiveBudgets({});
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
    <div className="profile-settings" style={{
      '--settings-surface': uiColors.white, '--settings-border': uiColors.border,
      '--settings-bg': uiColors.bgMain, '--settings-text': uiColors.tealDark,
      '--settings-muted': uiColors.textMuted, '--settings-accent': uiColors.tealPrimary,
      '--settings-selected': uiColors.successBg, '--settings-danger': uiColors.redText,
      display: 'flex', flexDirection: 'column', background: uiColors.bgMain, color: uiColors.tealDark, fontFamily: "'Montserrat', sans-serif" }}>
      
      {toast.show && (
        <div role={toast.type === 'error' ? 'alert' : 'status'} style={{ position: 'fixed', top: '24px', right: '24px', background: toast.type === 'success' ? '#E1F5EE' : uiColors.redBg, borderLeft: `4px solid ${toast.type === 'success' ? '#0F6E56' : uiColors.redText}`, padding: '14px 24px', borderRadius: '8px', boxShadow: '0 8px 24px rgba(30,51,54,0.12)', zIndex: 10000, color: toast.type === 'success' ? '#085041' : uiColors.redText, fontWeight: 600, fontSize: '0.85rem' }}>
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
          <button disabled={isSaving} onClick={handleDiscardChanges} style={{ background: 'transparent', color: uiColors.tealPrimary, border: `1px solid ${uiColors.border}`, padding: '8px 20px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'background-color 0.2s' }}>Discard</button>
          <button disabled={isSaving} onClick={handleSaveChanges} style={{ background: uiColors.accentGreen, color: '#fff', border: 'none', padding: '8px 22px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background-color 0.2s' }}>Save changes</button>
        </div>
      </header>

      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings">
          {settingsSections.map(([label, links]) => (
            <div key={label} className="settings-nav-group">
              <span>{label}</span>
              {links.map(([tab, name]) => (
                <button key={tab} type="button" aria-current={activeMenu === tab ? 'page' : undefined} onClick={() => setActiveMenu(tab)}>{name}</button>
              ))}
            </div>
          ))}
        </nav>
        <div className="settings-content">
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

                <div className="settings-profile-grid">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: uiColors.textMuted }}>First Name</span>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={{ padding: '12px 14px', border: `1px solid ${uiColors.border}`, borderRadius: '6px', fontSize: '13px', color: uiColors.tealDark, outline: 'none', background: uiColors.bgLight, fontFamily: 'inherit' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: uiColors.textMuted }}>Last Name</span>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} style={{ padding: '12px 14px', border: `1px solid ${uiColors.border}`, borderRadius: '6px', fontSize: '13px', color: uiColors.tealDark, outline: 'none', background: uiColors.bgLight, fontFamily: 'inherit' }} />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: uiColors.textMuted }}>Email Address (Immutable)</span>
                    <input type="email" value={email} disabled style={{ padding: '12px 14px', border: `1px solid ${uiColors.border}`, borderRadius: '6px', fontSize: '13px', color: '#7A8C8E', outline: 'none', background: uiColors.bgLight, cursor: 'not-allowed', fontFamily: 'inherit' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: uiColors.textMuted }}>Phone Line (Immutable)</span>
                    <input type="text" value={phone} disabled style={{ padding: '12px 14px', border: `1px solid ${uiColors.border}`, borderRadius: '6px', fontSize: '13px', color: '#7A8C8E', outline: 'none', background: uiColors.bgLight, cursor: 'not-allowed', fontFamily: 'inherit' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: uiColors.textMuted }}>College / Institution</span>
                    <input type="text" value={institution} onChange={(e) => setInstitution(e.target.value)} style={{ padding: '12px 14px', border: `1px solid ${uiColors.border}`, borderRadius: '6px', fontSize: '13px', color: uiColors.tealDark, outline: 'none', background: uiColors.bgLight, fontFamily: 'inherit' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: uiColors.textMuted }}>City Coordinate</span>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} style={{ padding: '12px 14px', border: `1px solid ${uiColors.border}`, borderRadius: '6px', fontSize: '13px', color: uiColors.tealDark, outline: 'none', background: uiColors.bgLight, fontFamily: 'inherit' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1/3' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: uiColors.textMuted }}>Bio Summary</span>
                    <input type="text" value={bio} onChange={(e) => setBio(e.target.value)} style={{ padding: '12px 14px', border: `1px solid ${uiColors.border}`, borderRadius: '6px', fontSize: '13px', color: uiColors.tealDark, outline: 'none', background: uiColors.bgLight, fontFamily: 'inherit' }} />
                  </div>
                </div>
              </div>

              <section style={{ border: `1.5px solid ${uiColors.border}`, borderRadius: '14px', overflow: 'hidden', background: uiColors.white, marginTop: '16px' }}>
                <div style={{ padding: '20px 24px', borderBottom: `1px solid ${uiColors.border}`, background: uiColors.white }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#791F1F', fontFamily: "'Montserrat', sans-serif" }}>Transaction data</h4>
                </div>
                <div style={{ padding: '8px 24px' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', borderBottom: '1px solid #F8ECEC' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: uiColors.tealDark }}>Export transactions</div>
                      <div style={{ fontSize: '12px', color: '#9BB5B8', marginTop: '4px' }}>Download your transaction history as CSV</div>
                    </div>
                    <button type="button" onClick={() => setActiveMenu('Export')} style={{ padding: '8px 18px', background: uiColors.bgLight, border: '1px solid #E0E8E8', borderRadius: '10px', color: '#6B8B8E', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Export</button>
                  </div>

                </div>
              </section>
            </div>
          )}

          {activeMenu === 'Security' && (
            <form className="settings-panel settings-form" onSubmit={handleChangePassword}>
              <h3>Change password</h3>
              <label>Current password <input type="password" autoComplete="current-password" value={oldPassword} onChange={event => setOldPassword(event.target.value)} required /></label>
              <label>New password <input type="password" autoComplete="new-password" value={newPassword} onChange={event => setNewPassword(event.target.value)} minLength={8} required /></label>
              <label>Confirm new password <input type="password" autoComplete="new-password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} minLength={8} required /></label>
              <small>Use at least eight characters with a letter, number, and symbol.</small>
              <button className="settings-primary" type="submit" disabled={isChangingPassword}>{isChangingPassword ? 'Updating…' : 'Change password'}</button>
            </form>
          )}

          {activeMenu === 'Notifications' && (
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: uiColors.tealDark, textTransform: 'uppercase', borderLeft: '3px solid #648B91', paddingLeft: '12px', marginBottom: '20px' }}>Notifications & Alerts</h3>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px 0', borderBottom: `1px solid ${uiColors.border}` }}>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: uiColors.tealDark }}>Monthly Log Frequency</div>
                    <div style={{ fontSize: '11px', color: uiColors.textMuted, marginTop: '2px' }}>When should we ask about allocating funds to savings goals?</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <select
                      value={monthlyLogPreference}
                      onChange={(e) => setMonthlyLogPreference(e.target.value)}
                      style={{ padding: '8px 12px', border: `1px solid ${uiColors.border}`, borderRadius: '6px', fontSize: '12px', color: uiColors.tealDark, outline: 'none', background: uiColors.bgLight, fontFamily: 'inherit' }}
                    >
                      <option value="start">Start of month (1st)</option>
                      <option value="end">End of month (25th)</option>
                      <option value="custom">Custom Date</option>
                    </select>
                    {monthlyLogPreference === 'custom' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: uiColors.textMuted }}>Day:</span>
                        <input
                          type="number"
                          min="1"
                          max="28"
                          value={monthlyLogCustomDate}
                          onChange={(e) => setMonthlyLogCustomDate(Number(e.target.value))}
                          style={{ width: '60px', padding: '8px 12px', border: `1px solid ${uiColors.border}`, borderRadius: '6px', fontSize: '12px', color: uiColors.tealDark, outline: 'none', background: uiColors.bgLight, fontFamily: 'inherit' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'Wallets' && (
            <section className="settings-panel">
              <h3>Wallets</h3>
              {walletsLoading ? <p role="status">Loading wallets…</p> : walletsError ? (
                <p role="alert">Could not load wallets. <button type="button" onClick={retryWallets}>Try again</button></p>
              ) : wallets.length > 0 ? (
                <ul className="settings-list">{wallets.map(wallet => (
                  <li key={wallet._id}>
                    <div><strong>{wallet.name}</strong><small>{wallet.type} · ₹{Number(wallet.balance ?? 0).toLocaleString('en-IN')}</small></div>
                    <div className="settings-actions">
                      <button type="button" disabled={walletBusy} onClick={() => { setEditingWallet(wallet._id); setWalletName(wallet.name); setWalletType(wallet.type); }}>Edit</button>
                      <button type="button" className="settings-danger" disabled={walletBusy || wallet.balance !== 0} onClick={() => handleRemoveWallet(wallet)}>Remove</button>
                    </div>
                  </li>
                ))}</ul>
              ) : <p>Create a wallet to record transactions or fund savings goals.</p>}
              {wallets.some(wallet => wallet.balance !== 0) && <small>Only wallets with a zero balance can be removed.</small>}
              <form className="settings-form" onSubmit={handleCreateWallet}>
                <h4>{editingWallet ? 'Edit wallet' : 'Create a wallet'}</h4>
                <label>Wallet name <input value={walletName} onChange={event => setWalletName(event.target.value)} required /></label>
                <label>Type <select value={walletType} onChange={event => setWalletType(event.target.value)}>
                  {['Cash', 'Bank', 'UPI', 'Card', 'Other'].map(type => <option key={type}>{type}</option>)}
                </select></label>
                {!editingWallet && <label>Opening balance (₹) <input type="number" step="0.01" value={openingBalance} onChange={event => setOpeningBalance(event.target.value)} required /></label>}
                <div className="settings-actions">
                  <button className="settings-primary" type="submit" disabled={walletBusy}>{editingWallet ? 'Save wallet' : 'Create wallet'}</button>
                  {editingWallet && <button type="button" disabled={walletBusy} onClick={() => { setEditingWallet(null); setWalletName(''); }}>Cancel</button>}
                </div>
              </form>
            </section>
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
                          type="number"
                          min="0"
                          step="0.01"
                          value={liveBudgets[cat._id] ?? String(cat.budget)}
                          disabled={isSaving}
                          onChange={(e) => setLiveBudgets({ ...liveBudgets, [cat._id]: e.target.value })}
                          style={{ width: '110px', padding: '6px 12px 6px 22px', border: `1px solid ${uiColors.border}`, borderRadius: '6px', fontSize: '12px', fontFamily: "'Oswald', sans-serif", fontWeight: 600, color: uiColors.tealDark, outline: 'none', textAlign: 'right', background: uiColors.bgLight, boxSizing: 'border-box' }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeMenu === 'Categories' && (
            <section className="settings-panel">
              <h3>Categories</h3>
              {catsLoading ? <p role="status">Loading categories…</p> : categoriesError ? (
                <p role="alert">Could not load categories. <button type="button" onClick={retryCategories}>Try again</button></p>
              ) : dbCategories.length > 0 ? (
                <ul className="settings-list">{dbCategories.map(category => (
                  <li key={category._id}>
                    <strong>{category.name}</strong>
                    <div className="settings-actions">
                      <button type="button" disabled={categoryBusy} onClick={() => { setEditingCategory(category._id); setCategoryName(category.name); }}>Edit</button>
                      <button type="button" className="settings-danger" disabled={categoryBusy || isSaving} onClick={() => handleRemoveCategory(category)}>Remove</button>
                    </div>
                  </li>
                ))}</ul>
              ) : <p>Create a category to classify your first transaction.</p>}
              <form className="settings-form" onSubmit={handleAddCategory}>
                <h4>{editingCategory ? 'Edit category' : 'Create a category'}</h4>
                <label>Category name <input value={categoryName} onChange={event => setCategoryName(event.target.value)} required /></label>
                <div className="settings-actions">
                  <button className="settings-primary" type="submit" disabled={categoryBusy}>{editingCategory ? 'Save category' : 'Create category'}</button>
                  {editingCategory && <button type="button" disabled={categoryBusy} onClick={() => { setEditingCategory(null); setCategoryName(''); }}>Cancel</button>}
                </div>
              </form>
            </section>
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
                <div className="settings-options-grid">
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
                <div className="settings-options-grid">
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

            </div>
          )}

          {activeMenu === 'Export' && (
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: uiColors.tealDark, textTransform: 'uppercase', borderLeft: '3px solid #648B91', paddingLeft: '12px', marginBottom: '16px' }}>Export Transaction History Data</h3>
              <button type="button" onClick={async () => {
                try {
                  await downloadTransactionExport('csv');
                } catch {
                  showNotification('Export failed. Try again.', 'error');
                }
              }} style={{ padding: '11px 22px', background: uiColors.tealPrimary, border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Download transaction CSV</button>
            </div>
          )}

          {activeMenu === 'Settings' && (
            <div style={{ animation: 'fadeIn 0.2s ease' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: uiColors.tealDark, textTransform: 'uppercase', borderLeft: '3px solid #648B91', paddingLeft: '12px', marginBottom: '16px' }}>Settings</h3>
              <p style={{ color: uiColors.textMuted, fontSize: '12px', marginBottom: '24px' }}>Manage system security runtime access profiles or discharge credentials context locks cleanly.</p>
              
              <div style={{ border: `1px solid ${uiColors.border}`, borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', justifyRules: 'space-between', justifyContent: 'space-between', background: uiColors.bgLight }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#A32D2D' }}>Terminate account access profile session</div>
                  <div style={{ fontSize: '11px', color: uiColors.textMuted, marginTop: '2px' }}>Ends your session on this device.</div>
                </div>
                <button 
                  type="button"
                  disabled={isSigningOut}
                  onClick={async () => {
                    if (!window.confirm('Are you sure you want to sign out?')) return;
                    try {
                      await signOut();
                    } catch {
                      showNotification('Could not sign out. Please try again.', 'error');
                    }
                  }}
                  style={{ padding: '8px 16px', background: uiColors.redBg, border: '1px solid #F5BFBF', borderRadius: '6px', color: uiColors.redText, fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Log Out
                </button>
              </div>
            </div>
          )}

        </div>


      </div>

    </div>
  );
};

export default ProfileSettings;
