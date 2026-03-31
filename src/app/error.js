'use client';
import { useEffect } from 'react';
import { RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('App Runtime Error:', error);
  }, [error]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '80vh', padding: '24px', textAlign: 'center'
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%', background: 'rgba(220, 53, 69, 0.1)',
        color: '#DC3545', display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 24
      }}>
        <RefreshCcw size={32} />
      </div>
      
      <h1 style={{ fontSize: '1.5rem', marginBottom: 12 }}>Something went wrong</h1>
      <p style={{ color: 'var(--text-tertiary)', maxWidth: 400, marginBottom: 32 }}>
        We encountered an error while rendering this page. This often happens after a new update is deployed.
      </p>

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => reset()}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <RefreshCcw size={18} /> Try Again
        </button>
        
        <Link href="/" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Home size={18} /> Back to Dashboard
        </Link>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <pre style={{
          marginTop: 40, padding: 16, background: 'var(--bg-secondary)',
          borderRadius: 8, fontSize: '0.75rem', textAlign: 'left',
          maxWidth: '100%', overflow: 'auto', color: '#DC3545'
        }}>
          {error.message}
          {error.digest && `\nDigest: ${error.digest}`}
        </pre>
      )}
    </div>
  );
}
