'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { Home, Mail, Lock, ArrowRight, Heart, User, Plus, Users, LayoutDashboard } from 'lucide-react';
import './login.css';

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

    </div>
  );
}
