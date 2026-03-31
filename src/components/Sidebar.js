'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard, ShoppingCart, Calendar, Wallet, UtensilsCrossed,
  MessageCircle, ListChecks, LogOut, ChevronLeft, ChevronRight, Home
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, color: '#DC3545' },
  { href: '/grocery', label: 'Grocery Lists', icon: ShoppingCart, color: '#DC3545' },
  { href: '/calendar', label: 'Calendar', icon: Calendar, color: '#63B3ED' },
  { href: '/finances', label: 'Finances', icon: Wallet, color: '#ECC94B' },
  { href: '/meals', label: 'Meal Planner', icon: UtensilsCrossed, color: '#ED8936' },
  { href: '/chat', label: 'Chat', icon: MessageCircle, color: '#63B3ED' },
  { href: '/chores', label: 'Chores', icon: ListChecks, color: '#48BB78' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useApp();
  
  // sidebarState: 'expanded' or 'collapsed' (Gmail style)
  const [sidebarState, setSidebarState] = useState('expanded');

  useEffect(() => {
    const savedState = localStorage.getItem('sidebarState');
    // Ensure we don't load 'hidden' if it was saved previously
    if (savedState && savedState !== 'hidden') setSidebarState(savedState);
  }, []);

  const toggleSidebar = () => {
    const nextState = sidebarState === 'expanded' ? 'collapsed' : 'expanded';
    setSidebarState(nextState);
    localStorage.setItem('sidebarState', nextState);
    updateBodyVariable(nextState);
  };

  const updateBodyVariable = (state) => {
    const widthMap = {
      'expanded': 'var(--sidebar-width)',
      'collapsed': 'var(--sidebar-collapsed)'
    };
    document.documentElement.style.setProperty('--sidebar-current-width', widthMap[state]);
  };

  useEffect(() => {
    updateBodyVariable(sidebarState);
  }, [sidebarState]);

  const isExpanded = sidebarState === 'expanded';

  return (
    <>
      <aside className={`sidebar ${sidebarState}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Home size={22} />
          </div>
          {isExpanded && <span className="logo-text">HomeSync</span>}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
                title={!isExpanded ? item.label : undefined}
                style={{ 
                  '--item-color': item.color,
                  '--item-bg': `${item.color}15`,
                  '--item-bg-hover': `${item.color}25`
                }}
              >
                <div className="icon-box">
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                {isExpanded && <span>{item.label}</span>}
                {isActive && <div className="active-glow" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="sidebar-bottom">
          {isExpanded && household && (
            <div className="household-info">
              <div className="hi-label">Household</div>
              <div className="hi-name">{household.name}</div>
              <div className="hi-code">
                <span>Code: <strong>{household.invite_code}</strong></span>
                <button className="copy-btn" onClick={() => navigator.clipboard.writeText(household.invite_code)} title="Copy Code">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              </div>
            </div>
          )}

          <button className="nav-item action-btn" onClick={toggleSidebar}>
            <div className="icon-box">
              {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </div>
            {isExpanded && <span>Collapse</span>}
          </button>
          
          <button className="nav-item logout-btn" onClick={logout}>
            <div className="icon-box">
              <LogOut size={20} />
            </div>
            {isExpanded && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <style jsx>{`
        .household-info {
          padding: 12px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          margin-bottom: 12px;
          border: 1px solid var(--border-subtle);
        }
        .hi-label {
          font-size: 0.625rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin-bottom: 4px;
        }
        .hi-name {
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .hi-code {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-secondary);
          background: var(--bg-tertiary);
          padding: 4px 8px;
          border-radius: 6px;
        }
        .hi-code strong {
          color: var(--accent-primary);
        }
        .copy-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 2px;
          display: flex;
          align-items: center;
        }
        .copy-btn:hover {
          color: var(--text-primary);
        }
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: var(--sidebar-current-width, var(--sidebar-width));
          background: linear-gradient(180deg, #12141C 0%, #0D0F16 100%);
          border-right: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          padding: 24px 14px;
          z-index: 400;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .sidebar.collapsed {
          width: var(--sidebar-collapsed);
          padding: 24px 12px;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 4px 10px;
          margin-bottom: 36px;
          height: 40px;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--accent-primary), #FF6B6B);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
          box-shadow: var(--shadow-glow);
        }

        .logo-text {
          font-family: var(--font-display);
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
          white-space: nowrap;
          letter-spacing: -0.03em;
        }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px;
          border-radius: 14px;
          color: var(--text-tertiary);
          font-size: 0.95rem;
          font-weight: 600;
          transition: all 0.2s ease;
          position: relative;
          white-space: nowrap;
          text-decoration: none;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          width: 100%;
          text-align: left;
        }

        .icon-box {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .nav-item:hover {
          color: var(--text-primary);
          background: var(--item-bg-hover, var(--bg-tertiary));
          border-color: var(--item-color, var(--border-accent));
        }

        .nav-item:hover .icon-box {
          color: var(--item-color, var(--accent-primary));
          transform: scale(1.05);
        }

        .nav-item.active {
          color: var(--text-primary);
          background: var(--item-bg, rgba(220, 53, 69, 0.1));
          border-color: var(--item-color, var(--accent-primary));
        }

        .nav-item.active .icon-box {
          color: var(--item-color, var(--accent-primary));
        }

        .active-glow {
          position: absolute;
          left: -4px;
          width: 4px;
          height: 24px;
          border-radius: 0 4px 4px 0;
          background: var(--item-color, var(--accent-primary));
          box-shadow: 0 0 10px var(--item-color, var(--accent-primary));
        }

        .sidebar-bottom {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-top: 20px;
          border-top: 1px solid var(--border-subtle);
        }

        .action-btn:hover {
          background: var(--bg-tertiary) !important;
          border-color: var(--border-strong) !important;
        }

        .logout-btn:hover {
          color: #FC8181 !important;
          background: rgba(252, 129, 129, 0.1) !important;
          border-color: rgba(252, 129, 129, 0.3) !important;
        }

        @media (max-width: 768px) {
          .sidebar {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
