'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, ShoppingCart, Calendar, Wallet, UtensilsCrossed,
  MessageCircle, ListChecks, LogOut
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, color: '#DC3545' },
  { href: '/grocery', label: 'Grocery', icon: ShoppingCart, color: '#DC3545' },
  { href: '/calendar', label: 'Calendar', icon: Calendar, color: '#63B3ED' },
  { href: '/finances', label: 'Finances', icon: Wallet, color: '#ECC94B' },
  { href: '/meals', label: 'Meals', icon: UtensilsCrossed, color: '#ED8936' },
  { href: '/chat', label: 'Chat', icon: MessageCircle, color: '#63B3ED' },
  { href: '/chores', label: 'Chores', icon: ListChecks, color: '#48BB78' },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { logout } = useApp();

  return (
    <nav className="mobile-nav">
      <div className="mobile-nav-scroll">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              style={{ '--active-color': item.color }}
            >
              <div className="mobile-icon-wrapper">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="mobile-label">{item.label}</span>
              {isActive && <div className="mobile-active-dot" />}
            </Link>
          );
        })}
        {/* Sign Out as the last item on mobile */}
        <button 
          className="mobile-nav-item logout-btn" 
          onClick={logout}
          style={{ '--active-color': '#FC8181' }}
        >
          <div className="mobile-icon-wrapper">
            <LogOut size={22} strokeWidth={2} />
          </div>
          <span className="mobile-label">Sign Out</span>
        </button>
      </div>

      <style jsx>{`
        .mobile-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 84px;
          background: rgba(15, 17, 25, 0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid var(--border-subtle);
          z-index: 450;
          box-shadow: 0 -4px 30px rgba(0,0,0,0.5);
        }

        .mobile-nav-scroll {
          display: flex;
          align-items: center;
          gap: 4px;
          overflow-x: auto;
          overflow-y: hidden;
          padding: 8px 16px 24px;
          width: 100%;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none;  /* IE and Edge */
          -webkit-overflow-scrolling: touch;
        }

        .mobile-nav-scroll::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
        }

        .mobile-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          color: var(--text-tertiary);
          text-decoration: none;
          min-width: 72px; /* Fixed width for better swipe targets */
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          background: none;
          border: none;
          padding: 0;
        }

        .mobile-icon-wrapper {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .mobile-nav-item.active {
          color: var(--text-primary);
        }

        .mobile-nav-item.active .mobile-icon-wrapper {
          color: var(--active-color);
          transform: translateY(-2px);
          background: rgba(255,255,255,0.03);
          box-shadow: 0 0 15px rgba(0,0,0,0.2);
        }

        .mobile-label {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          white-space: nowrap;
        }

        .mobile-active-dot {
          position: absolute;
          bottom: -4px;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--active-color);
          box-shadow: 0 0 10px var(--active-color);
        }

        .logout-btn {
          color: var(--text-muted);
        }

        @media (max-width: 768px) {
          .mobile-nav {
            display: flex;
          }
        }
      `}</style>
    </nav>
  );
}
