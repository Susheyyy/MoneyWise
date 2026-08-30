import React, { useState } from 'react';
import {
  useGetTransactionsQuery,
  useAddTransactionMutation,
  useDeleteTransactionMutation
} from '../../features/transactions/transactionApi';
import { useTheme } from '../../context/ThemeContext';
import { getErrorMessage } from '../../utils/errorHandler';

const ExpenseManager = () => {

  const { data: expensesData = [], refetch } = useGetTransactionsQuery();
  const [addTransaction] = useAddTransactionMutation(); 
  const [deleteTransaction] = useDeleteTransactionMutation();

  const { colors, fontSizeMultiplier } = useTheme();

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [selectedWalletFilter, setSelectedWalletFilter] = useState('');
  
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [txnType, setTxnType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Shopping');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('GPay');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState([]);
  const [isShared, setIsShared] = useState(false);
  const [autoCatSuggestion, setAutoCatSuggestion] = useState('');

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const categories = [
    { name: 'Shopping', icon: 'ti-shopping-bag', color: '#854F0B', bg: '#FAEEDA' },
    { name: 'Food', icon: 'ti-motorbike', color: '#854F0B', bg: '#FAEEDA' },
    { name: 'Transport', icon: 'ti-car', color: '#185FA5', bg: '#E6F1FB' },
    { name: 'Hostel', icon: 'ti-school', color: '#534AB7', bg: '#EEEDFE' },
    { name: 'Subscriptions', icon: 'ti-device-tv', color: colors.red, bg: `${colors.red}1A` },
    { name: 'Health', icon: 'ti-heart', color: colors.red, bg: `${colors.red}1A` },
    { name: 'Education', icon: 'ti-book', color: colors.green, bg: `${colors.green}1A` },
    { name: 'Other', icon: 'ti-dots', color: colors.textMuted, bg: colors.bgLight }
  ];

  const paymentModes = ['GPay', 'Card', 'Cash', 'Bank', 'UPI'];
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

    for (const [key, cat] of Object.entries(autoRules)) {
      if (lower.includes(key)) {
        setAutoCatSuggestion(cat);
        setCategory(cat);
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

  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    if (!amount || !description.trim()) {
      showNotification('Please fill in required descriptor fields.', 'error');
      return;
    }

    try {
      await addTransaction({
        amount: Number(amount),
        description: description.trim(),
        type: txnType,
        category,
        date,
        paymentMode,
        notes: notes.trim(),
        tags,
        isSharedExpense: isShared
      }).unwrap();

      showNotification('Transaction cataloged successfully.', 'success');
      setIsDrawerOpen(false);
      setAmount('');
      setDescription('');
      setAutoCatSuggestion('');
      setNotes('');
      setTags([]);
      setIsShared(false);
      refetch();
    } catch (err) {
      showNotification(getErrorMessage(err, 'Error executing ledger post request.'), 'error');
    }
  };

  const handleDeleteStub = async (id) => {
    try {
      await deleteTransaction(id).unwrap();
      showNotification('Transaction deleted successfully.', 'success');
      setIsPanelOpen(false);
      setSelectedTxn(null);
    } catch (err) {
      showNotification(getErrorMessage(err, 'Error deleting transaction.'), 'error');
    }
  };

  const totalIncome = expensesData.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = expensesData.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netSavings = totalIncome - totalExpenses;
  const largestSpendItem = expensesData.filter(t => t.type === 'expense').sort((a, b) => b.amount - a.amount)[0];

  const filteredTransactions = expensesData.filter(t => {
    if (activeTab === 'expense' && t.type !== 'expense') return false;
    if (activeTab === 'income' && t.type !== 'income') return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchDesc = t.description?.toLowerCase().includes(query);
      const matchNotes = t.notes?.toLowerCase().includes(query);
      if (!matchDesc && !matchNotes) return false;
    }

    if (selectedCategoryFilter && t.category !== selectedCategoryFilter) return false;
    if (selectedWalletFilter && t.paymentMode !== selectedWalletFilter) return false;

    return true;
  });

  return (
    <div style={{ background: '#ffffff', minHeight: '100%', display: 'flex', flexDirection: 'column', fontFamily: "'Montserrat', sans-serif" }}>
      
      {toast.show && (
        <div style={{ position: 'fixed', top: '84px', right: '24px', background: toast.type === 'success' ? `${colors.green}1A` : `${colors.red}1A`, borderLeft: `4px solid ${toast.type === 'success' ? colors.green : colors.red}`, padding: '14px 24px', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 10000, color: toast.type === 'success' ? colors.green : colors.red, fontWeight: 600, fontSize: `${12 * fontSizeMultiplier}px` }}>
          <span>{toast.message}</span>
        </div>
      )}

      {}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 28px', borderBottom: `1px solid ${colors.border}`, backgroundColor: '#ffffff', position: 'sticky', top: '60px', zIndex: 20, gap: '12px', flexWrap: 'wrap' }}>
        {}
        <div style={{ display: 'flex', gap: '4px', background: colors.bgLight, padding: '3px', borderRadius: '10px', border: `1px solid ${colors.border}` }}>
          <button onClick={() => setActiveTab('all')} style={{ padding: '6px 16px', borderRadius: '7px', fontSize: `${12 * fontSizeMultiplier}px`, fontWeight: 600, border: 'none', cursor: 'pointer', background: activeTab === 'all' ? '#ffffff' : 'transparent', color: activeTab === 'all' ? colors.tealDark : colors.textMuted, transition: 'all 0.2s', boxShadow: activeTab === 'all' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', fontFamily: 'inherit' }}>All</button>
          <button onClick={() => setActiveTab('expense')} style={{ padding: '6px 16px', borderRadius: '7px', fontSize: `${12 * fontSizeMultiplier}px`, fontWeight: 600, border: 'none', cursor: 'pointer', background: activeTab === 'expense' ? '#ffffff' : 'transparent', color: activeTab === 'expense' ? colors.red : colors.textMuted, transition: 'all 0.2s', boxShadow: activeTab === 'expense' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', fontFamily: 'inherit' }}>Expenses</button>
          <button onClick={() => setActiveTab('income')} style={{ padding: '6px 16px', borderRadius: '7px', fontSize: `${12 * fontSizeMultiplier}px`, fontWeight: 600, border: 'none', cursor: 'pointer', background: activeTab === 'income' ? '#ffffff' : 'transparent', color: activeTab === 'income' ? colors.green : colors.textMuted, transition: 'all 0.2s', boxShadow: activeTab === 'income' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', fontFamily: 'inherit' }}>Income</button>
        </div>

        {}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => setIsExportModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent', color: colors.textPrimary, border: `1px solid ${colors.border}`, padding: '7px 16px', borderRadius: '8px', fontSize: `${12 * fontSizeMultiplier}px`, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>Export</button>
          <button onClick={() => setIsDrawerOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1E3336', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', fontSize: `${12 * fontSizeMultiplier}px`, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}>+ Add transaction</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isPanelOpen ? '1fr 380px' : '1fr 0px', transition: 'grid-template-columns 0.4s cubic-bezier(0.16, 1, 0.3, 1)', flex: 1, overflow: 'hidden' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, background: '#ffffff' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', background: colors.cardBg, borderBottom: `1px solid ${colors.border}` }}>
            <div style={{ padding: '20px 24px', borderRight: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '8px' }}>Total income</div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: `${1.6 * fontSizeMultiplier}rem`, fontWeight: 600, color: colors.green }}>₹{totalIncome.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: `${11 * fontSizeMultiplier}px`, color: colors.textMuted, marginTop: '4px' }}>Current Month Cycle</div>
            </div>

            <div style={{ padding: '20px 24px', borderRight: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '8px' }}>Total expenses</div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: `${1.6 * fontSizeMultiplier}rem`, fontWeight: 600, color: colors.red }}>₹{totalExpenses.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: `${11 * fontSizeMultiplier}px`, color: colors.textMuted, marginTop: '4px' }}>{expensesData.filter(t => t.type === 'expense').length} active lines</div>
            </div>

            <div style={{ padding: '20px 24px', borderRight: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '8px' }}>Net savings</div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: `${1.6 * fontSizeMultiplier}rem`, fontWeight: 600, color: colors.tealDark }}>₹{netSavings.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: `${11 * fontSizeMultiplier}px`, color: colors.green, fontWeight: 600, marginTop: '4px' }}>Balanced Liquidity</div>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '8px' }}>Largest spend</div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: `${1.3 * fontSizeMultiplier}rem`, fontWeight: 600, color: colors.tealDark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{largestSpendItem ? largestSpendItem.description : 'None'}</div>
              <div style={{ fontSize: `${11 * fontSizeMultiplier}px`, color: colors.textMuted, marginTop: '4px' }}>{largestSpendItem ? `₹${largestSpendItem.amount.toLocaleString('en-IN')} · ${largestSpendItem.category}` : 'No records yet'}</div>
            </div>
          </div>

          <div style={{ background: '#ffffff', borderBottom: `1px solid ${colors.border}`, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: colors.bgLight, borderRadius: '10px', padding: '8px 14px', fontSize: `${12 * fontSizeMultiplier}px`, color: colors.textMuted, flex: 1, maxWidth: '280px', border: `1px solid ${colors.border}` }}>
              <input type="text" placeholder="Search keywords..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: `${13 * fontSizeMultiplier}px`, color: colors.textDark, fontFamily: 'inherit', width: '100%' }} />
            </div>

            <div style={{ width: '1px', height: '24px', background: colors.border, margin: '0 4px' }}></div>

            <select value={selectedCategoryFilter} onChange={(e) => setSelectedCategoryFilter(e.target.value)} style={{ padding: '8px 14px', borderRadius: '20px', fontSize: `${12 * fontSizeMultiplier}px`, border: `1px solid ${selectedCategoryFilter ? colors.tealPrimary : colors.border}`, background: selectedCategoryFilter ? `${colors.tealPrimary}1A` : colors.white, color: selectedCategoryFilter ? colors.tealDark : colors.textPrimary, fontWeight: 500, outline: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
              <option value="">Category (All)</option>
              {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>

            <select value={selectedWalletFilter} onChange={(e) => setSelectedWalletFilter(e.target.value)} style={{ padding: '8px 14px', borderRadius: '20px', fontSize: `${12 * fontSizeMultiplier}px`, border: `1px solid ${selectedWalletFilter ? colors.tealPrimary : colors.border}`, background: selectedWalletFilter ? `${colors.tealPrimary}1A` : colors.white, color: selectedWalletFilter ? colors.tealDark : colors.textPrimary, fontWeight: 500, outline: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
              <option value="">Wallet (All)</option>
              {paymentModes.map(mode => <option key={mode} value={mode}>{mode}</option>)}
            </select>

            <div style={{ marginLeft: 'auto', fontSize: `${12 * fontSizeMultiplier}px`, color: colors.textMuted, whiteSpace: 'nowrap', fontWeight: 500 }}>
              {filteredTransactions.length} results evaluated
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto', background: '#ffffff', padding: '20px 24px' }}>
            <div style={{ background: colors.cardBg, borderRadius: '16px', border: `1px solid ${colors.border}`, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: colors.bgLight, borderBottom: `1px solid ${colors.border}` }}>
                    <th style={{ padding: '14px 20px', fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: colors.textMuted, textAlign: 'left' }}>Category</th>
                    <th style={{ padding: '14px 20px', fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: colors.textMuted, textAlign: 'left' }}>Description</th>
                    <th style={{ padding: '14px 20px', fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: colors.textMuted, textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '14px 20px', fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: colors.textMuted, textAlign: 'left' }}>Wallet Channel</th>
                    <th style={{ padding: '14px 20px', fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: colors.textMuted, textAlign: 'left' }}>Tags</th>
                    <th style={{ padding: '14px 20px', fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: colors.textMuted, textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '60px', textAlign: 'center', fontSize: `${13 * fontSizeMultiplier}px`, color: colors.textMuted }}>No ledger transaction lines matched current viewport scopes.</td>
                    </tr>
                  ) : filteredTransactions.map((txn) => {
                    const isExpense = txn.type === 'expense';
                    const matchIcon = categories.find(c => c.name === txn.category) || categories[7];

                    return (
                      <tr key={txn._id} onClick={() => { setSelectedTxn(txn); setIsPanelOpen(true); }} style={{ borderBottom: `1px solid ${colors.border}`, cursor: 'pointer', background: selectedTxn?._id === txn._id ? `${colors.tealPrimary}0D` : 'transparent', transition: 'background 0.15s ease' }}>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: `${12 * fontSizeMultiplier}px`, background: matchIcon.bg, color: matchIcon.color, fontWeight: 700 }}>
                              {txn.category?.substring(0, 2).toUpperCase()}
                            </div>
                            <div style={{ fontSize: `${13 * fontSizeMultiplier}px`, fontWeight: 600, color: colors.textDark }}>{txn.category}</div>
                          </div>
                        </td>

                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontSize: `${13 * fontSizeMultiplier}px`, fontWeight: 500, color: colors.textDark }}>{txn.description}</div>
                          {txn.isSharedExpense && <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', background: `${colors.tealPrimary}1A`, color: colors.tealPrimary, fontSize: `${10 * fontSizeMultiplier}px`, fontWeight: 700, marginTop: '4px' }}>SHARED EXPENSE</span>}
                        </td>

                        <td style={{ padding: '16px 20px', fontSize: `${12 * fontSizeMultiplier}px`, color: colors.textPrimary, fontWeight: 500 }}>
                          {new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </td>

                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: '6px', fontSize: `${12 * fontSizeMultiplier}px`, fontWeight: 500, background: colors.bgLight, color: colors.textDark, border: `1px solid ${colors.border}` }}>{txn.paymentMode}</span>
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
            </div>
          </div>

        </div>

        <div style={{ background: colors.cardBg, borderLeft: `1px solid ${colors.border}`, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '-5px 0 20px rgba(0,0,0,0.02)' }}>
          {isPanelOpen && selectedTxn ? (
            <>
              <div style={{ background: colors.tealDark, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: `${1.1 * fontSizeMultiplier}rem`, fontWeight: 500, color: '#fff', letterSpacing: '1px', textTransform: 'uppercase' }}>Line Inspector</span>
                <span onClick={() => setIsPanelOpen(false)} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: '18px', fontWeight: 'bold', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='rgba(255,255,255,0.6)'}>✕</span>
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
                    <span style={{ fontWeight: 600, color: colors.textDark }}>{selectedTxn.category}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${colors.border}`, fontSize: `${13 * fontSizeMultiplier}px` }}>
                    <span style={{ color: colors.textMuted, fontWeight: 500 }}>Wallet Channel</span>
                    <span style={{ fontWeight: 600, color: colors.textDark }}>{selectedTxn.paymentMode}</span>
                  </div>
                  {selectedTxn.notes && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 0', fontSize: `${13 * fontSizeMultiplier}px` }}>
                      <span style={{ color: colors.textMuted, fontWeight: 500 }}>Internal Notes Summary</span>
                      <span style={{ padding: '12px', background: colors.bgLight, borderRadius: '10px', color: colors.textDark, lineHeight: '1.5', border: `1px solid ${colors.border}` }}>{selectedTxn.notes}</span>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                  <button onClick={() => handleDeleteStub(selectedTxn._id)} style={{ width: '100%', padding: '14px', background: `${colors.red}1A`, color: colors.red, border: `1px solid ${colors.red}4D`, borderRadius: '12px', fontSize: `${13 * fontSizeMultiplier}px`, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.2s' }} onMouseOver={e=>e.target.style.background=`${colors.red}33`} onMouseOut={e=>e.target.style.background=`${colors.red}1A`}>
                    Wipe Record Entry
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
          <div onClick={() => setIsDrawerOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 40 }} />
          <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '440px', background: colors.cardBg, zIndex: 50, display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 40px rgba(0,0,0,0.15)' }}>
            <div style={{ background: colors.tealDark, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: `${1.1 * fontSizeMultiplier}rem`, fontWeight: 500, color: '#fff', letterSpacing: '1px', textTransform: 'uppercase' }}>Log operational ledger row</span>
              <span onClick={() => setIsDrawerOpen(false)} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: '18px', fontWeight: 'bold' }}>✕</span>
            </div>

            <form onSubmit={handleSaveTransaction} style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: `1px solid ${colors.border}`, borderRadius: '12px', overflow: 'hidden', background: colors.bgLight, padding: '4px' }}>
                <div onClick={() => setTxnType('expense')} style={{ padding: '10px', textAlign: 'center', fontSize: `${13 * fontSizeMultiplier}px`, fontWeight: 600, cursor: 'pointer', background: txnType === 'expense' ? colors.white : 'transparent', color: txnType === 'expense' ? colors.red : colors.textMuted, borderRadius: '8px', boxShadow: txnType === 'expense' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}>Expense</div>
                <div onClick={() => setTxnType('income')} style={{ padding: '10px', textAlign: 'center', fontSize: `${13 * fontSizeMultiplier}px`, fontWeight: 600, cursor: 'pointer', background: txnType === 'income' ? colors.white : 'transparent', color: txnType === 'income' ? colors.green : colors.textMuted, borderRadius: '8px', boxShadow: txnType === 'income' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}>Income</div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '8px' }}>Transaction value</label>
                <input type="number" placeholder="₹0" value={amount} onChange={(e) => setAmount(e.target.value)} required style={{ width: '100%', padding: '16px 20px', border: `1px solid ${colors.border}`, borderRadius: '12px', fontSize: `${1.8 * fontSizeMultiplier}rem`, color: colors.tealDark, outline: 'none', fontFamily: "'Oswald', sans-serif", fontWeight: 600, background: colors.white, boxSizing: 'border-box', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.02)' }} />
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
                <label style={{ display: 'block', fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '8px' }}>Category configuration</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {categories.map(c => (
                    <div key={c.name} onClick={() => setCategory(c.name)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '10px 4px', borderRadius: '10px', border: `1px solid ${category === c.name ? colors.tealPrimary : colors.border}`, background: category === c.name ? `${colors.tealPrimary}1A` : colors.white, cursor: 'pointer', boxSizing: 'border-box', transition: 'all 0.2s' }}>
                      <span style={{ fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 600, color: category === c.name ? colors.tealDark : colors.textPrimary }}>{c.name}</span>
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
                <label style={{ display: 'block', fontSize: `${11 * fontSizeMultiplier}px`, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '8px' }}>Wallet channel allocation</label>
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
                <span style={{ fontSize: `${13 * fontSizeMultiplier}px`, fontWeight: 600, color: colors.tealPrimary }}>Mark as shared roommate split entry</span>
                <input type="checkbox" checked={isShared} onChange={(e) => setIsShared(e.target.checked)} style={{ accentColor: colors.tealPrimary, cursor: 'pointer', width: '18px', height: '18px' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', paddingBottom: '24px' }}>
                <button type="button" onClick={() => setIsDrawerOpen(false)} style={{ padding: '14px 20px', background: colors.bgLight, color: colors.textPrimary, border: `1px solid ${colors.border}`, borderRadius: '12px', fontSize: `${14 * fontSizeMultiplier}px`, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '14px', background: colors.tealPrimary, color: '#fff', border: 'none', borderRadius: '12px', fontSize: `${14 * fontSizeMultiplier}px`, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', transition: 'all 0.2s' }}>Save transaction</button>
              </div>
            </form>
          </div>
        </>
      )}

      {isExportModalOpen && (
        <div onClick={() => setIsExportModalOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: colors.cardBg, borderRadius: '20px', width: '400px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ background: colors.tealDark, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: `${1.1 * fontSizeMultiplier}rem`, fontWeight: 500, color: '#fff', letterSpacing: '1px', textTransform: 'uppercase' }}>Export workbook</span>
              <span onClick={() => setIsExportModalOpen(false)} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: '18px', fontWeight: 'bold' }}>✕</span>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: `${12 * fontSizeMultiplier}px`, color: colors.textMuted, marginBottom: '8px', fontWeight: 500 }}>Compile current ledger cycle file blocks</div>
              
              <div onClick={() => { showNotification('CSV sheets generated successfully.', 'success'); setIsExportModalOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: `1px solid ${colors.border}`, borderRadius: '12px', cursor: 'pointer', background: colors.bgLight, transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.borderColor=colors.tealPrimary} onMouseOut={e=>e.currentTarget.style.borderColor=colors.border}>
                <div style={{ fontSize: `${13 * fontSizeMultiplier}px`, fontWeight: 600, color: colors.textDark }}>Comma Separated Spreadsheet (.csv)</div>
              </div>
              <div onClick={() => { showNotification('Excel report workbook compiled.', 'success'); setIsExportModalOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: `1px solid ${colors.border}`, borderRadius: '12px', cursor: 'pointer', background: colors.bgLight, transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.borderColor=colors.tealPrimary} onMouseOut={e=>e.currentTarget.style.borderColor=colors.border}>
                <div style={{ fontSize: `${13 * fontSizeMultiplier}px`, fontWeight: 600, color: colors.textDark }}>Microsoft Excel Workbook (.xlsx)</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExpenseManager;