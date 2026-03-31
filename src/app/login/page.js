'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { Home, Mail, Lock, ArrowRight, Heart, User, Plus, Users, LayoutDashboard } from 'lucide-react';

export default function LoginPage() {
  const { login, signup, loginWithGoogle, logout, createHousehold, joinHousehold, isAuthenticated, currentUser, household } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Read any error thrown from the callback router during OAuth redirects
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialError = searchParams?.get('error') || '';
  const [error, setError] = useState(initialError);
  
  // Household setup state
  const [setupMode, setSetupMode] = useState(null); // 'create' or 'join'
  const [householdName, setHouseholdName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUp) {
        await signup(email, password, fullName);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication');
    }
  };

  const handleCreateHousehold = async (e) => {
    e.preventDefault();
    try {
      await createHousehold(householdName);
      router.push('/');
    } catch (err) {
      setError('Failed to create household');
    }
  };

  const handleJoinHousehold = async (e) => {
    e.preventDefault();
    try {
      await joinHousehold(inviteCode);
      router.push('/');
    } catch (err) {
      setError('Invalid invite code');
    }
  };

  // If authenticated but no household, show setup screen
  if (isAuthenticated && !household) {
    return (
      <div className="login-page">
        <div className="login-bg-effects">
          <div className="bg-orb orb-1" />
          <div className="bg-orb orb-2" />
        </div>
        
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <h1>Welcome, {currentUser?.full_name || 'there'}!</h1>
              <p>Let's get your household set up to start syncing.</p>
            </div>

            {!setupMode ? (
              <div className="setup-options">
                <button className="setup-card" onClick={() => setSetupMode('create')}>
                  <div className="setup-icon"><Plus size={24} /></div>
                  <div className="setup-text">
                    <strong>Create Household</strong>
                    <span>Start a new shared space</span>
                  </div>
                  <ArrowRight size={20} className="setup-arrow" color="var(--text-muted)" />
                </button>
                <button className="setup-card" onClick={() => setSetupMode('join')}>
                  <div className="setup-icon"><Users size={24} /></div>
                  <div className="setup-text">
                    <strong>Join Household</strong>
                    <span>Use an invite code from your partner</span>
                  </div>
                  <ArrowRight size={20} className="setup-arrow" color="var(--text-muted)" />
                </button>
              </div>
            ) : setupMode === 'create' ? (
              <form onSubmit={handleCreateHousehold} className="login-form">
                <div className="form-field">
                  <label>Household Name</label>
                  <div className="field-input-wrapper">
                    <Home size={18} />
                    <input 
                      placeholder="e.g. The Smith Home" 
                      value={householdName}
                      onChange={e => setHouseholdName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>
                <button type="submit" className="login-submit">
                  <span>Create & Continue</span>
                  <ArrowRight size={18} />
                </button>
                <button type="button" className="btn-link" onClick={() => setSetupMode(null)}>Back to Options</button>
              </form>
            ) : (
              <form onSubmit={handleJoinHousehold} className="login-form">
                <div className="form-field">
                  <label>Invite Code</label>
                  <div className="field-input-wrapper">
                    <Lock size={18} />
                    <input 
                      placeholder="ENTER CODE" 
                      style={{ textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center', fontWeight: 'bold' }}
                      value={inviteCode}
                      onChange={e => setInviteCode(e.target.value)}
                      required
                      autoFocus
                      maxLength={10}
                    />
                  </div>
                </div>
                <button type="submit" className="login-submit">
                  <span>Join & Sync</span>
                  <ArrowRight size={18} />
                </button>
                <button type="button" className="btn-link" onClick={() => setSetupMode(null)}>Back to Options</button>
              </form>
            )}

            {error && <p className="error-msg">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  // If authenticated and has household, redirect home
  if (isAuthenticated && household) {
    router.push('/');
    return null;
  }

  return (
    <div className="login-page">
      <div className="login-bg-effects">
        <div className="bg-orb orb-1" />
        <div className="bg-orb orb-2" />
        <div className="bg-orb orb-3" />
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <Home size={28} />
            </div>
            <h1>HomeSync</h1>
            <p>Your household, perfectly in sync</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-banner">{error}</div>}
            
            {isSignUp && (
              <div className="form-field">
                <label>Full Name</label>
                <div className="field-input-wrapper">
                  <User size={18} />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-field">
              <label>Email Address</label>
              <div className="field-input-wrapper">
                <Mail size={18} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label>Password</label>
              <div className="field-input-wrapper">
                <Lock size={18} />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-submit">
              <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight size={18} />
            </button>

            <div className="login-divider">
              <span>or</span>
            </div>

            <button type="button" className="google-btn" onClick={async () => {
              try {
                await loginWithGoogle();
              } catch (err) {
                setError(err.message || 'Google sign-in failed');
              }
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
              <span>Continue with Google</span>
            </button>
          </form>

          <div className="login-footer">
            <p>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>

        <div className="login-tagline">
          <Heart size={14} style={{ color: 'var(--accent-primary)' }} />
          <span>Built for couples who run a home together</span>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-root);
          position: relative;
          overflow: hidden;
          padding: 24px;
        }
        .login-bg-effects {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.15;
        }
        .orb-1 {
          width: 500px;
          height: 500px;
          background: var(--accent-primary);
          top: -150px;
          right: -100px;
          animation: glow 6s ease infinite;
        }
        .orb-2 {
          width: 400px;
          height: 400px;
          background: #FF6B6B;
          bottom: -100px;
          left: -100px;
          animation: glow 8s ease infinite 2s;
        }
        .orb-3 {
          width: 300px;
          height: 300px;
          background: var(--accent-warm);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: glow 7s ease infinite 1s;
        }
        .login-container {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          width: 100%;
          max-width: 420px;
          animation: fadeInUp 0.6s ease;
        }
        .login-card {
          width: 100%;
          background: linear-gradient(135deg, rgba(22, 25, 35, 0.9), rgba(15, 17, 25, 0.95));
          backdrop-filter: blur(40px);
          border: 1px solid var(--border-default);
          border-radius: 24px;
          padding: 40px 36px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), var(--shadow-glow);
        }
        .login-header {
          text-align: center;
          margin-bottom: 36px;
        }
        .login-logo {
          width: 60px;
          height: 60px;
          border-radius: 18px;
          background: linear-gradient(135deg, var(--accent-primary), #FF6B6B);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto 20px;
          box-shadow: 0 0 30px rgba(220, 53, 69, 0.3);
        }
        .login-header h1 {
          font-family: var(--font-display);
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 8px;
          letter-spacing: -0.03em;
        }
        .login-header p {
          color: var(--text-tertiary);
          font-size: 0.9rem;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .form-field label {
          display: block;
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        .field-input-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-primary);
          border: 1px solid var(--border-default);
          border-radius: 12px;
          padding: 0 16px;
          transition: all 0.2s ease;
        }
        .field-input-wrapper:focus-within {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.12);
        }
        .field-input-wrapper svg {
          color: var(--text-muted);
          flex-shrink: 0;
        }
        .field-input-wrapper input {
          flex: 1;
          background: none;
          border: none;
          padding: 14px 0;
          color: var(--text-primary);
          font-size: 0.9375rem;
          outline: none;
        }
        .field-input-wrapper input::placeholder {
          color: var(--text-muted);
        }
        .login-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, var(--accent-primary), var(--red-600));
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 16px rgba(220, 53, 69, 0.3);
          margin-top: 4px;
        }
        .login-submit:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(220, 53, 69, 0.4);
        }
        .login-submit:active {
          transform: scale(0.98);
        }
        .login-divider {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .login-divider::before,
        .login-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border-subtle);
        }
        .login-divider span {
          color: var(--text-muted);
          font-size: 0.8125rem;
        }
        .google-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 12px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-default);
          border-radius: 12px;
          color: var(--text-primary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .google-btn:hover {
          background: var(--bg-quaternary);
          border-color: var(--border-strong);
        }
        .login-footer {
          text-align: center;
          margin-top: 24px;
        }
        .login-footer p {
          font-size: 0.875rem;
          color: var(--text-tertiary);
        }
        .login-footer button {
          background: none;
          border: none;
          color: var(--accent-primary);
          font-weight: 600;
          cursor: pointer;
          margin-left: 4px;
          font-size: 0.875rem;
        }
        .login-footer button:hover {
          text-decoration: underline;
        }
        .login-tagline {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
          font-size: 0.8125rem;
        }
        .setup-options {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .setup-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: var(--bg-primary);
          border: 1px solid var(--border-default);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.25s ease;
          width: 100%;
          text-align: left;
          color: var(--text-primary);
        }
        .setup-card:hover {
          background: var(--bg-tertiary);
          border-color: var(--accent-primary);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }
        .setup-card:active {
          transform: translateY(0);
        }
        .setup-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(220, 53, 69, 0.1), rgba(255, 107, 107, 0.1));
          color: var(--accent-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.25s ease;
        }
        .setup-card:hover .setup-icon {
          transform: scale(1.05) rotate(5deg);
        }
        .setup-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .setup-text strong {
          font-size: 1.05rem;
          font-weight: 600;
        }
        .setup-text span {
          font-size: 0.85rem;
          color: var(--text-tertiary);
        }
        .setup-arrow {
          transition: transform 0.25s ease;
        }
        .setup-card:hover .setup-arrow {
          transform: translateX(4px);
          color: var(--accent-primary) !important;
        }
        .btn-link {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          padding: 8px;
          margin-top: 8px;
          transition: color 0.2s ease;
        }
        .btn-link:hover {
          color: var(--accent-primary);
        }
      `}</style>
    </div>
  );
}
