'use client';
import { useApp } from '@/context/AppContext';
import {
  ShoppingCart, Calendar, Wallet, UtensilsCrossed, MessageCircle,
  ListChecks, Bell, TrendingUp, Clock, ChevronRight, AlertCircle, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function StatCard({ icon: Icon, label, value, sub, color, href, delay }) {
  return (
    <Link href={href} className="stat-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="stat-card-top">
        <div className="stat-icon" style={{ background: `${color}15`, color }}>
          <Icon size={20} />
        </div>
        <ChevronRight size={16} className="stat-arrow" />
      </div>
      <div className="stat-info">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
        {sub && <span className="stat-sub">{sub}</span>}
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { 
    currentUser, groceryLists, events, bills, chores, messages, 
    notifications, recipes, expenses, isLoading 
  } = useApp();

  if (isLoading) {
    return <div className="loading-state">Syncing household...</div>;
  }

  const pendingGroceries = groceryLists.reduce((sum, l) => sum + l.items.filter(i => !i.checked).length, 0);
  const upcomingEvents = events.filter(e => new Date(e.start) > new Date()).slice(0, 3);
  const pendingBills = bills.filter(b => b.status === 'pending');
  const totalDue = pendingBills.reduce((s, b) => s + b.amount, 0);
  const pendingChores = chores.filter(c => c.status === 'pending');
  const unreadNotifs = notifications.filter(n => !n.read);
  const recentMsgs = messages.slice(-3);
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);

  const firstName = currentUser?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="dashboard">
      <div className="dash-header">
        <div>
          <h1>{getGreeting()}, {firstName} 👋</h1>
          <p>Here&apos;s what&apos;s happening in your household today.</p>
        </div>
        <div className="notif-bell">
          <Bell size={20} />
          {unreadNotifs.length > 0 && <span className="notif-badge">{unreadNotifs.length}</span>}
        </div>
      </div>

      <div className="stats-grid">
        <StatCard icon={ShoppingCart} label="Grocery Items" value={pendingGroceries} sub="pending" color="#DC3545" href="/grocery" delay={0} />
        <StatCard icon={Calendar} label="Upcoming Events" value={upcomingEvents.length} sub="this week" color="#63B3ED" href="/calendar" delay={60} />
        <StatCard icon={Wallet} label="Bills Due" value={`$${totalDue.toLocaleString()}`} sub={`${pendingBills.length} pending`} color="#ECC94B" href="/finances" delay={120} />
        <StatCard icon={ListChecks} label="Chores" value={pendingChores.length} sub="pending" color="#48BB78" href="/chores" delay={180} />
        <StatCard icon={UtensilsCrossed} label="Recipes" value={recipes.length} sub="saved" color="#ED8936" href="/meals" delay={240} />
        <StatCard icon={TrendingUp} label="Spent This Week" value={`$${totalSpent.toFixed(0)}`} sub="tracked" color="#ED64A6" href="/finances" delay={300} />
      </div>

      <div className="dash-columns">
        {/* Upcoming Events */}
        <div className="dash-card">
          <div className="card-header">
            <h3><Calendar size={18} /> Upcoming Events</h3>
            <Link href="/calendar" className="card-link">View All <ChevronRight size={14} /></Link>
          </div>
          <div className="card-body">
            {upcomingEvents.length === 0 ? (
              <p className="empty-text">No upcoming events</p>
            ) : (
              upcomingEvents.map(event => (
                <div key={event.id} className="event-row">
                  <div className="event-dot" style={{ background: event.color }} />
                  <div className="event-info">
                    <span className="event-title">{event.title}</span>
                    <span className="event-time">
                      {new Date(event.start).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      {' · '}
                      {new Date(event.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className="badge badge-gray">{event.category}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bills Snapshot */}
        <div className="dash-card">
          <div className="card-header">
            <h3><Wallet size={18} /> Upcoming Bills</h3>
            <Link href="/finances" className="card-link">View All <ChevronRight size={14} /></Link>
          </div>
          <div className="card-body">
            {pendingBills.slice(0, 4).map(bill => (
              <div key={bill.id} className="bill-row">
                <div className="bill-info">
                  <span className="bill-name">{bill.name}</span>
                  <span className="bill-date">
                    <Clock size={13} />
                    Due {new Date(bill.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <span className="bill-amount">${bill.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="dash-card">
          <div className="card-header">
            <h3><MessageCircle size={18} /> Recent Messages</h3>
            <Link href="/chat" className="card-link">Open Chat <ChevronRight size={14} /></Link>
          </div>
          <div className="card-body">
            {recentMsgs.map(msg => (
              <div key={msg.id} className="msg-row">
                <div className="msg-avatar" style={{ background: msg.sender === 'Siddharth' ? 'rgba(220,53,69,0.15)' : 'rgba(99,179,237,0.15)', color: msg.sender === 'Siddharth' ? '#DC3545' : '#63B3ED' }}>
                  {msg.sender[0]}
                </div>
                <div className="msg-content">
                  <span className="msg-sender">{msg.sender}</span>
                  <span className="msg-text">{msg.content}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity / Notifications */}
        <div className="dash-card">
          <div className="card-header">
            <h3><Bell size={18} /> Notifications</h3>
          </div>
          <div className="card-body">
            {notifications.map(n => (
              <div key={n.id} className={`notif-row ${n.read ? 'read' : ''}`}>
                {n.read ? <CheckCircle2 size={16} className="notif-icon read" /> : <AlertCircle size={16} className="notif-icon" />}
                <span>{n.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .dashboard { max-width: 1200px; animation: fadeIn 0.4s ease; }
        .dash-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
        .dash-header h1 { font-size: 1.75rem; margin-bottom: 4px; }
        .dash-header p { color: var(--text-tertiary); font-size: 0.9375rem; }
        .notif-bell { position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 12px; color: var(--text-secondary); cursor: pointer; transition: all 0.2s ease; }
        .notif-bell:hover { background: var(--bg-tertiary); color: var(--text-primary); transform: scale(1.05); }
        .notif-badge { position: absolute; top: -4px; right: -4px; width: 18px; height: 18px; border-radius: 50%; background: var(--accent-primary); color: white; font-size: 0.625rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }

        .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; margin-bottom: 32px; }
        .stat-card { display: flex; flex-direction: column; gap: 20px; padding: 24px; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 16px; text-decoration: none; transition: all 0.25s ease; animation: fadeInUp 0.4s ease both; position: relative; overflow: hidden; }
        .stat-card:hover { border-color: var(--border-default); transform: translateY(-4px); box-shadow: var(--shadow-md), var(--shadow-glow); }
        .stat-card-top { display: flex; align-items: center; justify-content: space-between; }
        .stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .stat-info { display: flex; flex-direction: column; gap: 4px; }
        .stat-value { font-size: 2rem; font-weight: 800; color: var(--text-primary); font-family: var(--font-display); letter-spacing: -0.04em; line-height: 1; }
        .stat-label { font-size: 0.875rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px; }
        .stat-sub { font-size: 0.75rem; color: var(--text-muted); font-weight: 500; }
        .stat-arrow { color: var(--text-muted); opacity: 0; transition: all 0.25s; }
        .stat-card:hover .stat-arrow { opacity: 1; color: var(--accent-primary); transform: translateX(2px); }

        .dash-columns { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        .dash-card { background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 16px; overflow: hidden; animation: fadeInUp 0.5s ease both; }
        .card-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 16px; }
        .card-header h3 { display: flex; align-items: center; gap: 10px; font-size: 1rem; }
        .card-link { display: flex; align-items: center; gap: 4px; font-size: 0.8125rem; color: var(--accent-primary); font-weight: 500; transition: all 0.2s ease; }
        .card-link:hover { color: var(--accent-primary-hover); transform: translateX(2px); }
        .card-body { padding: 0 24px 20px; display: flex; flex-direction: column; gap: 12px; }
        .empty-text { color: var(--text-muted); font-size: 0.875rem; padding: 16px 0; text-align: center; }

        .event-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border-subtle); }
        .event-row:last-child { border-bottom: none; }
        .event-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .event-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .event-title { font-size: 0.875rem; font-weight: 500; color: var(--text-primary); }
        .event-time { font-size: 0.75rem; color: var(--text-tertiary); }

        .bill-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border-subtle); }
        .bill-row:last-child { border-bottom: none; }
        .bill-info { display: flex; flex-direction: column; gap: 2px; }
        .bill-name { font-size: 0.875rem; font-weight: 500; }
        .bill-date { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--text-tertiary); }
        .bill-amount { font-size: 1rem; font-weight: 600; color: var(--accent-secondary); }

        .msg-row { display: flex; gap: 12px; padding: 10px 0; }
        .msg-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.8125rem; flex-shrink: 0; }
        .msg-content { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .msg-sender { font-size: 0.8125rem; font-weight: 600; color: var(--text-secondary); }
        .msg-text { font-size: 0.875rem; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .notif-row { display: flex; align-items: flex-start; gap: 10px; padding: 10px 0; font-size: 0.875rem; color: var(--text-secondary); }
        .notif-row.read { opacity: 0.5; }
        .notif-icon { color: var(--accent-secondary); flex-shrink: 0; margin-top: 2px; }
        .notif-icon.read { color: var(--text-muted); }

        @media (max-width: 900px) { .dash-columns { grid-template-columns: 1fr; } }
        @media (max-width: 600px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </div>
  );
}
