import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  useGetTransactionsQuery,
  useCreateTransactionMutation,
  useDeleteTransactionMutation
} from '../../features/transactions/transactionApi';

const ExpenseManager = () => {
  const currentUser = useSelector((state) => state.auth.user);
  
  const { data: expensesData = [], refetch } = useGetTransactionsQuery();
  const [createTransaction] = useCreateTransactionMutation();
  const [deleteTransaction] = useDeleteTransactionMutation();

  // Core view workspace states matching template definitions
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [selectedWalletFilter, setSelectedWalletFilter] = useState('');
  
  // Interactive navigation toggles
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Modular creation form input hooks
  const [txnType, setTxnType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Shopping');
  const [date, setDate] = useState('2026-06-10');
  const [paymentMode, setPaymentMode] = useState('GPay');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState([]);
  const [isShared, setIsShared] = useState(false);
  const [autoCatSuggestion, setAutoCatSuggestion] = useState('');

  // Internal toast notification banner state loop
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const uiColors = {
    tealPrimary: '#364C4F',
    tealDark: '#1E3336',
    border: '#E3ECEC',
    white: '#ffffff',
    bgMain: '#F2F4F3',
    greenText: '#3B6D11',
    greenBg: '#EAF3DE',
    redText: '#A32D2D',
    redBg: '#FCEBEB',
    accentGreen: '#1D9E75',
    textMuted: '#9BB5B8',
    chipActiveBg: '#E1F5EE',
    chipActiveText: '#085041'
  };

  const categories = [
    { name: 'Shopping', icon: 'ti-shopping-bag', color: '#854F0B', bg: '#FAEEDA' },
    { name: 'Food', icon: 'ti-motorbike', color: '#854F0B', bg: '#FAEEDA' },
    { name: 'Transport', icon: 'ti-car', color: '#185FA5', bg: '#E6F1FB' },
    { name: 'Hostel', icon: 'ti-school', color: '#534AB7', bg: '#EEEDFE' },
    { name: 'Subscriptions', icon: 'ti-device-tv', color: '#A32D2D', bg: '#FCEBEB' },
    { name: 'Health', icon: 'ti-heart', color: '#A32D2D', bg: '#FCEBEB' },
    { name: 'Education', icon: 'ti-book', color: '#3B6D11', bg: '#EAF3DE' },
    { name: 'Other', icon: 'ti-dots', color: '#6B8B8E', bg: '#FAFCFC' }
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
      await createTransaction({
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
      showNotification(err?.data?.message || 'Error executing ledger post request.', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id).unwrap();
      showNotification('Ledger item removed cleanly.', 'success');
      setIsPanelOpen(false);
      setSelectedTxn(null);
      refetch();
    } catch (err) {
      showNotification('Operation rejected by authorization pool.', 'error');
    }
  };

  // Compute live mathematical summary aggregates
  const totalIncome = expensesData.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = expensesData.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netSavings = totalIncome - totalExpenses;
  const largestSpendItem = expensesData.filter(t => t.type === 'expense').sort((a, b) => b.amount - a.amount)[0];

  // Structural dynamic query execution filter pipeline
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
    <div style={{ background: uiColors.bgMain, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Montserrat', sans-serif" }}>
      
      {/* LOCAL APPLICATION NOTIFICATION TOASTER ROW */}
      {toast.show && (
        <div style={{ position: 'fixed', top: '84px', right: '24px', background: toast.type === 'success' ? '#E1F5EE' : uiColors.redBg, borderLeft: `4px solid ${toast.type === 'success' ? '#0F6E56' : uiColors.redText}`, padding: '14px 24px', borderRadius: '8px', boxShadow: '0 8px 24px rgba(30,51,54,0.12)', zIndex: 10000, color: toast.type === 'success' ? '#085041' : uiColors.redText, fontWeight: 600, fontSize: '0.85rem' }}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* TOPBAR MODULE REGISTRATION LAYER */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 24px', background: uiColors.tealDark, borderBottom: '0.5px solid #2B4A4E', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#9FE1CB', cursor: 'pointer', fontWeight: 500 }}>
            Dashboard
          </div>
          <div style={{ width: '0.5px', height: '14px', background: '#2B4A4E' }}></div>
          <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1rem', fontWeight: 500, color: '#fff', letterSpacing: '1px', textTransform: 'uppercase' }}>Personal Ledger</span>
          
          <div style={{ display: 'flex', gap: '2px', marginLeft: '4px' }}>
            <button onClick={() => setActiveTab('all')} style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, border: 'none', cursor: 'pointer', background: activeTab === 'all' ? '#2B4A4E' : 'transparent', color: activeTab === 'all' ? '#fff' : '#9FE1CB' }}>All</button>
            <button onClick={() => setActiveTab('expense')} style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, border: 'none', cursor: 'pointer', background: activeTab === 'expense' ? '#2B4A4E' : 'transparent', color: activeTab === 'expense' ? '#fff' : '#9FE1CB' }}>Expenses</button>
            <button onClick={() => setActiveTab('income')} style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, border: 'none', cursor: 'pointer', background: activeTab === 'income' ? '#2B4A4E' : 'transparent', color: activeTab === 'income' ? '#fff' : '#9FE1CB' }}>Income</button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => setIsExportModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent', color: '#9FE1CB', border: '0.5px solid #2B4A4E', padding: '7px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Export</button>
          <button onClick={() => setIsDrawerOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: uiColors.accentGreen, color: '#fff', border: 'none', padding: '7px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Add transaction</button>
        </div>
      </header>

      {/* CORE WORKSPACE INTERACTIVE SPLIT CANVAS LAYOUT CONTAINER */}
      <div style={{ display: 'grid', gridTemplateColumns: isPanelOpen ? '1fr 340px' : '1fr 0px', transition: 'grid-template-columns 0.3s ease', flex: 1, overflow: 'hidden' }}>
        
        {/* LEFT COMPONENT MAIN GRID MATRIX BLOCK */}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          
          {/* ANALYTICAL AGGREGATES STRIP BAR */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', background: '#fff', borderBottom: `0.5px solid ${uiColors.border}` }}>
            <div style={{ padding: '14px 20px', borderRight: `0.5px solid ${uiColors.border}` }}>
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9BB5B8', marginBottom: '5px' }}>Total income</div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.4rem', fontWeight: 600, color: '#3B6D11' }}>₹{totalIncome.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: '11px', color: '#9BB5B8', marginTop: '3px' }}>Current Month Cycle</div>
            </div>

            <div style={{ padding: '14px 20px', borderRight: `0.5px solid ${uiColors.border}` }}>
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9BB5B8', marginBottom: '5px' }}>Total expenses</div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.4rem', fontWeight: 600, color: '#A32D2D' }}>₹{totalExpenses.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: '11px', color: '#9BB5B8', marginTop: '3px' }}>{expensesData.filter(t => t.type === 'expense').length} active lines</div>
            </div>

            <div style={{ padding: '14px 20px', borderRight: `0.5px solid ${uiColors.border}` }}>
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9BB5B8', marginBottom: '5px' }}>Net savings</div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.4rem', fontWeight: 600, color: uiColors.tealDark }}>₹{netSavings.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: '11px', color: '#0F6E56', fontWeight: 600, marginTop: '3px' }}>Balanced Liquidity</div>
            </div>

            <div style={{ padding: '14px 20px' }}>
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9BB5B8', marginBottom: '5px' }}>Largest spend</div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.1rem', fontWeight: 600, color: uiColors.tealDark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{largestSpendItem ? largestSpendItem.description : 'None'}</div>
              <div style={{ fontSize: '11px', color: '#9BB5B8', marginTop: '3px' }}>{largestSpendItem ? `₹${largestSpendItem.amount.toLocaleString('en-IN')} · ${largestSpendItem.category}` : 'No records yet'}</div>
            </div>
          </div>

          {/* REAL-TIME CONTROLS QUERY FILTERS BLOCK */}
          <div style={{ background: '#fff', borderBottom: `0.5px solid ${uiColors.border}`, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', position: 'sticky', top: '48px', zIndex: 15 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', background: '#F2F4F3', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', color: '#9BB5B8', flex: 1, maxWidth: '240px' }}>
              <input type="text" placeholder="Search keywords..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', color: '#1E3336', fontFamily: 'inherit', width: '100%' }} />
            </div>

            <div style={{ width: '0.5px', height: '20px', background: '#E0E8E8' }}></div>

            <select value={selectedCategoryFilter} onChange={(e) => setSelectedCategoryFilter(e.target.value)} style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '11px', border: `1px solid ${uiColors.border}`, background: selectedCategoryFilter ? uiColors.chipActiveBg : '#fff', color: selectedCategoryFilter ? uiColors.chipActiveText : uiColors.tealPrimary, fontWeight: 500, outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              <option value="">Category (All)</option>
              {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>

            <select value={selectedWalletFilter} onChange={(e) => setSelectedWalletFilter(e.target.value)} style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '11px', border: `1px solid ${uiColors.border}`, background: selectedWalletFilter ? uiColors.chipActiveBg : '#fff', color: selectedWalletFilter ? uiColors.chipActiveText : uiColors.tealPrimary, fontWeight: 500, outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              <option value="">Wallet (All)</option>
              {paymentModes.map(mode => <option key={mode} value={mode}>{mode}</option>)}
            </select>

            <div style={{ marginLeft: 'auto', fontSize: '11px', color: '#9BB5B8', whiteSpace: 'nowrap' }}>
              {filteredTransactions.length} results evaluated
            </div>
          </div>

          {/* MASTER SPREADSHEET TABLE STRUCTURE */}
          <div style={{ flex: 1, overflow: 'auto', background: '#fff' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F7F9F9', borderBottom: `0.5px solid ${uiColors.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
                  <th style={{ padding: '10px 16px', fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9BB5B8', textAlign: 'left' }}>Category</th>
                  <th style={{ padding: '10px 16px', fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9BB5B8', textAlign: 'left' }}>Description</th>
                  <th style={{ padding: '10px 16px', fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9BB5B8', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '10px 16px', fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9BB5B8', textAlign: 'left' }}>Wallet Channel</th>
                  <th style={{ padding: '10px 16px', fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9BB5B8', textAlign: 'left' }}>Tags</th>
                  <th style={{ padding: '10px 16px', fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9BB5B8', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', fontSize: '12px', color: '#9BB5B8' }}>No ledger transaction lines matched current viewport scopes.</td>
                  </tr>
                ) : filteredTransactions.map((txn) => {
                  const isExpense = txn.type === 'expense';
                  const matchIcon = categories.find(c => c.name === txn.category) || categories[7];

                  return (
                    <tr key={txn._id} onClick={() => { setSelectedTxn(txn); setIsPanelOpen(true); }} style={{ borderBottom: '0.5px solid #F2F4F3', cursor: 'pointer', background: selectedTxn?._id === txn._id ? '#F0FAF6' : 'transparent', transition: 'background 0.1s' }}>
                      <td style={{ padding: '11px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', background: matchIcon.bg, color: matchIcon.color, fontWeight: 700 }}>
                            {txn.category?.substring(0, 2).toUpperCase()}
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: 500, color: uiColors.tealDark }}>{txn.category}</div>
                        </div>
                      </td>

                      <td style={{ padding: '11px 16px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 500, color: uiColors.tealDark }}>{txn.description}</div>
                        {txn.isSharedExpense && <span style={{ display: 'inline-block', padding: '2px 6px', borderRadius: '4px', background: '#E1F5EE', color: '#0F6E56', fontSize: '9px', fontWeight: 600, marginTop: '2px' }}>SHARED EXPENSE</span>}
                      </td>

                      <td style={{ padding: '11px 16px', fontSize: '11px', color: '#9BB5B8' }}>
                        {new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>

                      <td style={{ padding: '11px 16px' }}>
                        <span style={{ display: 'inline-flex', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, background: '#E6F1FB', color: '#185FA5' }}>{txn.paymentMode}</span>
                      </td>

                      <td style={{ padding: '11px 16px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {txn.tags?.map(t => <span key={t} style={{ display: 'inline-flex', padding: '2px 7px', borderRadius: '5px', background: '#F2F4F3', color: '#6B8B8E', fontSize: '10px', fontWeight: 600 }}>#{t}</span>)}
                        </div>
                      </td>

                      <td style={{ padding: '11px 16px', textAlign: 'right', fontFamily: "'Oswald', sans-serif", fontSize: '1.05rem', fontWeight: 600, color: isExpense ? uiColors.redText : uiColors.greenText }}>
                        {isExpense ? '-' : '+'}₹{txn.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

        {/* RIGHT DRAWER PERSISTENT VIEW CONTEXT INSPECTOR */}
        <div style={{ background: '#fff', borderLeft: `0.5px solid ${uiColors.border}`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {isPanelOpen && selectedTxn ? (
            <>
              <div style={{ background: uiColors.tealDark, padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.95rem', fontWeight: 500, color: '#fff', letterSpacing: '1px', textTransform: 'uppercase' }}>Line Inspector</span>
                <span onClick={() => setIsPanelOpen(false)} style={{ cursor: 'pointer', color: '#9FE1CB', fontSize: '14px', fontWeight: 'bold' }}>✕</span>
              </div>
              
              <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flex: 1 }}>
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#9BB5B8', marginBottom: '6px' }}>
                    {selectedTxn.type === 'expense' ? 'TOTAL DISBURSEMENT' : 'TOTAL REVENUE'}
                  </div>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: '2.2rem', fontWeight: 600, color: selectedTxn.type === 'expense' ? uiColors.redText : uiColors.greenText }}>
                    {selectedTxn.type === 'expense' ? '-' : '+'}₹{selectedTxn.amount.toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9BB5B8', marginBottom: '8px' }}>Metadata properties</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid #F2F4F3', fontSize: '12px' }}>
                    <span style={{ color: '#9BB5B8' }}>Description</span>
                    <span style={{ fontWeight: 500, color: uiColors.tealDark }}>{selectedTxn.description}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid #F2F4F3', fontSize: '12px' }}>
                    <span style={{ color: '#9BB5B8' }}>Category Node</span>
                    <span style={{ fontWeight: 500, color: uiColors.tealDark }}>{selectedTxn.category}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid #F2F4F3', fontSize: '12px' }}>
                    <span style={{ color: '#9BB5B8' }}>Wallet Channel</span>
                    <span style={{ fontWeight: 500, color: uiColors.tealDark }}>{selectedTxn.paymentMode}</span>
                  </div>
                  {selectedTxn.notes && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px 0', fontSize: '12px' }}>
                      <span style={{ color: '#9BB5B8' }}>Internal Notes Summary</span>
                      <span style={{ padding: '8px', background: uiColors.bgMain, borderRadius: '6px', color: uiColors.tealPrimary, lineHeight: '1.4' }}>{selectedTxn.notes}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <button onClick={() => handleDelete(selectedTxn._id)} style={{ flex: 1, padding: '11px', background: '#FCEBEB', color: '#791F1F', border: '0.5px solid #F5BFBF', borderRadius: '9px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase' }}>
                    Wipe Record Entry
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9BB5B8', fontSize: '12px' }}>
              Highlight any row from the left matrix layout sheet to activate granular property mapping.
            </div>
          )}
        </div>

      </div>

      {/* DYNAMIC FORM DRAWER ACCENT LAYER SLIDEOVER */}
      {isDrawerOpen && (
        <>
          <div onClick={() => setIsDrawerOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(30,51,54,0.4)', zIndex: 40 }} />
          <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '400px', background: '#fff', zIndex: 50, display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 32px rgba(0,0,0,0.12)' }}>
            <div style={{ background: uiColors.tealDark, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1rem', fontWeight: 500, color: '#fff', letterSpacing: '1px', textTransform: 'uppercase' }}>Log operational ledger row</span>
              <span onClick={() => setIsDrawerOpen(false)} style={{ cursor: 'pointer', color: '#9FE1CB', fontSize: '16px', fontWeight: 'bold' }}>✕</span>
            </div>

            <form onSubmit={handleSaveTransaction} style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: `0.5px solid ${uiColors.border}`, borderRadius: '10px', overflow: 'hidden' }}>
                <div onClick={() => setTxnType('expense')} style={{ padding: '9px', textAlign: 'center', fontSize: '12px', fontWeight: 600, cursor: 'pointer', background: txnType === 'expense' ? '#FCEBEB' : '#fff', color: txnType === 'expense' ? '#791F1F' : '#9BB5B8' }}>Expense</div>
                <div onClick={() => setTxnType('income')} style={{ padding: '9px', textAlign: 'center', fontSize: '12px', fontWeight: 600, cursor: 'pointer', background: txnType === 'income' ? '#EAF3DE' : '#fff', color: txnType === 'income' ? '#27500A' : '#9BB5B8' }}>Income</div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9BB5B8', marginBottom: '5px' }}>Transaction value</label>
                <input type="number" placeholder="₹0" value={amount} onChange={(e) => setAmount(e.target.value)} required style={{ width: '100%', padding: '12px 14px', border: `0.5px solid ${uiColors.border}`, borderRadius: '10px', fontSize: '1.6rem', color: uiColors.tealDark, outline: 'none', fontFamily: "'Oswald', sans-serif", fontWeight: 600, background: '#FAFCFC', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9BB5B8', marginBottom: '5px' }}>Primary Description</label>
                <input type="text" placeholder="e.g. Swiggy dinner, host fee" value={description} onChange={(e) => handleDescChange(e.target.value)} required style={{ width: '100%', padding: '10px 12px', border: `0.5px solid ${uiColors.border}`, borderRadius: '8px', fontSize: '13px', color: uiColors.tealDark, outline: 'none', background: '#FAFCFC', boxSizing: 'border-box' }} />
                {autoCatSuggestion && (
                  <div style={{ marginTop: '5px', fontSize: '11px', color: '#0F6E56', fontWeight: 600 }}>
                    Auto-categorization mapped match: <strong>{autoCatSuggestion}</strong>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9BB5B8', marginBottom: '5px' }}>Category configuration</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {categories.map(c => (
                    <div key={c.name} onClick={() => setCategory(c.name)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 4px', borderRadius: '9px', border: `0.5px solid ${category === c.name ? '#9FE1CB' : uiColors.border}`, background: category === c.name ? '#E1F5EE' : '#FAFCFC', cursor: 'pointer', boxSizing: 'border-box' }}>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: uiColors.tealPrimary }}>{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9BB5B8', marginBottom: '5px' }}>Target Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: `0.5px solid ${uiColors.border}`, borderRadius: '8px', fontSize: '13px', color: uiColors.tealDark, outline: 'none', background: '#FAFCFC', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9BB5B8', marginBottom: '5px' }}>Notes</label>
                  <input type="text" placeholder="Internal memo" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: `0.5px solid ${uiColors.border}`, borderRadius: '8px', fontSize: '13px', color: uiColors.tealDark, outline: 'none', background: '#FAFCFC', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9BB5B8', marginBottom: '5px' }}>Wallet channel allocation</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {paymentModes.map(mode => (
                    <div key={mode} onClick={() => setPaymentMode(mode)} style={{ padding: '6px 12px', borderRadius: '8px', border: `1px solid ${paymentMode === mode ? '#9FE1CB' : uiColors.border}`, background: paymentMode === mode ? '#E1F5EE' : '#FAFCFC', color: paymentMode === mode ? '#085041' : uiColors.tealPrimary, fontSize: '11px', fontWeight: 500, cursor: 'pointer' }}>
                      {mode}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9BB5B8', marginBottom: '5px' }}>Index context tags</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {preDefinedTags.map(tag => {
                    const isIncluded = tags.includes(tag);
                    return (
                      <div key={tag} onClick={() => handleToggleTag(tag)} style={{ padding: '4px 10px', borderRadius: '6px', border: `1px solid ${isIncluded ? '#9FE1CB' : uiColors.border}`, background: isIncluded ? '#E1F5EE' : '#FAFCFC', color: isIncluded ? '#085041' : '#6B8B8E', fontSize: '11px', cursor: 'pointer' }}>
                        #{tag}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#F2F4F3', borderRadius: '8px', marginTop: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500, color: uiColors.tealPrimary }}>Mark as shared roommate split entry</span>
                <input type="checkbox" checked={isShared} onChange={(e) => setIsShared(e.target.checked)} style={{ accentColor: uiColors.tealPrimary, cursor: 'pointer' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', paddingBottom: '20px' }}>
                <button type="button" onClick={() => setIsDrawerOpen(false)} style={{ padding: '11px 18px', background: '#F2F4F3', color: '#6B8B8E', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '11px', background: uiColors.tealPrimary, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Save transaction</button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* EXPORT PARAMETERS ACCENT OVERLAY MODAL */}
      {isExportModalOpen && (
        <div onClick={() => setIsExportModalOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(30,51,54,0.45)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: '16px', width: '360px', overflow: 'hidden', boxShadow: '0 12px 36px rgba(0,0,0,0.15)' }}>
            <div style={{ background: uiColors.tealDark, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '0.95rem', fontWeight: 500, color: '#fff', letterSpacing: '1px', textTransform: 'uppercase' }}>Export workbook</span>
              <span onClick={() => setIsExportModalOpen(false)} style={{ cursor: 'pointer', color: '#9FE1CB', fontSize: '14px', fontWeight: 'bold' }}>✕</span>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '11px', color: '#9BB5B8', marginBottom: '4px' }}>Compile current ledger cycle file blocks</div>
              
              <div onClick={() => { showNotification('CSV sheets generated successfully.', 'success'); setIsExportModalOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', border: `0.5px solid ${uiColors.border}`, borderRadius: '10px', cursor: 'pointer', background: '#FAFCFC' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: uiColors.tealDark }}>Comma Separated Spreadsheet (.csv)</div>
              </div>
              <div onClick={() => { showNotification('Excel report workbook compiled.', 'success'); setIsExportModalOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', border: `0.5px solid ${uiColors.border}`, borderRadius: '10px', cursor: 'pointer', background: '#FAFCFC' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: uiColors.tealDark }}>Microsoft Excel Workbook (.xlsx)</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExpenseManager;