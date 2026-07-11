import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Mail, AlertCircle, CheckCircle, KeyRound } from 'lucide-react';
import { api } from '@/lib/api';

type Tab = 'change' | 'reset';

type ParentPasswordSecurityModalProps = {
  open: boolean;
  onClose: () => void;
  /** Parent email when logged in (pre-filled for reset tab). */
  accountEmail?: string;
  /** Show “Change password” tab (requires parent session). */
  showChangePasswordTab?: boolean;
}

export function ParentPasswordSecurityModal({
  open,
  onClose,
  accountEmail = '',
  showChangePasswordTab = true,
}: ParentPasswordSecurityModalProps) {
  const [tab, setTab] = useState<Tab>(showChangePasswordTab ? 'change' : 'reset');
  const [currentPassword, setCurrentPassword] = useState('');
  const [email, setEmail] = useState(accountEmail);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setTab(showChangePasswordTab ? 'change' : 'reset');
      setEmail(accountEmail);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess('');
    }
  }, [open, accountEmail, showChangePasswordTab]);

  const validateNew = () => {
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');
    if (!currentPassword.trim()) {
      setError('Enter your current password.');
      return;
    }
    if (!validateNew()) return;
    setLoading(true);
    try {
      await api.updateParentPassword({ currentPassword, newPassword });
      setSuccess('Password updated. You can keep using the app; next login use your new password.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not update password.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError('');
    setSuccess('');
    if (!email.trim()) {
      setError('Enter the email for your parent account.');
      return;
    }
    if (!validateNew()) return;
    setLoading(true);
    try {
      await api.parentResetPassword({ email: email.trim(), newPassword });
      setSuccess('If that email is registered, the password has been updated. You can sign in with the new password.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
      <motion.div
        key="parent-pwd-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          key="parent-pwd-dialog"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-gray-200"
        >
          <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-[#2d5a8a] to-[#1e3a5f] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5" />
              <h2 className="font-bold text-lg">Password & security</h2>
            </div>
            <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6">
            {showChangePasswordTab && (
              <div className="flex rounded-xl bg-gray-100 p-1 mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setTab('change');
                    setError('');
                    setSuccess('');
                  }}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                    tab === 'change' ? 'bg-white text-[#1e3a5f] shadow-sm' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Change password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab('reset');
                    setError('');
                    setSuccess('');
                  }}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                    tab === 'reset' ? 'bg-white text-[#1e3a5f] shadow-sm' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Forgot password
                </button>
              </div>
            )}

            {!showChangePasswordTab && (
              <p className="text-sm text-gray-600 mb-4">
                Enter your account email and choose a new password. This demo does not send email — the password updates immediately if the email exists.
              </p>
            )}

            {showChangePasswordTab && tab === 'change' && (
              <p className="text-sm text-gray-600 mb-4">Use your current password, then pick a new one (at least 6 characters).</p>
            )}
            {showChangePasswordTab && tab === 'reset' && (
              <p className="text-sm text-gray-600 mb-4">
                Use the email on your CyberQuest parent account. You stay signed in on this device; use the new password next time you log in.
              </p>
            )}

            {tab === 'reset' && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 min-w-0 bg-transparent text-sm outline-none text-gray-900"
                    placeholder="parent@email.com"
                    autoComplete="email"
                  />
                </div>
              </div>
            )}

            {tab === 'change' && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Current password</label>
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
                  <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="flex-1 min-w-0 bg-transparent text-sm outline-none text-gray-900"
                    placeholder="Current password"
                    autoComplete="current-password"
                  />
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">New password</label>
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
                <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="flex-1 min-w-0 bg-transparent text-sm outline-none text-gray-900"
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Confirm new password</label>
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
                <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="flex-1 min-w-0 bg-transparent text-sm outline-none text-gray-900"
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-4 flex gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-800">
                <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              {tab === 'change' ? (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleChangePassword}
                  className="rounded-xl bg-gradient-to-r from-[#2d5a8a] to-[#1e3a5f] px-4 py-2.5 text-sm font-semibold text-white shadow hover:opacity-95 disabled:opacity-60"
                >
                  {loading ? 'Saving…' : 'Update password'}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleResetPassword}
                  className="rounded-xl bg-gradient-to-r from-[#2d5a8a] to-[#1e3a5f] px-4 py-2.5 text-sm font-semibold text-white shadow hover:opacity-95 disabled:opacity-60"
                >
                  {loading ? 'Resetting…' : 'Reset password'}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
