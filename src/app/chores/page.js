'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ListChecks, Plus, X, Trophy, RotateCcw, CheckCircle2, Clock, Star, Users, Zap } from 'lucide-react';

const RECURRENCES = ['daily', 'twice-weekly', 'weekly', 'biweekly', 'monthly'];

export default function ChoresPage() {
  const { chores, members, currentUser, addItem, removeItem, updateItem, isLoading } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newChore, setNewChore] = useState({ 
    title: '', 
    assigned_to: currentUser?.id || '', 
    due_date: '', 
    recurrence: 'weekly', 
    points: 5 
  });

  if (isLoading) return <div className="loading-state">Syncing chores...</div>;

  const pendingChores = chores.filter(c => c.status === 'pending');
  const completedChores = chores.filter(c => c.status === 'completed');
  const filteredChores = filter === 'all' ? chores : filter === 'pending' ? pendingChores : completedChores;

  const getMemberName = (id) => members.find(m => m.id === id)?.full_name || 'Someone';
  const getMemberInitial = (id) => getMemberName(id)[0];

  const handleToggleStatus = (id) => {
    const chore = chores.find(c => c.id === id);
    updateItem('chores', id, { status: chore.status === 'completed' ? 'pending' : 'completed' });
  };

  const handleAddChore = () => {
    if (!newChore.title.trim()) return;
    addItem('chores', { ...newChore, status: 'pending', points: parseInt(newChore.points) || 5 });
    setNewChore({ title: '', assigned_to: currentUser?.id || '', due_date: '', recurrence: 'weekly', points: 5 });
    setShowAdd(false);
  };

  const handleRotateChores = () => {
    if (members.length < 2) return;
    // Simple rotation logic for demonstration
    chores.forEach((chore, idx) => {
      const currentAssigneeIdx = members.findIndex(m => m.id === chore.assigned_to);
      const nextAssigneeIdx = (currentAssigneeIdx + 1) % members.length;
      const nextId = members[nextAssigneeIdx].id;
      updateItem('chores', chore.id, { assigned_to: nextId });
    });
  };

  return (
    <div className="chores-page">
      <div className="page-header">
        <div>
          <h1><ListChecks size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 12 }} />Chores</h1>
          <p>Track household tasks with automatic rotation and points.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={handleRotateChores} disabled={members.length < 2}>
            <RotateCcw size={16} /> Rotate
          </button>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={16} /> Add Chore</button>
        </div>
      </div>

      {/* Scoreboard */}
      <div className="scoreboard">
        {members.map((member, idx) => {
          const mPoints = chores.filter(c => c.status === 'completed' && c.assigned_to === member.id).reduce((s, c) => s + c.points, 0);
          const mTotal = chores.filter(c => c.assigned_to === member.id).length;
          const colors = ['#DC3545', '#63B3ED', '#48BB78', '#ECC94B'];
          const color = colors[idx % colors.length];

          return (
            <div key={member.id} className="score-card-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
              {idx > 0 && (
                <div className="score-vs">
                  <Zap size={20} style={{ color: 'var(--accent-gold)' }} />
                  <span>VS</span>
                </div>
              )}
              <div className="score-card" style={{ flex: 1 }}>
                <div className="sc-avatar" style={{ background: `${color}15`, color }}>{member.full_name[0]}</div>
                <div className="sc-info">
                  <span className="sc-name">{member.full_name}</span>
                  <span className="sc-tasks">{mTotal} assigned</span>
                </div>
                <div className="sc-points">
                  <Trophy size={16} style={{ color: 'var(--accent-gold)' }} />
                  <span>{mPoints} pts</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="qs-item">
          <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
          <span>{completedChores.length} completed</span>
        </div>
        <div className="qs-item">
          <Clock size={18} style={{ color: 'var(--warning)' }} />
          <span>{pendingChores.length} pending</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        {['all', 'pending', 'completed'].map(f => (
          <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)} ({f === 'all' ? chores.length : f === 'pending' ? pendingChores.length : completedChores.length})
          </button>
        ))}
      </div>

      {/* Chores List */}
      <div className="chores-list">
        {filteredChores.length === 0 ? (
          <div className="empty-state"><ListChecks size={48} /><h3>No chores here</h3><p>Add tasks to keep your home running smoothly.</p></div>
        ) : (
          filteredChores.map((chore, idx) => (
            <div key={chore.id} className={`chore-item ${chore.status}`} style={{ animationDelay: `${idx * 40}ms` }}>
              <button className="chore-check" onClick={() => handleToggleStatus(chore.id)}>
                {chore.status === 'completed' ? <CheckCircle2 size={22} /> : <div className="chore-unchecked" />}
              </button>
              <div className="ci-info">
                <span className="ci-title">{chore.title}</span>
                <div className="ci-meta">
                  <span><Clock size={13} /> {chore.due_date ? new Date(chore.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date'}</span>
                  <span><RotateCcw size={13} /> {chore.recurrence}</span>
                </div>
              </div>
              <div className="ci-assignee">
                <div className="ci-avatar" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                  {getMemberInitial(chore.assigned_to)}
                </div>
                <span>{getMemberName(chore.assigned_to)}</span>
              </div>
              <div className="ci-points">
                <Star size={14} style={{ color: 'var(--accent-gold)' }} />
                <span>{chore.points}</span>
              </div>
              <button className="btn btn-ghost btn-icon sm" onClick={() => removeItem('chores', chore.id)}><X size={14} /></button>
            </div>
          ))
        )}
      </div>

      {/* Add Chore Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Add Chore</h2><button className="btn btn-ghost btn-icon" onClick={() => setShowAdd(false)}><X size={18} /></button></div>
            <div className="modal-body">
              <div className="input-group"><label className="input-label">Task</label><input className="input" value={newChore.title} onChange={e => setNewChore({ ...newChore, title: e.target.value })} placeholder="e.g. Vacuum Living Room" /></div>
              <div className="input-group">
                <label className="input-label">Assign To</label>
                <select className="select" value={newChore.assigned_to} onChange={e => setNewChore({ ...newChore, assigned_to: e.target.value })}>
                  {members.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                </select>
              </div>
              <div className="input-group"><label className="input-label">Due Date</label><input className="input" type="date" value={newChore.due_date || ''} onChange={e => setNewChore({ ...newChore, due_date: e.target.value })} /></div>
              <div className="input-group"><label className="input-label">Recurrence</label><select className="select" value={newChore.recurrence} onChange={e => setNewChore({ ...newChore, recurrence: e.target.value })}>{RECURRENCES.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
              <div className="input-group"><label className="input-label">Points</label><input className="input" type="number" value={newChore.points} onChange={e => setNewChore({ ...newChore, points: e.target.value })} min="1" max="50" /></div>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAddChore}>Add Chore</button></div>
          </div>
        </div>
      )}

      <style jsx>{`
        .chores-page { max-width: 900px; animation: fadeIn 0.4s ease; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
        .page-header h1 { font-size: 1.75rem; margin-bottom: 4px; }
        .page-header p { color: var(--text-tertiary); }

        .scoreboard { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
        .score-card { flex: 1; display: flex; align-items: center; gap: 14px; padding: 20px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 16px; }
        .sc-avatar { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.125rem; flex-shrink: 0; }
        .sc-info { flex: 1; display: flex; flex-direction: column; }
        .sc-name { font-weight: 600; font-size: 1rem; }
        .sc-tasks { font-size: 0.75rem; color: var(--text-tertiary); }
        .sc-points { display: flex; align-items: center; gap: 6px; font-size: 1.25rem; font-weight: 700; color: var(--accent-gold); font-family: var(--font-display); }
        .score-vs { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); }

        .quick-stats { display: flex; gap: 24px; margin-bottom: 24px; }
        .qs-item { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; color: var(--text-secondary); }

        .chores-list { display: flex; flex-direction: column; gap: 8px; }
        .chore-item { display: flex; align-items: center; gap: 14px; padding: 16px 20px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 12px; transition: all 0.2s; animation: fadeInUp 0.3s ease both; }
        .chore-item:hover { border-color: var(--border-default); }
        .chore-item.completed { opacity: 0.5; }
        .chore-item.completed .ci-title { text-decoration: line-through; color: var(--text-muted); }
        .chore-check { background: none; border: none; cursor: pointer; color: var(--success); display: flex; flex-shrink: 0; }
        .chore-unchecked { width: 22px; height: 22px; border: 2px solid var(--border-strong); border-radius: 50%; transition: border-color 0.15s; }
        .chore-unchecked:hover { border-color: var(--success); }
        .ci-info { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .ci-title { font-weight: 500; font-size: 0.9375rem; }
        .ci-meta { display: flex; gap: 16px; font-size: 0.75rem; color: var(--text-tertiary); margin-top: 4px; }
        .ci-meta span { display: flex; align-items: center; gap: 4px; }
        .ci-assignee { display: flex; align-items: center; gap: 8px; font-size: 0.8125rem; color: var(--text-secondary); }
        .ci-avatar { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.75rem; flex-shrink: 0; }
        .ci-points { display: flex; align-items: center; gap: 4px; font-size: 0.875rem; font-weight: 600; color: var(--accent-gold); }

        @media (max-width: 768px) {
          .scoreboard { flex-direction: column; }
          .score-vs { flex-direction: row; }
          .page-header { flex-direction: column; }
          .ci-assignee span { display: none; }
          .quick-stats { flex-wrap: wrap; gap: 12px; }
        }
      `}</style>
    </div>
  );
}
