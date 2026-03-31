'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Plus, Trash2, ShoppingCart, Check, X, Search, Filter } from 'lucide-react';

const CATEGORIES = ['All', 'Produce', 'Dairy', 'Meat', 'Bakery', 'Pantry', 'Frozen', 'Beverages', 'Snacks', 'Supplies', 'Other'];

export default function GroceryPage() {
  const { groceryLists, members, addItem, updateItem, removeItem, isLoading } = useApp();
  const [activeList, setActiveList] = useState('main'); // Support single list for now
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', category: 'Other', notes: '' });
  const [filterCat, setFilterCat] = useState('All');
  const [search, setSearch] = useState('');

  const currentList = groceryLists?.[0]; // Using the first list mapped from grocery_items
  const filteredItems = (currentList?.items || []).filter(item => {
    const matchCat = filterCat === 'All' || item?.category === filterCat;
    const matchSearch = item?.name?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const checkedCount = (currentList?.items || []).filter(i => i.checked).length;
  const totalCount = currentList?.items?.length || 0;

  const toggleItem = async (itemId, currentStatus) => {
    await updateItem('groceryLists', itemId, { checked: !currentStatus });
  };

  const handleAddItem = async () => {
    if (!newItem.name.trim()) return;
    await addItem('groceryLists', { ...newItem, checked: false });
    setNewItem({ name: '', quantity: '', category: 'Other', notes: '' });
    setShowAdd(false);
  };

  const handleRemoveItem = async (itemId) => {
    await removeItem('groceryLists', itemId);
  };

  const getMemberName = (id) => {
    const member = members.find(m => m.id === id);
    return member?.full_name || 'Partner';
  };

  return (
    <div className="grocery-page">
      <div className="page-header">
        <div>
          <h1><ShoppingCart size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 12 }} />Grocery Lists</h1>
          <p>Keep track of everything you need — synced in real time.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={18} /> Add Item
        </button>
      </div>

      {/* List Tabs */}
      <div className="list-tabs-row">
        <div className="list-tabs">
          {groceryLists.map(list => (
            <button key={list.id} className={`list-tab ${activeList === list.id || activeList === 'main' ? 'active' : ''}`} onClick={() => setActiveList(list.id)}>
              {list.name}
              <span className="tab-count">{list.items.filter(i => !i.checked).length}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Progress */}
      {currentList && (
        <div className="progress-section">
          <div className="progress-info">
            <span>{checkedCount} of {totalCount} items checked</span>
            <span>{totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0}%</span>
          </div>
          <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${totalCount > 0 ? (checkedCount / totalCount) * 100 : 0}%` }} /></div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="filter-row">
        <div className="search-box">
          <Search size={16} />
          <input placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="cat-filters">
          {CATEGORIES.slice(0, 6).map(cat => (
            <button key={cat} className={`cat-chip ${filterCat === cat ? 'active' : ''}`} onClick={() => setFilterCat(cat)}>{cat}</button>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="items-list">
        {isLoading ? (
          <div className="loading-state">Syncing with household...</div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart size={48} />
            <h3>No items yet</h3>
            <p>Add items to your grocery list to get started.</p>
          </div>
        ) : (
          filteredItems.map((item, idx) => (
            <div key={item.id} className={`grocery-item ${item.checked ? 'checked' : ''}`} style={{ animationDelay: `${idx * 30}ms` }}>
              <button className="check-btn" onClick={() => toggleItem(item.id, item.checked)}>
                {item.checked ? <Check size={14} /> : null}
              </button>
              <div className="item-info">
                <span className="item-name">{item.name}</span>
                <span className="item-meta">{item.quantity}{item.notes ? ` · ${item.notes}` : ''}</span>
              </div>
              <span className="badge badge-gray">{item.category}</span>
              <span className="item-added">by {getMemberName(item.added_by)}</span>
              <button className="btn btn-ghost btn-icon sm" onClick={() => handleRemoveItem(item.id)} title="Remove"><Trash2 size={14} /></button>
            </div>
          ))
        )}
      </div>

      {/* Add Item Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Add Grocery Item</h2><button className="btn btn-ghost btn-icon" onClick={() => setShowAdd(false)}><X size={18} /></button></div>
            <div className="modal-body">
              <div className="input-group"><label className="input-label">Item Name</label><input className="input" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} placeholder="e.g. Avocados" /></div>
              <div className="input-group"><label className="input-label">Quantity</label><input className="input" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: e.target.value })} placeholder="e.g. 3 pieces" /></div>
              <div className="input-group"><label className="input-label">Category</label><select className="select" value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })}>{CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div className="input-group"><label className="input-label">Notes (optional)</label><input className="input" value={newItem.notes} onChange={e => setNewItem({ ...newItem, notes: e.target.value })} placeholder="Any extra notes" /></div>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAddItem}>Add Item</button></div>
          </div>
        </div>
      )}

      <style jsx>{`
        .grocery-page { max-width: 1000px; animation: fadeIn 0.4s ease; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
        .page-header h1 { font-size: 1.75rem; margin-bottom: 4px; }
        .page-header p { color: var(--text-tertiary); }

        .list-tabs-row { margin-bottom: 24px; overflow-x: auto; }
        .list-tabs { display: flex; gap: 8px; padding-bottom: 4px; }
        .list-tab { display: flex; align-items: center; gap: 8px; padding: 10px 18px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 12px; color: var(--text-secondary); font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .list-tab:hover { border-color: var(--border-default); color: var(--text-primary); }
        .list-tab.active { background: rgba(220,53,69,0.1); border-color: var(--border-accent); color: var(--text-primary); }
        .tab-count { background: var(--bg-quaternary); padding: 1px 8px; border-radius: 20px; font-size: 0.75rem; }
        .list-tab.active .tab-count { background: rgba(220,53,69,0.2); color: var(--accent-secondary); }
        .add-tab { border-style: dashed; color: var(--text-muted); }
        .add-tab:hover { color: var(--accent-primary); border-color: var(--accent-primary); }

        .progress-section { margin-bottom: 20px; }
        .progress-info { display: flex; justify-content: space-between; font-size: 0.8125rem; color: var(--text-tertiary); margin-bottom: 8px; }

        .filter-row { display: flex; gap: 16px; align-items: center; margin-bottom: 20px; flex-wrap: wrap; }
        .search-box { display: flex; align-items: center; gap: 8px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 8px 14px; flex: 1; min-width: 200px; }
        .search-box input { background: none; border: none; outline: none; color: var(--text-primary); font-size: 0.875rem; width: 100%; }
        .search-box input::placeholder { color: var(--text-muted); }
        .search-box svg { color: var(--text-muted); }
        .cat-filters { display: flex; gap: 6px; flex-wrap: wrap; }
        .cat-chip { padding: 6px 14px; border-radius: 20px; font-size: 0.75rem; font-weight: 500; background: var(--bg-secondary); border: 1px solid var(--border-subtle); color: var(--text-secondary); cursor: pointer; transition: all 0.2s; }
        .cat-chip:hover { border-color: var(--border-default); }
        .cat-chip.active { background: rgba(220,53,69,0.1); border-color: var(--accent-primary); color: var(--accent-secondary); }

        .items-list { display: flex; flex-direction: column; gap: 8px; }
        .grocery-item { display: flex; align-items: center; gap: 14px; padding: 14px 18px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 12px; transition: all 0.2s; animation: fadeInUp 0.3s ease both; }
        .grocery-item:hover { border-color: var(--border-default); }
        .grocery-item.checked { opacity: 0.5; }
        .grocery-item.checked .item-name { text-decoration: line-through; color: var(--text-muted); }
        .check-btn { width: 24px; height: 24px; border-radius: 6px; border: 2px solid var(--border-strong); background: none; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; flex-shrink: 0; }
        .grocery-item.checked .check-btn { background: var(--accent-primary); border-color: var(--accent-primary); }
        .check-btn:hover { border-color: var(--accent-primary); }
        .item-info { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .item-name { font-size: 0.9375rem; font-weight: 500; }
        .item-meta { font-size: 0.75rem; color: var(--text-tertiary); }
        .item-added { font-size: 0.6875rem; color: var(--text-muted); white-space: nowrap; }

        @media (max-width: 600px) {
          .page-header { flex-direction: column; gap: 16px; }
          .filter-row { flex-direction: column; }
          .item-added, .badge { display: none; }
        }
      `}</style>
    </div>
  );
}
