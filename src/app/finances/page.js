'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Wallet, Plus, X, TrendingUp, TrendingDown, Clock, CheckCircle2, AlertCircle, DollarSign, PieChart, Calendar, Edit2, Trash2 } from 'lucide-react';

const BILL_CATS = ['Housing', 'Utilities', 'Subscriptions', 'Insurance', 'Transportation', 'Medical', 'Other'];
const EXPENSE_CATS = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Health', 'Other'];
const PERIODS = ['weekly', 'monthly', 'annual'];

export default function FinancesPage() {
  const { bills, budgets, expenses, members, currentUser, addItem, updateItem, removeItem, isLoading, addNotification } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddBill, setShowAddBill] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddBudget, setShowAddBudget] = useState(false);
  
  const [editingBill, setEditingBill] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingBudget, setEditingBudget] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [newBill, setNewBill] = useState({ name: '', amount: '', due_date: '', recurrence: 'monthly', category: 'Other', remind_days_before: 3, status: 'pending' });
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'Food', paid_by: currentUser?.id || '' });
  const [newBudget, setNewBudget] = useState({ name: '', amount: '', period: 'monthly', category: 'Food', spent: 0 });

  if (isLoading) return <div className="loading-state">Syncing finances...</div>;

  const pendingBills = bills.filter(b => b.status === 'pending');
  const paidBills = bills.filter(b => b.status === 'paid');
  const totalDue = pendingBills.reduce((s, b) => s + b.amount, 0);
  const totalPaid = paidBills.reduce((s, b) => s + b.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  const catSpend = expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {});
  const maxCatSpend = Math.max(...Object.values(catSpend), 1);

  const resetBill = () => {
    setNewBill({ name: '', amount: '', due_date: '', recurrence: 'monthly', category: 'Other', remind_days_before: 3, status: 'pending' });
    setEditingBill(null);
    setShowAddBill(false);
  };

  const resetExpense = () => {
    setNewExpense({ description: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'Food', paid_by: currentUser?.id || '' });
    setEditingExpense(null);
    setShowAddExpense(false);
  };

  const resetBudget = () => {
    setNewBudget({ name: '', amount: '', period: 'monthly', category: 'Food', spent: 0 });
    setEditingBudget(null);
    setShowAddBudget(false);
  };

  const openAddBill = () => {
    resetBill();
    setShowAddBill(true);
  };

  const openAddExpense = () => {
    resetExpense();
    setShowAddExpense(true);
  };

  const openAddBudget = () => {
    resetBudget();
    setShowAddBudget(true);
  };

  const openEditBill = (bill) => {
    setNewBill({ ...bill, amount: bill.amount.toString() });
    setEditingBill(bill);
    setShowAddBill(true);
  };

  const openEditExpense = (exp) => {
    setNewExpense({ ...exp, amount: exp.amount.toString() });
    setEditingExpense(exp);
    setShowAddExpense(true);
  };

  const openEditBudget = (budget) => {
    setNewBudget({ ...budget, amount: budget.amount.toString() });
    setEditingBudget(budget);
    setShowAddBudget(true);
  };

  const handleSubmitBill = async () => {
    if (!newBill.name || !newBill.amount || !newBill.due_date) {
      addNotification('error', 'Please fill in required fields');
      return;
    }
    if (isSaving) return;
    setIsSaving(true);
    try {
      const payload = { ...newBill, amount: parseFloat(newBill.amount) };
      let success = false;
      if (editingBill) {
        success = await updateItem('bills', editingBill.id, payload);
      } else {
        success = await addItem('bills', payload);
      }
      if (success) resetBill();
    } catch (err) {
      console.error('Bill submit error:', err);
      addNotification('error', 'Failed to save bill');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitExpense = async () => {
    if (!newExpense.description || !newExpense.amount) {
      addNotification('error', 'Please fill in required fields');
      return;
    }
    if (isSaving) return;
    setIsSaving(true);
    try {
      const payload = { ...newExpense, amount: parseFloat(newExpense.amount) };
      let success = false;
      if (editingExpense) {
        success = await updateItem('expenses', editingExpense.id, payload);
      } else {
        success = await addItem('expenses', payload);
      }
      if (success) resetExpense();
    } catch (err) {
      console.error('Expense submit error:', err);
      addNotification('error', 'Failed to save expense');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitBudget = async () => {
    if (!newBudget.name || !newBudget.amount) {
      addNotification('error', 'Please fill in required fields');
      return;
    }
    if (isSaving) return;
    setIsSaving(true);
    try {
      const payload = { ...newBudget, amount: parseFloat(newBudget.amount), household_id: currentUser?.household_id };
      let success = false;
      if (editingBudget) {
        success = await updateItem('budgets', editingBudget.id, payload);
      } else {
        success = await addItem('budgets', payload);
      }
      if (success) resetBudget();
    } catch (err) {
      console.error('Budget submit error:', err);
      addNotification('error', 'Failed to save budget');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (type, id) => {
    if (isSaving || !window.confirm('Delete this item?')) return;
    setIsSaving(true);
    await removeItem(type, id);
    setIsSaving(false);
  };

  const toggleBillStatus = async (id) => {
    const bill = bills.find(b => b.id === id);
    if (!bill) return;
    const newStatus = bill.status === 'paid' ? 'pending' : 'paid';
    await updateItem('bills', id, { status: newStatus });
  };

  const getMemberName = (id) => members.find(m => m.id === id)?.full_name || 'Partner';

  return (
    <div className="finances-page">
      <div className="page-header">
        <div>
          <h1><Wallet size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 12 }} />Finances</h1>
          <p>Track bills, budgets, and expenses — stay on top of your money.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={openAddExpense}><Plus size={16} /> Expense</button>
          <button className="btn btn-primary" onClick={openAddBill}><Plus size={16} /> Bill</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="fin-summary">
        <div className="fin-card red"><DollarSign size={20} /><div><span className="fc-val">${totalDue.toLocaleString()}</span><span className="fc-lbl">Due This Month</span></div></div>
        <div className="fin-card green"><CheckCircle2 size={20} /><div><span className="fc-val">${totalPaid.toLocaleString()}</span><span className="fc-lbl">Paid</span></div></div>
        <div className="fin-card blue"><TrendingDown size={20} /><div><span className="fc-val">${totalExpenses.toFixed(0)}</span><span className="fc-lbl">Total Expenses</span></div></div>
        <div className="fin-card yellow"><PieChart size={20} /><div><span className="fc-val">{budgets.length}</span><span className="fc-lbl">Active Budgets</span></div></div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 24 }}>
        {['overview', 'bills', 'budgets', 'expenses'].map(t => (
          <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="fin-grid">
          {/* Spending by Category */}
          <div className="fin-section">
            <h3>Spending by Category</h3>
            <div className="cat-bars">
              {Object.entries(catSpend).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => (
                <div key={cat} className="cat-bar-row">
                  <span className="cb-label">{cat}</span>
                  <div className="cb-track"><div className="cb-fill" style={{ width: `${(amount / maxCatSpend) * 100}%` }} /></div>
                  <span className="cb-val">${amount.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Budget Progress */}
          <div className="fin-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>Budget Progress</h3>
              <button className="btn btn-ghost btn-sm" onClick={openAddBudget}><Plus size={14} /> Add Budget</button>
            </div>
            {budgets.map(b => {
              const pct = Math.min((b.spent / b.amount) * 100, 100);
              const isOver = b.spent > b.amount;
              return (
                <div key={b.id} className="budget-row">
                  <div className="br-header">
                    <span className="br-name">{b.name}</span>
                    <span className="badge badge-gray">{b.period}</span>
                  </div>
                  <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${pct}%`, background: isOver ? 'var(--error)' : undefined }} /></div>
                  <div className="br-footer">
                    <span className={isOver ? 'text-error' : ''}>${b.spent.toFixed(0)} / ${b.amount.toFixed(0)}</span>
                    <span>{pct.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'bills' && (
        <div className="bills-list">
          {bills.sort((a, b) => new Date(a.due_date) - new Date(b.due_date)).map(bill => (
            <div key={bill.id} className={`bill-item ${bill.status}`}>
              <button className="bill-check" onClick={() => toggleBillStatus(bill.id)}>
                {bill.status === 'paid' ? <CheckCircle2 size={20} /> : <div className="bill-unchecked" />}
              </button>
              <div className="bi-info">
                <span className="bi-name">{bill.name}</span>
                <span className="bi-meta"><Clock size={13} /> Due {new Date(bill.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {bill.recurrence}</span>
              </div>
              <span className="badge badge-gray">{bill.category}</span>
              <span className="bi-amount">${bill.amount.toFixed(2)}</span>
              <div className="item-actions">
                <button className="btn btn-ghost btn-icon sm" onClick={() => openEditBill(bill)}><Edit2 size={14} /></button>
                <button className="btn btn-ghost btn-icon sm text-error" onClick={() => handleRemove('bills', bill.id)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'budgets' && (
        <div className="budgets-grid">
          {budgets.map(b => {
            const pct = Math.min((b.spent / b.amount) * 100, 100);
            const remaining = b.amount - b.spent;
            return (
              <div key={b.id} className="budget-card">
                <div className="bc-top">
                  <div>
                    <span className="bc-name">{b.name}</span>
                    <span className="badge badge-gray" style={{ marginLeft: 8 }}>{b.period}</span>
                  </div>
                  <div className="bc-actions">
                    <button className="btn btn-ghost btn-icon sm" onClick={() => openEditBudget(b)}><Edit2 size={14} /></button>
                    <button className="btn btn-ghost btn-icon sm text-error" onClick={() => handleRemove('budgets', b.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="bc-amounts"><span className="bc-spent">${b.spent.toFixed(0)}</span><span className="bc-total">of ${b.amount.toFixed(0)}</span></div>
                <div className="progress-bar" style={{ height: 8 }}><div className="progress-bar-fill" style={{ width: `${pct}%`, background: remaining < 0 ? 'var(--error)' : undefined }} /></div>
                <span className="bc-remaining" style={{ color: remaining < 0 ? 'var(--error)' : 'var(--success)' }}>{remaining >= 0 ? `$${remaining.toFixed(0)} remaining` : `$${Math.abs(remaining).toFixed(0)} over budget`}</span>
              </div>
            );
          })}
          <button className="budget-card add-budget" onClick={openAddBudget}>
            <Plus size={24} /><span>Add Budget</span>
          </button>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="expenses-list">
          {expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map(exp => (
            <div key={exp.id} className="expense-item">
              <div className="ei-info"><span className="ei-desc">{exp.description}</span><span className="ei-meta">{new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · Paid by {getMemberName(exp.paid_by)}</span></div>
              <span className="ei-amount">-${exp.amount.toFixed(2)}</span>
              <div className="item-actions">
                <button className="btn btn-ghost btn-icon sm" onClick={() => openEditExpense(exp)}><Edit2 size={14} /></button>
                <button className="btn btn-ghost btn-icon sm text-error" onClick={() => handleRemove('expenses', exp.id)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Bill Modal */}
      {showAddBill && (
        <div className="modal-overlay" onClick={() => setShowAddBill(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{editingBill ? 'Edit Bill' : 'Add Bill'}</h2><button className="btn btn-ghost btn-icon" onClick={resetBill}><X size={18} /></button></div>
            <div className="modal-body">
              <div className="input-group"><label className="input-label">Bill Name</label><input className="input" value={newBill.name} onChange={e => setNewBill({ ...newBill, name: e.target.value })} placeholder="e.g. Rent" /></div>
              <div className="input-group"><label className="input-label">Amount ($)</label><input className="input" type="number" value={newBill.amount} onChange={e => setNewBill({ ...newBill, amount: e.target.value })} placeholder="0.00" /></div>
              <div className="input-group"><label className="input-label">Due Date</label><input className="input" type="date" value={newBill.due_date} onChange={e => setNewBill({ ...newBill, due_date: e.target.value })} /></div>
              <div className="input-group"><label className="input-label">Category</label><select className="select" value={newBill.category} onChange={e => setNewBill({ ...newBill, category: e.target.value })}>{BILL_CATS.map(c => <option key={c}>{c}</option>)}</select></div>
              <div className="input-group"><label className="input-label">Recurrence</label><select className="select" value={newBill.recurrence} onChange={e => setNewBill({ ...newBill, recurrence: e.target.value })}><option>monthly</option><option>weekly</option><option>yearly</option><option>one-time</option></select></div>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={resetBill}>Cancel</button><button className="btn btn-primary" onClick={handleSubmitBill} disabled={isSaving}>{isSaving ? 'Saving...' : (editingBill ? 'Save Changes' : 'Add Bill')}</button></div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="modal-overlay" onClick={() => setShowAddExpense(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{editingExpense ? 'Edit Expense' : 'Add Expense'}</h2><button className="btn btn-ghost btn-icon" onClick={resetExpense}><X size={18} /></button></div>
            <div className="modal-body">
              <div className="input-group"><label className="input-label">Description</label><input className="input" value={newExpense.description} onChange={e => setNewExpense({ ...newExpense, description: e.target.value })} placeholder="e.g. Whole Foods" /></div>
              <div className="input-group"><label className="input-label">Amount ($)</label><input className="input" type="number" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} placeholder="0.00" /></div>
              <div className="input-group"><label className="input-label">Date</label><input className="input" type="date" value={newExpense.date} onChange={e => setNewExpense({ ...newExpense, date: e.target.value })} /></div>
              <div className="input-group"><label className="input-label">Category</label><select className="select" value={newExpense.category} onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}>{EXPENSE_CATS.map(c => <option key={c}>{c}</option>)}</select></div>
              <div className="input-group"><label className="input-label">Paid By</label><select className="select" value={newExpense.paid_by} onChange={e => setNewExpense({ ...newExpense, paid_by: e.target.value })}>{members.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}</select></div>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={resetExpense}>Cancel</button><button className="btn btn-primary" onClick={handleSubmitExpense} disabled={isSaving}>{isSaving ? 'Saving...' : (editingExpense ? 'Save Changes' : 'Add Expense')}</button></div>
          </div>
        </div>
      )}

      {/* Add Budget Modal */}
      {showAddBudget && (
        <div className="modal-overlay" onClick={() => setShowAddBudget(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{editingBudget ? 'Edit Budget' : 'Create Budget'}</h2><button className="btn btn-ghost btn-icon" onClick={resetBudget}><X size={18} /></button></div>
            <div className="modal-body">
              <div className="input-group"><label className="input-label">Budget Name</label><input className="input" value={newBudget.name} onChange={e => setNewBudget({ ...newBudget, name: e.target.value })} placeholder="e.g. Weekly Food Budget" /></div>
              <div className="input-group"><label className="input-label">Budget Amount ($)</label><input className="input" type="number" value={newBudget.amount} onChange={e => setNewBudget({ ...newBudget, amount: e.target.value })} placeholder="0.00" /></div>
              <div className="input-group"><label className="input-label">Period</label><select className="select" value={newBudget.period} onChange={e => setNewBudget({ ...newBudget, period: e.target.value })}>{PERIODS.map(p => <option key={p}>{p}</option>)}</select></div>
              <div className="input-group"><label className="input-label">Category</label><select className="select" value={newBudget.category} onChange={e => setNewBudget({ ...newBudget, category: e.target.value })}>{EXPENSE_CATS.map(c => <option key={c}>{c}</option>)}</select></div>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={resetBudget}>Cancel</button><button className="btn btn-primary" onClick={handleSubmitBudget} disabled={isSaving}>{isSaving ? 'Saving...' : (editingBudget ? 'Save Changes' : 'Create Budget')}</button></div>
          </div>
        </div>
      )}

      <style jsx>{`
        .finances-page { max-width: 1100px; animation: fadeIn 0.4s ease; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
        .page-header h1 { font-size: 1.75rem; margin-bottom: 4px; }
        .page-header p { color: var(--text-tertiary); }

        .fin-summary { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 28px; }
        .fin-card { display: flex; align-items: center; gap: 16px; padding: 22px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 16px; }
        .fin-card.red svg { color: var(--accent-primary); }
        .fin-card.green svg { color: var(--success); }
        .fin-card.blue svg { color: var(--info); }
        .fin-card.yellow svg { color: var(--warning); }
        .fc-val { font-size: 1.375rem; font-weight: 700; font-family: var(--font-display); display: block; }
        .fc-lbl { font-size: 0.8125rem; color: var(--text-tertiary); }

        .fin-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .fin-section { background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 24px; }
        .fin-section h3 { margin-bottom: 20px; font-size: 1rem; }

        .cat-bars { display: flex; flex-direction: column; gap: 14px; }
        .cat-bar-row { display: flex; align-items: center; gap: 12px; }
        .cb-label { font-size: 0.8125rem; color: var(--text-secondary); width: 100px; }
        .cb-track { flex: 1; height: 8px; background: var(--bg-quaternary); border-radius: 4px; overflow: hidden; }
        .cb-fill { height: 100%; background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary)); border-radius: 4px; transition: width 0.5s; }
        .cb-val { font-size: 0.8125rem; font-weight: 600; color: var(--text-primary); min-width: 48px; text-align: right; }

        .budget-row { padding: 14px 0; border-bottom: 1px solid var(--border-subtle); }
        .budget-row:last-child { border-bottom: none; }
        .br-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .br-name { font-weight: 500; font-size: 0.9375rem; }
        .br-footer { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-tertiary); margin-top: 6px; }
        .text-error { color: var(--error) !important; }

        .bills-list, .expenses-list { display: flex; flex-direction: column; gap: 8px; }
        .bill-item, .expense-item { display: flex; align-items: center; gap: 14px; padding: 16px 20px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 12px; transition: all 0.2s; }
        .bill-item:hover, .expense-item:hover { border-color: var(--border-default); }
        .bill-item.paid { opacity: 0.5; }
        .bill-item.paid .bi-name { text-decoration: line-through; }
        .bill-check { background: none; border: none; cursor: pointer; color: var(--success); display: flex; }
        .bill-unchecked { width: 20px; height: 20px; border: 2px solid var(--border-strong); border-radius: 50%; }
        .bi-info, .ei-info { flex: 1; display: flex; flex-direction: column; }
        .bi-name, .ei-desc { font-weight: 500; }
        .bi-meta, .ei-meta { font-size: 0.75rem; color: var(--text-tertiary); display: flex; align-items: center; gap: 4px; margin-top: 2px; }
        .bi-amount { font-size: 1.125rem; font-weight: 700; color: var(--accent-warm); }
        .ei-amount { font-size: 1rem; font-weight: 600; color: var(--error); }
        .item-actions { display: flex; gap: 4px; opacity: 0; transition: opacity 0.2s; }
        .bill-item:hover .item-actions, .expense-item:hover .item-actions { opacity: 1; }

        .budgets-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
        .budget-card { background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 24px; position: relative; }
        .budget-card.add-budget { border-style: dashed; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: var(--text-muted); cursor: pointer; min-height: 160px; transition: all 0.2s; }
        .budget-card.add-budget:hover { border-color: var(--accent-primary); color: var(--accent-primary); }
        .bc-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .bc-actions { display: flex; gap: 4px; }
        .bc-name { font-weight: 600; }
        .bc-amounts { margin-bottom: 10px; }
        .bc-spent { font-size: 1.5rem; font-weight: 700; font-family: var(--font-display); }
        .bc-total { font-size: 0.875rem; color: var(--text-tertiary); margin-left: 4px; }
        .bc-remaining { font-size: 0.8125rem; font-weight: 500; margin-top: 8px; display: block; }

        @media (max-width: 768px) {
          .fin-grid { grid-template-columns: 1fr; }
          .page-header { flex-direction: column; }
          .bill-item .badge, .expense-item .badge { display: none; }
        }
      `}</style>
    </div>
  );
}
