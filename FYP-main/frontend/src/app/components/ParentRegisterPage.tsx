import {
  AlertCircle,
  ArrowLeft,
  Baby,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Plus,
  Trash2,
  User,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import welcomeScene from '@/assets/welcome-scene.jpg';
import { api } from '@/lib/api';
import {
  emptyChildDraft,
  MAX_CHILDREN_PER_PARENT,
  MIN_CHILDREN_PER_PARENT,
  type ChildDraft,
  type ChildLoginCode,
} from './parent/parentChildren';
import '@/styles/parent-auth.css';
import '@/styles/auth-login-button.css';

interface ParentRegisterPageProps {
  onBack: () => void;
  onSwitchToLogin: () => void;
  onRegister: (parentData: any, children: any[], loginCodes: ChildLoginCode[]) => void;
}

export function ParentRegisterPage({ onBack, onSwitchToLogin, onRegister }: ParentRegisterPageProps) {
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [children, setChildren] = useState<ChildDraft[]>([emptyChildDraft()]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateChild = (index: number, patch: Partial<ChildDraft>) => {
    setChildren((prev) => prev.map((child, i) => (i === index ? { ...child, ...patch } : child)));
  };

  const addChildRow = () => {
    if (children.length >= MAX_CHILDREN_PER_PARENT) return;
    setChildren((prev) => [...prev, emptyChildDraft()]);
  };

  const removeChildRow = (index: number) => {
    if (children.length <= MIN_CHILDREN_PER_PARENT) return;
    setChildren((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRegister = async () => {
    if (!parentName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!parentEmail.trim()) {
      setError('Please enter your email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(parentEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    for (let i = 0; i < children.length; i += 1) {
      const child = children[i];
      if (!child.name.trim()) {
        setError(`Please enter child ${i + 1}'s name`);
        return;
      }
      if (!child.age || parseInt(child.age, 10) < 1 || parseInt(child.age, 10) > 18) {
        setError(`Please enter a valid age for child ${i + 1} (1-18)`);
        return;
      }
    }

    const normalizedNames = children.map((child) => child.name.trim().toLowerCase());
    if (new Set(normalizedNames).size !== normalizedNames.length) {
      setError('Each child must have a unique name');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const d = await api.parentRegister({
        parentName: parentName.trim(),
        parentEmail: parentEmail.trim(),
        password,
        children: children.map((child) => ({
          name: child.name.trim(),
          age: child.age.trim(),
        })),
      });
      const createdChildren = d.children ?? (d.child ? [d.child] : []);
      const loginCodes = createdChildren.map((child: any) => ({
        name: child.name,
        loginCode: child.loginCode,
      }));
      onRegister(d.parent, createdChildren, loginCodes);
    } catch (e: any) {
      setError(e?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="parent-auth-screen">
      <div
        className="parent-auth-screen__backdrop"
        style={{ backgroundImage: `url(${welcomeScene})` }}
        aria-hidden
      />

      <div className="parent-auth-card parent-auth-card--register">
        <button type="button" className="parent-auth-back" onClick={onBack} aria-label="Back">
          <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
        </button>

        <div className="parent-auth-header">
          <div className="parent-auth-avatar">
            <Users className="w-6 h-6" strokeWidth={2.25} />
          </div>
          <h1 className="parent-auth-title">Parent Registration</h1>
          <p className="parent-auth-subtitle">Register and add 1–5 children to your account</p>
        </div>

        <div className="parent-auth-field">
          <label className="parent-auth-label" htmlFor="register-parent-name">
            Parent&apos;s Full Name
          </label>
          <div className="parent-auth-input-wrap">
            <User strokeWidth={2} />
            <input
              id="register-parent-name"
              type="text"
              autoComplete="name"
              placeholder="Enter your full name"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              className="parent-auth-input"
            />
          </div>
        </div>

        <div className="parent-auth-field">
          <label className="parent-auth-label" htmlFor="register-parent-email">
            Parent&apos;s Email
          </label>
          <div className="parent-auth-input-wrap">
            <Mail strokeWidth={2} />
            <input
              id="register-parent-email"
              type="email"
              autoComplete="email"
              placeholder="Enter email@example.com"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              className="parent-auth-input"
            />
          </div>
        </div>

        <div className="parent-auth-field">
          <label className="parent-auth-label" htmlFor="register-password">
            Password
          </label>
          <div className="parent-auth-input-wrap">
            <Lock strokeWidth={2} />
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        <div className="parent-auth-field">
          <label className="parent-auth-label" htmlFor="register-confirm-password">
            Confirm Password
          </label>
          <div className="parent-auth-input-wrap">
            <Lock strokeWidth={2} />
            <input
              id="register-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="parent-auth-input"
            />
            <button
              type="button"
              className="parent-auth-eye"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="parent-auth-children-section">
          <div className="parent-auth-children-header">
            <p className="parent-auth-label">Children ({children.length}/{MAX_CHILDREN_PER_PARENT})</p>
            {children.length < MAX_CHILDREN_PER_PARENT && (
              <button type="button" className="parent-auth-add-child" onClick={addChildRow}>
                <Plus className="w-3.5 h-3.5" />
                Add child
              </button>
            )}
          </div>

          {children.map((child, index) => (
            <div key={index} className="parent-auth-child-block">
              <div className="parent-auth-child-block__title">
                <span>Child {index + 1}</span>
                {children.length > MIN_CHILDREN_PER_PARENT && (
                  <button
                    type="button"
                    className="parent-auth-remove-child"
                    onClick={() => removeChildRow(index)}
                    aria-label={`Remove child ${index + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="parent-auth-field">
                <label className="parent-auth-label" htmlFor={`register-child-name-${index}`}>
                  Child&apos;s Name
                </label>
                <div className="parent-auth-input-wrap">
                  <Baby strokeWidth={2} />
                  <input
                    id={`register-child-name-${index}`}
                    type="text"
                    autoComplete="off"
                    placeholder="Enter child's name"
                    value={child.name}
                    onChange={(e) => updateChild(index, { name: e.target.value })}
                    className="parent-auth-input"
                  />
                </div>
              </div>

              <div className="parent-auth-field">
                <label className="parent-auth-label" htmlFor={`register-child-age-${index}`}>
                  Child&apos;s Age
                </label>
                <div className="parent-auth-input-wrap">
                  <User strokeWidth={2} />
                  <input
                    id={`register-child-age-${index}`}
                    type="text"
                    inputMode="numeric"
                    placeholder="Age"
                    value={child.age}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      if (value === '' || (parseInt(value, 10) >= 1 && parseInt(value, 10) <= 18)) {
                        updateChild(index, { age: value });
                      }
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                    maxLength={2}
                    autoComplete="off"
                    className="parent-auth-input"
                  />
                </div>
              </div>
            </div>
          ))}
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
          onClick={handleRegister}
          disabled={loading}
        >
          <span className="cq-auth-login-btn__label">{loading ? 'Registering…' : 'Register'}</span>
        </button>

        <p className="parent-auth-footer">
          Already have an account?
          <button type="button" onClick={onSwitchToLogin}>
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
