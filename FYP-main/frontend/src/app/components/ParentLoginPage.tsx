import { AlertCircle, ArrowLeft, Eye, EyeOff, KeyRound, Lock, Mail, Users } from 'lucide-react';
import { useState } from 'react';
import welcomeScene from '@/assets/welcome-scene.jpg';
import { api } from '@/lib/api';
import { ParentPasswordSecurityModal } from './ParentPasswordSecurityModal';
import '@/styles/parent-auth.css';
import '@/styles/auth-login-button.css';

interface ParentLoginPageProps {
  onBack: () => void;
  onSwitchToRegister: () => void;
  onLogin: (parentData: any) => void;
}

export function ParentLoginPage({ onBack, onSwitchToRegister, onLogin }: ParentLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const d = await api.parentLogin({ email: email.trim(), password });
      onLogin(d.parent);
    } catch (e: any) {
      setError(e?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="parent-auth-screen">
        <div
          className="parent-auth-screen__backdrop"
          style={{ backgroundImage: `url(${welcomeScene})` }}
          aria-hidden
        />

        <div className="parent-auth-card">
          <button type="button" className="parent-auth-back" onClick={onBack} aria-label="Back">
            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
          </button>

          <div className="parent-auth-header">
            <div className="parent-auth-avatar">
              <Users className="w-6 h-6" strokeWidth={2.25} />
            </div>
            <h1 className="parent-auth-title">Parent Login</h1>
            <p className="parent-auth-subtitle">Welcome back! Login to your account</p>
          </div>

          <div className="parent-auth-field">
            <label className="parent-auth-label" htmlFor="parent-email">
              Email Address
            </label>
            <div className="parent-auth-input-wrap">
              <Mail strokeWidth={2} />
              <input
                id="parent-email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="parent-auth-input"
              />
            </div>
          </div>

          <div className="parent-auth-field">
            <label className="parent-auth-label" htmlFor="parent-password">
              Password
            </label>
            <div className="parent-auth-input-wrap">
              <Lock strokeWidth={2} />
              <input
                id="parent-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="parent-auth-input"
              />
              <button
                type="button"
                className="parent-auth-eye"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="parent-auth-error" role="alert">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            className="cq-auth-login-btn parent-auth-login"
            onClick={handleLogin}
            disabled={loading}
          >
            <span className="cq-auth-login-btn__label">{loading ? 'Logging in…' : 'Login'}</span>
          </button>

          <button type="button" className="parent-auth-forgot" onClick={() => setShowForgotModal(true)}>
            <KeyRound strokeWidth={2} />
            Forgot password
          </button>

          <p className="parent-auth-footer">
            Don&apos;t have an account?
            <button type="button" onClick={onSwitchToRegister}>
              Register
            </button>
          </p>
        </div>
      </div>

      <ParentPasswordSecurityModal
        open={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        accountEmail={email}
        showChangePasswordTab={false}
      />
    </>
  );
}
