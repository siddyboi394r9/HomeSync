'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Calendar as CalIcon, Plus, ChevronLeft, ChevronRight, X, MapPin, Clock, Tag } from 'lucide-react';

const CATEGORIES = ['Social', 'Medical', 'Work', 'Travel', 'Household', 'Personal'];
const COLORS = { Social: '#DC3545', Medical: '#63B3ED', Work: '#ECC94B', Travel: '#48BB78', Household: '#ED8936', Personal: '#ED64A6' };
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarPage() {
  const { events, addItem, removeItem, isLoading } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '', category: 'Social', location: '', description: '' });
  const [view, setView] = useState('month');

  if (isLoading) return <div className="loading-state">Syncing calendar...</div>;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prev = () => setCurrentDate(new Date(year, month - 1, 1));
  const next = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDate = (day) => {
    const d = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return (events || []).filter(e => e.start?.startsWith(d));
  };

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const today = new Date();
  const isToday = (day) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const dayEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const handleAddEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.start) return;
    const color = COLORS[newEvent.category] || '#DC3545';
    await addItem('events', { ...newEvent, color });
    setNewEvent({ title: '', start: '', end: '', category: 'Social', location: '', description: '' });
    setShowAdd(false);
  };

  const handleRemoveEvent = async (id) => {
    await removeItem('events', id);
  };

  return (
    <div className="calendar-page">
      <div className="page-header">
        <div>
          <h1><CalIcon size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 12 }} />Calendar</h1>
          <p>Stay on top of your schedule — syncs with Google Calendar.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={18} /> New Event</button>
      </div>

      {/* Calendar Navigation */}
      <div className="cal-nav">
        <button className="btn btn-ghost btn-icon" onClick={prev}><ChevronLeft size={20} /></button>
        <h2>{MONTHS[month]} {year}</h2>
        <button className="btn btn-ghost btn-icon" onClick={next}><ChevronRight size={20} /></button>
        <div className="cal-views">
          <button className={`tab ${view === 'month' ? 'active' : ''}`} onClick={() => setView('month')}>Month</button>
          <button className={`tab ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>List</button>
        </div>
      </div>

      {view === 'month' ? (
        <div className="cal-grid-wrapper">
          {/* Day headers */}
          <div className="cal-day-headers">
            {DAYS.map(d => <div key={d} className="day-header">{d}</div>)}
          </div>
          {/* Calendar grid */}
          <div className="cal-grid">
            {calendarDays.map((day, idx) => (
              <div key={idx} className={`cal-cell ${day ? 'has-day' : ''} ${isToday(day) ? 'today' : ''} ${selectedDate === day ? 'selected' : ''}`} onClick={() => day && setSelectedDate(day)}>
                {day && (
                  <>
                    <span className="cell-day">{day}</span>
                    <div className="cell-dots">
                      {getEventsForDate(day).slice(0, 3).map(e => (
                        <div key={e.id} className="cell-dot" style={{ background: e.color }} title={e.title} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="event-list-view">
          {(events || []).sort((a, b) => new Date(a.start) - new Date(b.start)).map(event => (
            <div key={event.id} className="event-list-item">
              <div className="eli-color" style={{ background: event.color }} />
              <div className="eli-info">
                <span className="eli-title">{event.title}</span>
                <span className="eli-time">
                  {new Date(event.start).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  {' · '}{new Date(event.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </span>
                {event.location && <span className="eli-loc"><MapPin size={12} /> {event.location}</span>}
              </div>
              <span className="badge" style={{ background: `${event.color}20`, color: event.color }}>{event.category}</span>
              <button className="btn btn-ghost btn-icon sm" onClick={() => handleRemoveEvent(event.id)}><X size={14} /></button>
            </div>
          ))}
        </div>
      )}

      {/* Selected Day Detail */}
      {selectedDate && (
        <div className="day-detail">
          <h3>{MONTHS[month]} {selectedDate}, {year}</h3>
          {dayEvents.length === 0 ? (
            <p className="empty-text">No events on this day.</p>
          ) : (
            dayEvents.map(e => (
              <div key={e.id} className="detail-event">
                <div className="de-color" style={{ background: e.color }} />
                <div className="de-info">
                  <span className="de-title">{e.title}</span>
                  <span className="de-time"><Clock size={13} /> {new Date(e.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}{e.end ? ` - ${new Date(e.end).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : ''}</span>
                  {e.location && <span className="de-loc"><MapPin size={13} /> {e.location}</span>}
                </div>
                <button className="btn btn-ghost btn-icon sm" onClick={() => handleRemoveEvent(e.id)}><X size={14} /></button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Event Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>New Event</h2><button className="btn btn-ghost btn-icon" onClick={() => setShowAdd(false)}><X size={18} /></button></div>
            <div className="modal-body">
              <div className="input-group"><label className="input-label">Event Title</label><input className="input" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="e.g. Date Night" /></div>
              <div className="input-group"><label className="input-label">Start</label><input className="input" type="datetime-local" value={newEvent.start} onChange={e => setNewEvent({ ...newEvent, start: e.target.value })} /></div>
              <div className="input-group"><label className="input-label">End</label><input className="input" type="datetime-local" value={newEvent.end} onChange={e => setNewEvent({ ...newEvent, end: e.target.value })} /></div>
              <div className="input-group"><label className="input-label">Category</label><select className="select" value={newEvent.category} onChange={e => setNewEvent({ ...newEvent, category: e.target.value })}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
              <div className="input-group"><label className="input-label">Location</label><input className="input" value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="Optional" /></div>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAddEvent}>Create Event</button></div>
          </div>
        </div>
      )}

      <style jsx>{`
        .calendar-page { max-width: 1000px; animation: fadeIn 0.4s ease; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
        .page-header h1 { font-size: 1.75rem; margin-bottom: 4px; }
        .page-header p { color: var(--text-tertiary); }

        .cal-nav { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
        .cal-nav h2 { min-width: 200px; text-align: center; }
        .cal-views { margin-left: auto; display: flex; gap: 4px; background: var(--bg-primary); border-radius: 8px; border: 1px solid var(--border-subtle); padding: 3px; }

        .cal-grid-wrapper { background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 16px; overflow: hidden; margin-bottom: 24px; }
        .cal-day-headers { display: grid; grid-template-columns: repeat(7, 1fr); border-bottom: 1px solid var(--border-subtle); }
        .day-header { padding: 12px; text-align: center; font-size: 0.75rem; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; }
        .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); }
        .cal-cell { min-height: 80px; border-right: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle); padding: 8px; cursor: pointer; transition: background 0.15s; }
        .cal-cell:nth-child(7n) { border-right: none; }
        .cal-cell:hover.has-day { background: var(--bg-tertiary); }
        .cal-cell.today .cell-day { background: var(--accent-primary); color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; }
        .cal-cell.selected { background: rgba(220,53,69,0.06); }
        .cell-day { font-size: 0.8125rem; font-weight: 500; color: var(--text-secondary); }
        .cell-dots { display: flex; gap: 3px; margin-top: 6px; flex-wrap: wrap; }
        .cell-dot { width: 6px; height: 6px; border-radius: 50%; }

        .day-detail { background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 24px; margin-bottom: 24px; animation: fadeInUp 0.3s ease; }
        .day-detail h3 { margin-bottom: 16px; }
        .detail-event { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--border-subtle); }
        .detail-event:last-child { border-bottom: none; }
        .de-color { width: 4px; height: 40px; border-radius: 2px; flex-shrink: 0; }
        .de-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .de-title { font-weight: 500; font-size: 0.9375rem; }
        .de-time, .de-loc { font-size: 0.8125rem; color: var(--text-tertiary); display: flex; align-items: center; gap: 4px; }
        .empty-text { color: var(--text-muted); font-size: 0.875rem; }

        .event-list-view { display: flex; flex-direction: column; gap: 8px; }
        .event-list-item { display: flex; align-items: center; gap: 14px; padding: 16px 20px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 12px; }
        .eli-color { width: 4px; height: 36px; border-radius: 2px; flex-shrink: 0; }
        .eli-info { flex: 1; display: flex; flex-direction: column; }
        .eli-title { font-weight: 500; }
        .eli-time { font-size: 0.8125rem; color: var(--text-tertiary); }
        .eli-loc { font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }

        @media (max-width: 768px) {
          .cal-cell { min-height: 48px; padding: 4px; }
          .cell-dots { display: none; }
          .page-header { flex-direction: column; gap: 16px; }
          .cal-nav { flex-wrap: wrap; }
        }
      `}</style>
    </div>
  );
}
