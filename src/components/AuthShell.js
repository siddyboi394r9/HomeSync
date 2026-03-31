'use client';
import { useApp } from '@/context/AppContext';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthShell({ children }) {
  const { isAuthenticated, isLoading, household } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // If we're currently in an OAuth flow (as indicated by hash fragment or code in URL),
    // don't redirect yet to prevent jumping to /login during code exchange.
    const isAuthHandled = typeof window !== 'undefined' && 
      (window.location.hash.includes('access_token') || 
       window.location.search.includes('code='));

    if (!isLoading && !isAuthenticated && pathname !== '/login' && !isAuthHandled) {
      router.push('/login');
    }
    
    // If authenticated but no household, redirect to login page for setup
    if (!isLoading && isAuthenticated && !household && pathname !== '/login') {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, household, pathname, router]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--bg-root)'
      }}>
        <div style={{
          width: 48, height: 48, border: '3px solid var(--bg-quaternary)',
          borderTopColor: 'var(--accent-primary)', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
      </div>
    );
  }

  if (pathname === '/login') return children;

  // Protect all other routes
  if (!isAuthenticated) return null;
  if (!household) return null; // Wait for setup redirect

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
      <MobileNav />
      <style jsx global>{`
        .app-shell {
          display: flex;
          min-height: 100vh;
        }
        .main-content {
          flex: 1;
          margin-left: var(--sidebar-current-width, var(--sidebar-width));
          padding: 32px;
          transition: margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          max-width: 100%;
          overflow-x: hidden;
          min-width: 0;
        }
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
            padding: 32px 16px 124px !important;
          }
          .sidebar {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
