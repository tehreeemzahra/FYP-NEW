import { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Shield,
  User,
} from 'lucide-react';
import welcomeScene from '@/assets/welcome-scene.jpg';
import { api } from '@/lib/api';
import { AdminPasswordResetModal } from './AdminPasswordResetModal';
import '@/styles/parent-auth.css';
import '@/styles/admin-auth.css';
import '@/styles/auth-login-button.css';

interface AdminLoginPageProps {
  onBack: () => void;
  onLoginSuccess: (admin: any) => void;
}

export function AdminLoginPage({ onBack, onLoginSuccess }: AdminLoginPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim()) {
      setError('Please enter your username');
      return;
    }
    if (mode === 'signup' && !email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const data =
        mode === 'login'
          ? await api.adminLogin({ username: username.trim(), password })
          : await api.adminRegister({ username: username.trim(), email: email.trim(), password });
      onLoginSuccess(data.admin);
    } catch (err: any) {
      setError(err?.message || (mode === 'login' ? 'Admin login failed' : 'Admin signup failed'));
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
            <div className="parent-auth-avatar admin-auth-avatar">
              <Shield className="w-6 h-6" strokeWidth={2.25} />
            </div>
            <h1 className="parent-auth-title">{mode === 'login' ? 'Admin Login' : 'Admin Sign Up'}</h1>
            <p className="parent-auth-subtitle">Secure admin access for account management</p>
          </div>

          <div className="admin-auth-mode">
            <button
              type="button"
              className={`admin-auth-mode__btn${mode === 'login' ? ' admin-auth-mode__btn--active' : ''}`}
              onClick={() => {
                setMode('login');
                setError('');
              }}
            >
              Login
            </button>
            <button
              type="button"
              className={`admin-auth-mode__btn${mode === 'signup' ? ' admin-auth-mode__btn--active' : ''}`}
              onClick={() => {
                setMode('signup');
                setError('');
              }}
            >
              Sign Up
            </button>
          </div>

          <div className="parent-auth-field">
            <label className="parent-auth-label" htmlFor="admin-username">
              Username
            </label>
            <div className="parent-auth-input-wrap">
              <User strokeWidth={2} />
              <input
                id="admin-username"
                type="text"
                autoComplete="username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="parent-auth-input"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div className="parent-auth-field">
              <label className="parent-auth-label" htmlFor="admin-email">
                Email Address
              </label>
              <div className="parent-auth-input-wrap">
                <Mail strokeWidth={2} />
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  className="parent-auth-input"
                />
              </div>
            </div>
          )}

          <div className="parent-auth-field">
            <label className="parent-auth-label" htmlFor="admin-password">
              Password
            </label>
            <div className="parent-auth-input-wrap">
              <Lock strokeWidth={2} />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
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
            className="cq-auth-login-btn admin-auth-login"
            onClick={handleSubmit}
            disabled={loading}
          >
            <span className="cq-auth-login-btn__label">
              {loading
                ? mode === 'login'
                  ? 'Logging in…'
                  : 'Creating account…'
                : mode === 'login'
                  ? 'Login'
                  : 'Sign Up'}
            </span>
          </button>

          {mode === 'login' && (
            <button type="button" className="parent-auth-forgot" onClick={() => setShowForgotModal(true)}>
              <KeyRound strokeWidth={2} />
              Forgot password
            </button>
          )}

          <p className="parent-auth-footer">
            {mode === 'login' ? "Don't have an admin account?" : 'Already have an admin account?'}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
              }}
            >
              {mode === 'login' ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>

      <AdminPasswordResetModal
        open={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        initialAccount={email.trim() || username.trim()}
      />
    </>
  );
}
