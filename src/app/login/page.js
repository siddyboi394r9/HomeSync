'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { Home, Mail, Lock, ArrowRight, Heart, User, Plus, Users } from 'lucide-react';
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

  const handleSignOut = async () => {
    try {
      await logout();
      setSetupMode(null);
      setError('');
      router.push('/login');
    } catch (err) {
      setError('Failed to sign out');
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

            <div className="login-footer" style={{ marginTop: '24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
              <p>
                Not you? 
                <button onClick={handleSignOut} style={{ color: 'var(--text-tertiary)', marginLeft: '8px' }}>
                  Sign Out & Reset
                </button>
              </p>
            </div>
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
