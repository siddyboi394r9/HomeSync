'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Calendar as CalIcon, Plus, ChevronLeft, ChevronRight, X, MapPin, Clock, Tag, Search, List } from 'lucide-react';
import './calendar.css';

const CATEGORIES = ['Social', 'Medical', 'Work', 'Travel', 'Household', 'Personal'];
const COLORS = { Social: '#DC3545', Medical: '#63B3ED', Work: '#ECC94B', Travel: '#48BB78', Household: '#ED8936', Personal: '#ED64A6' };
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Generate 15-minute increments for the time picker
const TIME_OPTIONS = Array.from({ length: 96 }, (_, i) => {
  const h = Math.floor(i / 4);
  const m = (i % 4) * 15;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${String(m).padStart(2, '0')} ${ampm}`;
});

function TimePicker({ value, onChange, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const dropdownRef = useRef(null);

  // Sync internal input when value changes from outside
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Fuzzy search / Typing shortcut logic
  const handleInputChange = (val) => {
    setInputValue(val);
    const clean = val.toLowerCase().replace(/\s/g, '');
    
    // Quick shortcuts
    if (clean === 'now') {
      const now = new Date();
      const h = now.getHours();
      let m = Math.round(now.getMinutes() / 15) * 15;
      const ampm = h >= 12 ? 'PM' : 'AM';
      let displayH = h % 12 === 0 ? 12 : h % 12;
      if (m === 60) { displayH++; m = 0; }
      onChange(`${displayH}:${String(m).padStart(2, '0')} ${ampm}`);
      return;
    }

    // Try to match from options
    const match = TIME_OPTIONS.find(opt => {
      const optClean = opt.toLowerCase().replace(/\s/g, '').replace(':', '');
      const valClean = clean.replace(':', '');
      return optClean.startsWith(valClean);
    });

    if (match && clean.length >= 2) {
      onChange(match);
    }
  };

  useEffect(() => {
    const clickOut = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', clickOut);
    return () => document.removeEventListener('mousedown', clickOut);
  }, []);

  return (
    <div className="time-picker-wrapper" ref={dropdownRef}>
      <label className="input-label">{label}</label>
      <div className="time-input-group">
        <Clock size={16} className="input-icon" />
        <input 
          className="input" 
          value={inputValue} 
          onFocus={() => setIsOpen(true)}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={() => setInputValue(value)} // Revert to confirmed value if no match was picked
          placeholder="e.g. 9:00 AM"
        />
      </div>
      {isOpen && (
        <div className="time-dropdown custom-scrollbar">
          {TIME_OPTIONS.map(time => (
            <div 
              key={time} 
              className={`time-option ${value === time ? 'active' : ''}`}
              onClick={() => {
                onChange(time);
                setIsOpen(false);
              }}
            >
              {time}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CalendarPage() {
  const { events, addItem, removeItem, updateItem, addNotification, isLoading } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [view, setView] = useState('month');
  
  const [newEvent, setNewEvent] = useState({ 
    title: '', 
    date: new Date().toISOString().split('T')[0], 
    startTime: '9:00 AM', 
    endTime: '10:00 AM', 
    category: 'Social', 
    location: '', 
    description: '' 
  });

  const openEdit = (e) => {
    const d = new Date(e.start_time);
    const endD = new Date(e.end_time);
    
    const formatTime = (date) => {
      try {
        if (!date || isNaN(date.getTime())) return '12:00 PM';
        const h = date.getHours();
        const m = date.getMinutes();
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 === 0 ? 12 : h % 12;
        return `${displayH}:${String(m).padStart(2, '0')} ${ampm}`;
      } catch (err) {
        console.error('formatTime error:', err);
        return '12:00 PM';
      }
    };

    setNewEvent({
      title: e.title || '',
      date: (e.start_time || '').split('T')[0] || new Date().toISOString().split('T')[0],
      startTime: formatTime(d),
      endTime: formatTime(endD),
      category: e.category || 'Social',
      location: e.location || '',
      description: e.description || ''
    });
    setEditingEvent(e);
    setShowAdd(true);
  };

  const openAdd = () => {
    setNewEvent({ 
      title: '', 
      date: new Date().toISOString().split('T')[0], 
      startTime: '9:00 AM', 
      endTime: '10:00 AM', 
      category: 'Social', 
      location: '', 
      description: '' 
    });
    setEditingEvent(null);
    setShowAdd(true);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prev = () => setCurrentDate(new Date(year, month - 1, 1));
  const next = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDate = (day) => {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return (events || []).filter(e => {
      const eDate = e.start_time?.split('T')[0];
      return eDate === dStr;
    }).sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  };

  const calendarDays = useMemo(() => {
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [firstDay, daysInMonth]);

  const today = new Date();
  const isToday = (day) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (!newEvent.title.trim() || !newEvent.date || isSaving) return;
    setIsSaving(true);
    
    const combine = (d, t) => {
      try {
        const parts = (t || '12:00 PM').trim().split(' ');
        const time = parts[0];
        const ampm = parts[1] || 'AM';
        let [h, m] = time.split(':');
        h = parseInt(h) || 0;
        m = parseInt(m) || 0;
        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        return `${d}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
      } catch (err) {
        console.error('Combine error:', err);
        return `${d}T12:00:00`;
      }
    };

    try {
      const payload = { 
        title: newEvent.title, 
        start_time: combine(newEvent.date, newEvent.startTime), 
        end_time: combine(newEvent.date, newEvent.endTime), 
        category: newEvent.category, 
        location: newEvent.location, 
        description: newEvent.description,
        color: COLORS[newEvent.category] || '#DC3545'
      };

      let success = false;
      if (editingEvent) {
        success = await updateItem('events', editingEvent.id, payload);
      } else {
        success = await addItem('events', payload);
      }
      
      if (success) {
        setShowAdd(false);
        setEditingEvent(null);
      }
    } catch (err) {
      console.error('Submit crash:', err);
      if (typeof addNotification === 'function') {
        addNotification('error', 'A critical error occurred while saving.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingEvent || isSaving) return;
    setIsSaving(true);
    const success = await removeItem('events', editingEvent.id);
    setIsSaving(false);
    if (success) {
      setShowAdd(false);
      setEditingEvent(null);
    }
  };

  // Chronological Grouping for List View
  const groupedEvents = useMemo(() => {
    const upcoming = (events || [])
      .filter(e => new Date(e.start_time) >= new Date().setHours(0,0,0,0))
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

    const groups = [];
    let currentLabel = '';

    upcoming.forEach(e => {
      const d = new Date(e.start_time);
      const today = new Date();
      let label = '';
      
      if (d.toDateString() === today.toDateString()) label = 'Today';
      else if (d.toDateString() === new Date(today.setDate(today.getDate() + 1)).toDateString()) label = 'Tomorrow';
      else label = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', weekday: 'long' });

      if (label !== currentLabel) {
        groups.push({ label, items: [e] });
        currentLabel = label;
      } else {
        groups[groups.length - 1].items.push(e);
      }
    });
    return groups;
  }, [events]);

  if (isLoading) return <div className="loading-state">Syncing calendar...</div>;

  return (
    <div className="calendar-page">
      <div className="page-header">
        <div>
          <h1><CalIcon size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 12 }} />Calendar</h1>
          <p>Your household schedule, perfectly in sync.</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={18} /> New Event</button>
      </div>

      <div className="cal-nav">
        <div className="nav-controls">
          <button className="btn-icon-round" onClick={prev}><ChevronLeft size={20} /></button>
          <h2>{MONTHS[month]} {year}</h2>
          <button className="btn-icon-round" onClick={next}><ChevronRight size={20} /></button>
          <button className="btn-today" onClick={() => setCurrentDate(new Date())}>Today</button>
        </div>
        <div className="view-switcher">
          <button className={view === 'month' ? 'active' : ''} onClick={() => setView('month')}>Month</button>
          <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>Agenda</button>
        </div>
      </div>

      {view === 'month' ? (
        <div className="month-view">
          <div className="days-header">
            {DAYS.map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="days-grid">
            {calendarDays.map((day, idx) => {
              const dayEvents = day ? getEventsForDate(day) : [];
              return (
                <div 
                  key={idx} 
                  className={`day-cell ${day ? 'active' : ''} ${isToday(day) ? 'is-today' : ''} ${selectedDate === day ? 'is-selected' : ''}`}
                  onClick={() => day && setSelectedDate(day)}
                >
                  {day && (
                    <>
                      <span className="day-number">{day}</span>
                      <div className="day-events">
                        {dayEvents.map((e, i) => {
                          if (i >= 3) return null;
                          return (
                            <div 
                              key={e.id} 
                              className="event-bar animate-in" 
                              style={{ 
                                '--bar-color': e.color,
                                animationDelay: `${i * 0.05}s`
                              }}
                              onClick={(ev) => {
                                ev.stopPropagation();
                                openEdit(e);
                              }}
                            >
                              <span className="bar-dot"></span>
                              <span className="bar-title">{e.title}</span>
                            </div>
                          );
                        })}
                        {dayEvents.length > 3 && (
                          <div className="more-count" onClick={(ev) => {
                            ev.stopPropagation();
                            setSelectedDate(day);
                            setView('list');
                          }}>
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="agenda-view">
          {groupedEvents.length === 0 ? (
            <div className="empty-state">
              <CalIcon size={48} />
              <p>No upcoming events scheduled.</p>
            </div>
          ) : (
            groupedEvents.map(group => (
              <div key={group.label} className="agenda-group">
                <div className="group-label">{group.label}</div>
                <div className="group-items">
                  {group.items.map(e => (
                    <div key={e.id} className="agenda-item">
                      <div className="item-time">
                        {new Date(e.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </div>
                        <div className="item-card" onClick={() => openEdit(e)} style={{ cursor: 'pointer', '--card-color': e.color }}>
                        <div className="item-main">
                          <span className="item-title">{e.title}</span>
                          {e.location && <span className="item-loc"><MapPin size={12} /> {e.location}</span>}
                        </div>
                        <div className="item-actions">
                          <button className="del-btn" onClick={() => removeItem('events', e.id)}><X size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showAdd && (
        <div className="modal-overlay" onClick={() => { setShowAdd(false); setEditingEvent(null); }}>
          <div className="modal-content animate-pop" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEvent ? 'Edit Event' : 'Create Event'}</h2>
              <button className="close-btn" onClick={() => { setShowAdd(false); setEditingEvent(null); }}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label className="input-label">Event Name</label>
                <input 
                  autoFocus
                  className="input main-title" 
                  value={newEvent.title} 
                  onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} 
                  placeholder="What's happening?" 
                />
              </div>
              
              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Date</label>
                  <input 
                    type="date" 
                    className="input" 
                    value={newEvent.date} 
                    onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} 
                  />
                </div>
                <TimePicker label="Start" value={newEvent.startTime} onChange={v => setNewEvent({...newEvent, startTime: v})} />
                <TimePicker label="End" value={newEvent.endTime} onChange={v => setNewEvent({...newEvent, endTime: v})} />
              </div>

              <div className="input-group">
                <label className="input-label">Category</label>
                <div className="cat-chips">
                  {CATEGORIES.map(c => (
                    <button 
                      key={c} 
                      className={`cat-chip ${newEvent.category === c ? 'active' : ''}`}
                      onClick={() => setNewEvent({ ...newEvent, category: c })}
                      style={{ '--chip-color': COLORS[c] }}
                    >
                      <div className="chip-dot" />
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Location</label>
                <div className="input-with-icon">
                  <MapPin size={16} />
                  <input className="input" value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="Add location" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <div className="footer-left">
                {editingEvent && <button className="btn btn-danger-subtle" onClick={handleDelete}>Delete Event</button>}
              </div>
              <div className="footer-right">
                <button className="btn btn-secondary" onClick={() => { setShowAdd(false); setEditingEvent(null); }}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSubmit}>{editingEvent ? 'Save Changes' : 'Create Event'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
