import { Link } from 'react-router-dom';
import { localDateInput } from '../../utils/calendarDate';
import { useRetryKey } from '../../utils/useRetryKey';
import React, { useState } from 'react';
import {
  useGetTransactionsQuery,
  useGetLedgerTotalsQuery,
  useAddTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation
} from '../../features/transactions/transactionApi';
import { useGetWalletsQuery } from '../../features/wallets/walletApi';
import { useGetCategoriesQuery } from '../../features/categories/categoryApi';
import { useTheme } from '../../context/ThemeContext';
import { getErrorMessage } from '../../utils/errorHandler';
import { downloadTransactionExport } from '../../utils/downloadTransactionExport';

const PAGE_SIZE = 50;

const ExpenseManager = () => {

  const [transactionKey, clearTransactionKey] = useRetryKey();
  const [addTransaction, { isLoading: isAdding }] = useAddTransactionMutation();
  const [updateTransaction, { isLoading: isUpdating }] = useUpdateTransactionMutation();
  const [deleteTransaction, { isLoading: isDeleting }] = useDeleteTransactionMutation();
  const { data: dbWallets = [], isSuccess: walletsLoaded, refetch: refetchWallets } = useGetWalletsQuery();
  const { data: dbCategories = [], isSuccess: categoriesLoaded } = useGetCategoriesQuery();

  const { colors, fontSizeMultiplier } = useTheme();

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [selectedWalletFilter, setSelectedWalletFilter] = useState('');
  
  const [page, setPage] = useState(0);
  const { currentData: rows = [], isFetching, isError, refetch: retryTransactions } = useGetTransactionsQuery({
    limit: PAGE_SIZE + 1,
    offset: page * PAGE_SIZE,
    type: activeTab === 'all' ? undefined : activeTab,
    search: searchQuery.trim() || undefined,
    category: selectedCategoryFilter || undefined,
    wallet: selectedWalletFilter || undefined,
  });
  const filteredTransactions = rows.slice(0, PAGE_SIZE);
  const { data: totals } = useGetLedgerTotalsQuery();
  const [selectedTxnId, setSelectedTxnId] = useState(null);
  const selectedTxn = filteredTransactions.find(txn => txn._id === selectedTxnId);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTxnId, setEditingTxnId] = useState(null);
  const isEditMode = editingTxnId !== null;
  const isSaving = isAdding || isUpdating;
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [txnType, setTxnType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [walletId, setWalletId] = useState('');
  const [date, setDate] = useState(() => localDateInput());
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState([]);
  const [isShared, setIsShared] = useState(false);
  const [autoCatSuggestion, setAutoCatSuggestion] = useState('');

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const paymentModes = ['UPI', 'Cash', 'Card', 'NetBanking'];
  const preDefinedTags = ['food', 'hostel', 'shared', 'recurring', 'college', 'online'];

  const autoRules = {
    swiggy: 'Food', zomato: 'Food', mcdonald: 'Food', subway: 'Food',
    uber: 'Transport', ola: 'Transport', rapido: 'Transport',
    amazon: 'Shopping', flipkart: 'Shopping', myntra: 'Shopping', meesho: 'Shopping',
    netflix: 'Subscriptions', spotify: 'Subscriptions', hotstar: 'Subscriptions',
    mess: 'Hostel', hostel: 'Hostel', rent: 'Hostel',
    gym: 'Health', pharmacy: 'Health', hospital: 'Health'
  };

  const showNotification = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  const handleDescChange = (val) => {
    setDescription(val);
    const lower = val.toLowerCase();
    let foundMatch = false;

    for (const [key, catName] of Object.entries(autoRules)) {
      if (lower.includes(key)) {
        setAutoCatSuggestion(catName);
        const matchingCat = dbCategories.find(c => c.name.toLowerCase() === catName.toLowerCase());
        if (matchingCat) {
          setCategoryId(matchingCat._id);
        }
        foundMatch = true;
        break;
      }
    }
    if (!foundMatch) {
      setAutoCatSuggestion('');
    }
  };

  const handleToggleTag = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setCategoryId(dbCategories[0]?._id || '');
    setWalletId(dbWallets[0]?._id || '');
    setAutoCatSuggestion('');
    setNotes('');
    setTags([]);
    setIsShared(false);
    setPaymentMode('UPI');
    setTxnType('expense');
    setDate(localDateInput());
    setEditingTxnId(null);
  };

  const closeDrawer = () => {
    if (isSaving) return;
    setIsDrawerOpen(false);
    resetForm();
  };

  const openEditDrawer = (txn) => {
    setEditingTxnId(txn._id);
    setAutoCatSuggestion('');
    setTxnType(txn.type);
    setAmount(txn.amount.toString());
    setDescription(txn.description || '');
    setCategoryId(txn.category?._id || '');
    setWalletId(txn.wallet?._id || '');
    setPaymentMode(txn.paymentMode || 'UPI');
    setNotes(txn.notes || '');
    setTags(txn.tags || []);
    setIsShared(txn.isSharedExpense || false);
    setDate(txn.date ? new Date(txn.date).toISOString().split('T')[0] : localDateInput());
    setIsDrawerOpen(true);
  };

  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      showNotification('Enter an amount greater than zero.', 'error');
      return;
    }
    if (!description.trim() || !date) {
      showNotification('Enter a description and date.', 'error');
      return;
    }
    if (!categoryId) {
      showNotification('Please select a category.', 'error');
      return;
    }
    if (!walletId) {
      showNotification('Please select a wallet.', 'error');
      return;
    }

    const transaction = {
      amount: numericAmount,
      description: description.trim(),
      type: txnType,
      category: categoryId,
      wallet: walletId,
      date,
      paymentMode,
      notes: notes.trim(),
      tags,
      isSharedExpense: isShared
    };
    try {
      if (isEditMode) {
        await updateTransaction({ id: editingTxnId, ...transaction }).unwrap();
      } else {
        await addTransaction({ ...transaction, idempotencyKey: transactionKey(transaction) }).unwrap();
        clearTransactionKey();
      }
      showNotification(isEditMode ? 'Transaction updated.' : 'Transaction added.');

      setIsDrawerOpen(false);
      resetForm();
      refetchWallets();
    } catch (err) {
      showNotification(getErrorMessage(err, 'Error saving transaction.'), 'error');
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (isDeleting) return;
    try {
      await deleteTransaction(id).unwrap();
      refetchWallets();
      showNotification('Transaction deleted successfully.', 'success');
      setIsPanelOpen(false);
      setSelectedTxnId(null);
      if (filteredTransactions.length === 1 && page > 0) setPage(page - 1);
    } catch (err) {
      showNotification(getErrorMessage(err, 'Error deleting transaction.'), 'error');
    }
  };

  const handleExport = async (format) => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await downloadTransactionExport(format);
      setIsExportModalOpen(false);
    } catch {
      showNotification('Export failed. Try again.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const { totalIncome = 0, totalExpenses = 0, netSavings = 0, expenseCount = 0, largestSpend: largestSpendItem } = totals || {};

  return (
    <div style={{ background: colors.background, minHeight: '100%', display: 'flex', flexDirection: 'column', fontFamily: "'Montserrat', sans-serif" }}>
      
      {((walletsLoaded && !dbWallets.length) || (categoriesLoaded && !dbCategories.length)) && (
        <p style={{ padding: '12px 24px', color: colors.textPrimary }}>
          Before your first transaction, set up
          {walletsLoaded && !dbWallets.length && <> a <Link to="/settings?tab=Wallets">wallet</Link></>}
          {walletsLoaded && !dbWallets.length && categoriesLoaded && !dbCategories.length && ' and'}
          {categoriesLoaded && !dbCategories.length && <> a <Link to="/settings?tab=Categories">category</Link></>}.
        </p>
      )}

      {toast.show && (
        <div style={{ position: 'fixed', top: '84px', right: '24px', background: toast.type === 'success' ? `${colors.green}1A` : `${colors.red}1A`, borderLeft: `4px solid ${toast.type === 'success' ? colors.green : colors.red}`, padding: '14px 24px', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 10000, color: toast.type === 'success' ? colors.green : colors.red, fontWeight: 600, fontSize: `${12 * fontSizeMultiplier}px` }}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Subheader: filter bar with tab switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 28px', borderBottom: `1px solid ${colors.border}`, backgroundColor: colors.white, position: 'sticky', top: '60px', zIndex: 20, gap: '12px', flexWrap: 'wrap' }}>
        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '4px', background: colors.bgLight, padding: '3px', borderRadius: '10px', border: `1px solid ${colors.border}` }}>
          <button onClick={() => { setActiveTab('all'); setPage(0); setSelectedTxnId(null); setIsPanelOpen(false); }} style={{ padding: '6px 16px', borderRadius: '7px', fontSize: `${12 * fontSizeMultiplier}px`, fontWeight: 600, border: 'none', cursor: 'pointer', background: activeTab === 'all' ? colors.white : 'transparent', color: activeTab === 'all' ? colors.tealDark : colors.textMuted, transition: 'all 0.2s', boxShadow: activeTab === 'all' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', fontFamily: 'inherit' }}>All</button>
          <button onClick={() => { setActiveTab('expense'); setPage(0); setSelectedTxnId(null); setIsPanelOpen(false); }} style={{ padding: '6px 16px', borderRadius: '7px', fontSize: `${12 * fontSizeMultiplier}px`, fontWeight: 600, border: 'none', cursor: 'pointer', background: activeTab === 'expense' ? colors.white : 'transparent', color: activeTab === 'expense' ? colors.red : colors.textMuted, transition: 'all 0.2s', boxShadow: activeTab === 'expense' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', fontFamily: 'inherit' }}>Expenses</button>
          <button onClick={() => { setActiveTab('income'); setPage(0); setSelectedTxnId(null); setIsPanelOpen(false); }} style={{ padding: '6px 16px', borderRadius: '7px', fontSize: `${12 * fontSizeMultiplier}px`, fontWeight: 600, border: 'none', cursor: 'pointer', background: activeTab === 'income' ? colors.white : 'transparent', color: activeTab === 'income' ? colors.green : colors.textMuted, transition: 'all 0.2s', boxShadow: activeTab === 'income' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', fontFamily: 'inherit' }}>Income</button>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => setIsExportModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent', color: colors.textPrimary, border: `1px solid ${colors.border}`, padding: '7px 16px', borderRadius: '8px', fontSize: `${12 * fontSizeMultiplier}px`, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>Export</button>
          <button onClick={() => { resetForm(); setIsDrawerOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1E3336', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: `${12 * fontSizeMultiplier}px`, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}>+ Add transaction</button>
        </div>
      </div>

      <div className="transaction-layout" style={{ display: 'grid', gridTemplateColumns: isPanelOpen ? '1fr 380px' : '1fr 0px', transition: 'grid-template-columns 0.4s cubic-bezier(0.16, 1, 0.3, 1)', flex: 1, overflow: 'hidden' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, background: colors.background }}>
          
          <div className="transaction-totals" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', background: colors.cardBg, borderBottom: `1px solid ${colors.border}` }}>
            <div style={{ padding: '20px 24px', borderRight: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '8px' }}>Total income</div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: `${1.6 * fontSizeMultiplier}rem`, fontWeight: 600, color: colors.green }}>₹{totalIncome.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: `${11 * fontSizeMultiplier}px`, color: colors.textMuted, marginTop: '4px' }}>All time</div>
            </div>

            <div style={{ padding: '20px 24px', borderRight: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '8px' }}>Total expenses</div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: `${1.6 * fontSizeMultiplier}rem`, fontWeight: 600, color: colors.red }}>₹{totalExpenses.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: `${11 * fontSizeMultiplier}px`, color: colors.textMuted, marginTop: '4px' }}>{expenseCount} expenses</div>
            </div>

            <div style={{ padding: '20px 24px', borderRight: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '8px' }}>Net savings</div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: `${1.6 * fontSizeMultiplier}rem`, fontWeight: 600, color: colors.tealDark }}>₹{netSavings.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: `${11 * fontSizeMultiplier}px`, color: colors.green, fontWeight: 600, marginTop: '4px' }}>Income minus expenses</div>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '8px' }}>Largest spend</div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: `${1.3 * fontSizeMultiplier}rem`, fontWeight: 600, color: colors.tealDark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{largestSpendItem ? largestSpendItem.description : 'None'}</div>
              <div style={{ fontSize: `${11 * fontSizeMultiplier}px`, color: colors.textMuted, marginTop: '4px' }}>{largestSpendItem ? `₹${largestSpendItem.amount.toLocaleString('en-IN')} · ${largestSpendItem.category?.name || 'Uncategorized'}` : 'No records yet'}</div>
            </div>
          </div>

          <div style={{ background: colors.white, borderBottom: `1px solid ${colors.border}`, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: colors.bgLight, borderRadius: '10px', padding: '8px 14px', fontSize: `${12 * fontSizeMultiplier}px`, color: colors.textMuted, flex: 1, maxWidth: '280px', border: `1px solid ${colors.border}` }}>
              <input type="text" placeholder="Search keywords..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(0); setSelectedTxnId(null); setIsPanelOpen(false); }} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: `${13 * fontSizeMultiplier}px`, color: colors.textDark, fontFamily: 'inherit', width: '100%' }} />
            </div>

            <div style={{ width: '1px', height: '24px', background: colors.border, margin: '0 4px' }}></div>

            <select value={selectedCategoryFilter} onChange={(e) => { setSelectedCategoryFilter(e.target.value); setPage(0); setSelectedTxnId(null); setIsPanelOpen(false); }} style={{ padding: '8px 14px', borderRadius: '20px', fontSize: `${12 * fontSizeMultiplier}px`, border: `1px solid ${selectedCategoryFilter ? colors.tealPrimary : colors.border}`, background: selectedCategoryFilter ? `${colors.tealPrimary}1A` : colors.white, color: selectedCategoryFilter ? colors.tealDark : colors.textPrimary, fontWeight: 500, outline: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
              <option value="">Category (All)</option>
              {dbCategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>

            <select value={selectedWalletFilter} onChange={(e) => { setSelectedWalletFilter(e.target.value); setPage(0); setSelectedTxnId(null); setIsPanelOpen(false); }} style={{ padding: '8px 14px', borderRadius: '20px', fontSize: `${12 * fontSizeMultiplier}px`, border: `1px solid ${selectedWalletFilter ? colors.tealPrimary : colors.border}`, background: selectedWalletFilter ? `${colors.tealPrimary}1A` : colors.white, color: selectedWalletFilter ? colors.tealDark : colors.textPrimary, fontWeight: 500, outline: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
              <option value="">Wallet (All)</option>
              {dbWallets.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
            </select>

            <div style={{ marginLeft: 'auto', fontSize: `${12 * fontSizeMultiplier}px`, color: colors.textMuted, whiteSpace: 'nowrap', fontWeight: 500 }}>
              {isFetching ? 'Loading transactions…' : isError ? 'Could not load transactions' : `Page ${page + 1}`}
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto', background: colors.background, padding: '20px 24px' }}>
            <div style={{ background: colors.cardBg, borderRadius: '16px', border: `1px solid ${colors.border}`, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: colors.bgLight, borderBottom: `1px solid ${colors.border}` }}>
                    <th style={{ padding: '14px 20px', fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: colors.textMuted, textAlign: 'left' }}>Category</th>
                    <th style={{ padding: '14px 20px', fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: colors.textMuted, textAlign: 'left' }}>Description</th>
                    <th style={{ padding: '14px 20px', fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: colors.textMuted, textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '14px 20px', fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: colors.textMuted, textAlign: 'left' }}>Wallet / payment</th>
                    <th style={{ padding: '14px 20px', fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: colors.textMuted, textAlign: 'left' }}>Tags</th>
                    <th style={{ padding: '14px 20px', fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: colors.textMuted, textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '60px', textAlign: 'center', fontSize: `${13 * fontSizeMultiplier}px`, color: colors.textMuted }}>
                        {isError ? <>Could not load transactions. <button type="button" onClick={retryTransactions}>Try again</button></>
                          : isFetching ? 'Loading transactions…' : 'No transactions match these filters.'}
                      </td>
                    </tr>
                  ) : filteredTransactions.map((txn) => {
          const isExpense = txn.type === 'expense';

                    return (
                      <tr key={txn._id} onClick={() => { setSelectedTxnId(txn._id); setIsPanelOpen(true); }} style={{ borderBottom: `1px solid ${colors.border}`, cursor: 'pointer', background: selectedTxn?._id === txn._id ? `${colors.tealPrimary}0D` : 'transparent', transition: 'background 0.15s ease' }}>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: `${12 * fontSizeMultiplier}px`, background: colors.bgLight, color: colors.textMuted, fontWeight: 700 }}>
                            {txn.category?.name?.substring(0, 2).toUpperCase() || '??'}
                          </div>
                          <div style={{ fontSize: `${13 * fontSizeMultiplier}px`, fontWeight: 600, color: colors.textDark }}>{txn.category?.name || 'Uncategorized'}</div>
                          </div>
                        </td>

                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontSize: `${13 * fontSizeMultiplier}px`, fontWeight: 500, color: colors.textDark }}>{txn.description}</div>
                          {txn.isSharedExpense && <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', background: `${colors.tealPrimary}1A`, color: colors.tealPrimary, fontSize: `${10 * fontSizeMultiplier}px`, fontWeight: 700, marginTop: '4px' }}>SHARED EXPENSE</span>}
                        </td>

                        <td style={{ padding: '16px 20px', fontSize: `${12 * fontSizeMultiplier}px`, color: colors.textPrimary, fontWeight: 500 }}>
                          {new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' })}
                        </td>

                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: '6px', fontSize: `${12 * fontSizeMultiplier}px`, fontWeight: 500, background: colors.bgLight, color: colors.textDark, border: `1px solid ${colors.border}` }}>{[txn.wallet?.name || 'Unknown wallet', txn.paymentMode].filter(Boolean).join(' · ')}</span>
                        </td>

                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {txn.tags?.map(t => <span key={t} style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: '6px', background: colors.bgLight, color: colors.textPrimary, fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 600, border: `1px solid ${colors.border}` }}>#{t}</span>)}
                          </div>
                        </td>

                        <td style={{ padding: '16px 20px', textAlign: 'right', fontFamily: "'Oswald', sans-serif", fontSize: `${1.1 * fontSizeMultiplier}rem`, fontWeight: 600, color: isExpense ? colors.red : colors.green }}>
                          {isExpense ? '-' : '+'}₹{txn.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ display: 'flex', gap: '12px', padding: '16px' }}>
                <button type="button" disabled={page === 0 || isFetching} onClick={() => { setPage(page - 1); setIsPanelOpen(false); }}>Previous</button>
                <button type="button" disabled={rows.length <= PAGE_SIZE || isFetching} onClick={() => { setPage(page + 1); setIsPanelOpen(false); }}>Next</button>
              </div>
            </div>
          </div>

        </div>

        <div className="transaction-details" data-open={Boolean(isPanelOpen && selectedTxn)} style={{ background: colors.cardBg, borderLeft: `1px solid ${colors.border}`, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '-5px 0 20px rgba(0,0,0,0.02)' }}>
          {isPanelOpen && selectedTxn ? (
            <>
              <div style={{ background: colors.tealDark, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: `${1.1 * fontSizeMultiplier}rem`, fontWeight: 500, color: '#fff', letterSpacing: '1px', textTransform: 'uppercase' }}>Line Inspector</span>
                <button type="button" aria-label="Close transaction details" onClick={() => setIsPanelOpen(false)} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: '18px', fontWeight: 'bold', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='rgba(255,255,255,0.6)'}>✕</button>
              </div>
              
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', flex: 1 }}>
                <div style={{ textAlign: 'center', padding: '20px 0', background: selectedTxn.type === 'expense' ? `${colors.red}0D` : `${colors.green}0D`, borderRadius: '16px', border: `1px solid ${selectedTxn.type === 'expense' ? `${colors.red}33` : `${colors.green}33`}` }}>
                  <div style={{ fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: selectedTxn.type === 'expense' ? colors.red : colors.green, opacity: 0.8, marginBottom: '8px' }}>
                    {selectedTxn.type === 'expense' ? 'TOTAL DISBURSEMENT' : 'TOTAL REVENUE'}
                  </div>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: `${2.6 * fontSizeMultiplier}rem`, fontWeight: 600, color: selectedTxn.type === 'expense' ? colors.red : colors.green, lineHeight: 1 }}>
                    {selectedTxn.type === 'expense' ? '-' : '+'}₹{selectedTxn.amount.toLocaleString('en-IN')}
                  </div>
                </div>

                <div style={{ background: colors.white, borderRadius: '16px', padding: '20px', border: `1px solid ${colors.border}` }}>
                  <div style={{ fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '12px' }}>Metadata properties</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${colors.border}`, fontSize: `${13 * fontSizeMultiplier}px` }}>
                    <span style={{ color: colors.textMuted, fontWeight: 500 }}>Description</span>
                    <span style={{ fontWeight: 600, color: colors.textDark }}>{selectedTxn.description}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${colors.border}`, fontSize: `${13 * fontSizeMultiplier}px` }}>
                    <span style={{ color: colors.textMuted, fontWeight: 500 }}>Category Node</span>
                    <span style={{ fontWeight: 600, color: colors.textDark }}>{selectedTxn.category?.name || 'Uncategorized'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${colors.border}`, fontSize: `${13 * fontSizeMultiplier}px` }}>
                    <span style={{ color: colors.textMuted, fontWeight: 500 }}>Wallet Channel</span>
                    <span style={{ fontWeight: 600, color: colors.textDark }}>{selectedTxn.wallet?.name || 'Unknown Wallet'} ({selectedTxn.paymentMode})</span>
                  </div>
                  {selectedTxn.notes && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 0', fontSize: `${13 * fontSizeMultiplier}px` }}>
                      <span style={{ color: colors.textMuted, fontWeight: 500 }}>Internal Notes Summary</span>
                      <span style={{ padding: '12px', background: colors.bgLight, borderRadius: '10px', color: colors.textDark, lineHeight: '1.5', border: `1px solid ${colors.border}` }}>{selectedTxn.notes}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '20px' }}>
                   <button disabled={isDeleting} onClick={() => openEditDrawer(selectedTxn)} style={{ flex: 1, padding: '12px', background: `${colors.tealPrimary}1A`, color: colors.tealPrimary, border: `1px solid ${colors.tealPrimary}4D`, borderRadius: '12px', fontSize: `${13 * fontSizeMultiplier}px`, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                    Edit
                  </button>
                  <button disabled={isDeleting} onClick={() => handleDeleteTransaction(selectedTxn._id)} style={{ flex: 1, padding: '12px', background: `${colors.red}1A`, color: colors.red, border: `1px solid ${colors.red}4D`, borderRadius: '12px', fontSize: `${13 * fontSizeMultiplier}px`, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                    Delete
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: '60px 30px', textAlign: 'center', color: colors.textMuted, fontSize: `${13 * fontSizeMultiplier}px`, lineHeight: 1.6 }}>
              Highlight any row from the left matrix layout sheet to activate granular property mapping.
            </div>
          )}
        </div>

      </div>

      {isDrawerOpen && (
        <>
          <div onClick={closeDrawer} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 40 }} />
          <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '440px', background: colors.cardBg, zIndex: 50, display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 40px rgba(0,0,0,0.15)' }}>
            <div style={{ background: colors.tealDark, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: `${1.1 * fontSizeMultiplier}rem`, fontWeight: 500, color: '#fff', letterSpacing: '1px', textTransform: 'uppercase' }}>Log operational ledger row</span>
              <span onClick={closeDrawer} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: '18px', fontWeight: 'bold' }}>✕</span>
            </div>

            <form onSubmit={handleSaveTransaction} style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: `1px solid ${colors.border}`, borderRadius: '12px', overflow: 'hidden', background: colors.bgLight, padding: '4px' }}>
                <div onClick={() => setTxnType('expense')} style={{ padding: '10px', textAlign: 'center', fontSize: `${13 * fontSizeMultiplier}px`, fontWeight: 600, cursor: 'pointer', background: txnType === 'expense' ? colors.white : 'transparent', color: txnType === 'expense' ? colors.red : colors.textMuted, borderRadius: '8px', boxShadow: txnType === 'expense' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}>Expense</div>
                <div onClick={() => setTxnType('income')} style={{ padding: '10px', textAlign: 'center', fontSize: `${13 * fontSizeMultiplier}px`, fontWeight: 600, cursor: 'pointer', background: txnType === 'income' ? colors.white : 'transparent', color: txnType === 'income' ? colors.green : colors.textMuted, borderRadius: '8px', boxShadow: txnType === 'income' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}>Income</div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '8px' }}>Transaction value</label>
                <input type="number" min="0.01" step="0.01" placeholder="₹0" value={amount} onChange={(e) => setAmount(e.target.value)} required style={{ width: '100%', padding: '16px 20px', border: `1px solid ${colors.border}`, borderRadius: '12px', fontSize: `${1.8 * fontSizeMultiplier}rem`, color: colors.tealDark, outline: 'none', fontFamily: "'Oswald', sans-serif", fontWeight: 600, background: colors.white, boxSizing: 'border-box', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.02)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '8px' }}>Primary Description</label>
                <input type="text" placeholder="e.g. Swiggy dinner, host fee" value={description} onChange={(e) => handleDescChange(e.target.value)} required style={{ width: '100%', padding: '12px 16px', border: `1px solid ${colors.border}`, borderRadius: '10px', fontSize: `${14 * fontSizeMultiplier}px`, color: colors.textDark, outline: 'none', background: colors.white, boxSizing: 'border-box' }} />
                {autoCatSuggestion && (
                  <div style={{ marginTop: '8px', fontSize: `${12 * fontSizeMultiplier}px`, color: colors.green, fontWeight: 600, padding: '8px 12px', background: `${colors.green}1A`, borderRadius: '6px' }}>
                    Auto-categorization mapped match: <strong>{autoCatSuggestion}</strong>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '8px' }}>Category</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {dbCategories.map(c => (
                    <div key={c._id} onClick={() => setCategoryId(c._id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '10px 4px', borderRadius: '10px', border: `1px solid ${categoryId === c._id ? colors.tealPrimary : colors.border}`, background: categoryId === c._id ? `${colors.tealPrimary}1A` : colors.white, cursor: 'pointer', boxSizing: 'border-box', transition: 'all 0.2s' }}>
                      <span style={{ fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 600, color: categoryId === c._id ? colors.tealDark : colors.textPrimary }}>{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '8px' }}>Target Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: '100%', padding: '12px 16px', border: `1px solid ${colors.border}`, borderRadius: '10px', fontSize: `${13 * fontSizeMultiplier}px`, color: colors.textDark, outline: 'none', background: colors.white, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '8px' }}>Notes</label>
                  <input type="text" placeholder="Internal memo" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ width: '100%', padding: '12px 16px', border: `1px solid ${colors.border}`, borderRadius: '10px', fontSize: `${13 * fontSizeMultiplier}px`, color: colors.textDark, outline: 'none', background: colors.white, boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '8px' }}>Wallet</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {dbWallets.map(w => (
                    <div key={w._id} onClick={() => setWalletId(w._id)} style={{ padding: '8px 14px', borderRadius: '8px', border: `1px solid ${walletId === w._id ? colors.tealPrimary : colors.border}`, background: walletId === w._id ? `${colors.tealPrimary}1A` : colors.white, color: walletId === w._id ? colors.tealDark : colors.textPrimary, fontSize: `${12 * fontSizeMultiplier}px`, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                      {w.name} <span style={{ fontSize: '10px', color: colors.textMuted }}>₹{w.balance?.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

              <label style={{ display: 'block', fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '8px', marginTop: '16px' }}>Payment Mode</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {paymentModes.map(mode => (
                    <div key={mode} onClick={() => setPaymentMode(mode)} style={{ padding: '8px 14px', borderRadius: '8px', border: `1px solid ${paymentMode === mode ? colors.tealPrimary : colors.border}`, background: paymentMode === mode ? `${colors.tealPrimary}1A` : colors.white, color: paymentMode === mode ? colors.tealDark : colors.textPrimary, fontSize: `${12 * fontSizeMultiplier}px`, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                      {mode}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '8px' }}>Index context tags</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {preDefinedTags.map(tag => {
                    const isIncluded = tags.includes(tag);
                    return (
                      <div key={tag} onClick={() => handleToggleTag(tag)} style={{ padding: '6px 12px', borderRadius: '8px', border: `1px solid ${isIncluded ? colors.tealPrimary : colors.border}`, background: isIncluded ? `${colors.tealPrimary}1A` : colors.bgLight, color: isIncluded ? colors.tealDark : colors.textPrimary, fontSize: `${12 * fontSizeMultiplier}px`, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}>
                        #{tag}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: colors.bgLight, borderRadius: '10px', marginTop: '4px', border: `1px solid ${colors.border}` }}>
                <span style={{ fontSize: `${13 * fontSizeMultiplier}px`, fontWeight: 600, color: colors.tealPrimary }}>Mark as a shared expense</span>
                <input type="checkbox" checked={isShared} onChange={(e) => setIsShared(e.target.checked)} style={{ accentColor: colors.tealPrimary, cursor: 'pointer', width: '18px', height: '18px' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', paddingBottom: '24px' }}>
                <button type="button" disabled={isSaving} onClick={closeDrawer} style={{ padding: '14px 20px', background: colors.bgLight, color: colors.textPrimary, border: `1px solid ${colors.border}`, borderRadius: '12px', fontSize: `${14 * fontSizeMultiplier}px`, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>Cancel</button>
                <button type="submit" disabled={isSaving} style={{ flex: 1, padding: '14px', background: colors.tealPrimary, color: '#fff', border: 'none', borderRadius: '12px', fontSize: `${14 * fontSizeMultiplier}px`, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', transition: 'all 0.2s' }}>{isSaving ? 'Saving…' : isEditMode ? 'Update Transaction' : 'Save Transaction'}</button>
              </div>
            </form>
          </div>
        </>
      )}

      {isExportModalOpen && (
        <div onClick={() => setIsExportModalOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: colors.cardBg, borderRadius: '20px', width: 'min(400px, calc(100vw - 32px))', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ background: colors.tealDark, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: `${1.1 * fontSizeMultiplier}rem`, fontWeight: 500, color: '#fff', letterSpacing: '1px', textTransform: 'uppercase' }}>Export transactions</span>
              <span onClick={() => setIsExportModalOpen(false)} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: '18px', fontWeight: 'bold' }}>✕</span>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[['csv', 'Download CSV'], ['pdf', 'Download PDF']].map(([format, label]) => (
                <button key={format} type="button" onClick={() => handleExport(format)} disabled={isExporting}
                  style={{ padding: '16px', border: `1px solid ${colors.border}`, borderRadius: '12px', background: colors.bgLight, color: colors.textDark, fontWeight: 600, fontFamily: 'inherit', textAlign: 'left' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExpenseManager;
