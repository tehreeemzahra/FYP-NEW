import { AlertCircle, ArrowLeft, Baby, Hash, User } from 'lucide-react';
import { useState } from 'react';
import welcomeScene from '@/assets/welcome-scene.jpg';
import { api } from '@/lib/api';
import '@/styles/child-auth.css';
import '@/styles/auth-login-button.css';

interface ChildLoginPageProps {
  onBack: () => void;
  onLogin: (childData: any) => void;
  onSwitchToRegister?: () => void;
}

export function ChildLoginPage({ onBack, onLogin, onSwitchToRegister }: ChildLoginPageProps) {
  const [childName, setChildName] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!childName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!loginCode || String(loginCode).length !== 2) {
      setError('Please enter your 2-digit login code');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const d = await api.childLogin({ name: childName.trim(), loginCode: String(loginCode) });
      onLogin(d.child);
    } catch (e: any) {
      setError(e?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="child-auth-screen">
      <div
        className="child-auth-screen__backdrop"
        style={{ backgroundImage: `url(${welcomeScene})` }}
        aria-hidden
      />

      <div className="child-auth-card">
        <div className="child-auth-stars" aria-hidden>
          <span>✦</span>
          <span>✦</span>
        </div>

        <button type="button" className="child-auth-back" onClick={onBack} aria-label="Back">
          <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
        </button>

        <div className="child-auth-header">
          <div className="child-auth-avatar">
            <Baby className="w-6 h-6" strokeWidth={2.25} />
          </div>
          <h1 className="child-auth-title">Child Login</h1>
          <p className="child-auth-subtitle">Enter your name and the code from your parent</p>
        </div>

        <div className="child-auth-field">
          <label className="child-auth-label" htmlFor="child-name">
            Your Name
          </label>
          <div className="child-auth-input-wrap">
            <User strokeWidth={2} />
            <input
              id="child-name"
              type="text"
              autoComplete="name"
              placeholder="Enter your name"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="child-auth-input"
            />
          </div>
        </div>

        <div className="child-auth-field">
          <label className="child-auth-label" htmlFor="child-code">
            Your Login Code
          </label>
          <div className="child-auth-input-wrap">
            <Hash strokeWidth={2} />
            <input
              id="child-code"
              type="text"
              inputMode="numeric"
              placeholder="00"
              value={loginCode}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                if (value.length <= 2) {
                  setLoginCode(value);
                }
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              maxLength={2}
              autoComplete="off"
              className="child-auth-input child-auth-input--code"
            />
          </div>
        </div>

        <p className="child-auth-hint">Ask your parent for this code</p>

        {error && (
          <div className="child-auth-error" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          className="cq-auth-login-btn child-auth-login"
          onClick={handleLogin}
          disabled={loading}
        >
          <span className="cq-auth-login-btn__label">{loading ? 'Logging in…' : 'Login'}</span>
        </button>

        <p className="child-auth-footer">
          Don&apos;t have a code?{' '}
          <button type="button" onClick={onSwitchToRegister}>
            Ask your parent to register for you!
          </button>
        </p>
      </div>
    </div>
  );
}
