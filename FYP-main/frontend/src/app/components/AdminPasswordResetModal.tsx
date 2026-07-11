import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, AlertCircle, CheckCircle, KeyRound, User } from 'lucide-react';
import { api } from '@/lib/api';

type AdminPasswordResetModalProps = {
  open: boolean;
  onClose: () => void;
  /** Pre-fill from signup email or login username */
  initialAccount?: string;
};

export function AdminPasswordResetModal({ open, onClose, initialAccount = '' }: AdminPasswordResetModalProps) {
  const [account, setAccount] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setAccount(initialAccount);
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess('');
    }
  }, [open, initialAccount]);

  const handleReset = async () => {
    setError('');
    setSuccess('');
    if (!account.trim()) {
      setError('Enter your admin email or username.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    setLoading(true);
    try {
      await api.adminResetPassword({ account: account.trim(), newPassword });
      setSuccess(
        'If that email or username is registered as an admin, the password has been updated. Sign in with your username and the new password.',
      );
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
          key="admin-pwd-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            key="admin-pwd-dialog"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5" />
                <h2 className="text-lg font-bold">Admin password recovery</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 transition-colors hover:bg-white/10"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <p className="mb-4 text-sm text-gray-600">
                Enter the email or username for your admin account (the one you used at sign-up). This demo does not
                send email — the password updates immediately if the account exists. Default env-only admin accounts (no
                signup) cannot be reset here.
              </p>

              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-medium text-gray-600">Email or username</label>
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
                  <User className="h-4 w-4 shrink-0 text-gray-400" />
                  <input
                    type="text"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none"
                    placeholder="admin@example.com or your_username"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-medium text-gray-600">New password</label>
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
                  <Lock className="h-4 w-4 shrink-0 text-gray-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none"
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-medium text-gray-600">Confirm new password</label>
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
                  <Lock className="h-4 w-4 shrink-0 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none"
                    placeholder="Repeat new password"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {error && (
                <div className="mb-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="mb-4 flex gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-800">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleReset}
                  className="rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow hover:opacity-95 disabled:opacity-60"
                >
                  {loading ? 'Resetting…' : 'Reset password'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
