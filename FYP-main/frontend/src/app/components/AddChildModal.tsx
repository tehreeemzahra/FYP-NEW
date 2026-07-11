import { AlertCircle, Baby, Hash, X } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';
import { api } from '@/lib/api';
import { MAX_CHILDREN_PER_PARENT } from './parent/parentChildren';

interface AddChildModalProps {
  currentCount: number;
  onClose: () => void;
  onAdded: (child: any, loginCode: string) => void;
}

export function AddChildModal({ currentCount, onClose, onAdded }: AddChildModalProps) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [createdChild, setCreatedChild] = useState<any>(null);

  const remaining = MAX_CHILDREN_PER_PARENT - currentCount;

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Please enter your child's name");
      return;
    }
    if (!age || parseInt(age, 10) < 1 || parseInt(age, 10) > 18) {
      setError('Please enter a valid age (1-18)');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await api.createParentChild({ name: name.trim(), age: age.trim() });
      setCreatedChild(result.child);
      setCreatedCode(result.loginCode);
    } catch (e: any) {
      setError(e?.message || 'Could not add child');
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    if (createdChild && createdCode) {
      onAdded(createdChild, createdCode);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Add another child</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {remaining} slot{remaining === 1 ? '' : 's'} left (max {MAX_CHILDREN_PER_PARENT})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {createdCode ? (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200">
                <Hash className="w-7 h-7 text-emerald-700" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{createdChild?.name} is ready!</p>
                <p className="text-xs text-gray-500 mt-1">Share this login code on the child sign-in screen.</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-4xl font-bold font-mono tracking-[0.25em] text-gray-900">{createdCode}</p>
              </div>
              <button
                type="button"
                onClick={handleDone}
                className="w-full rounded-xl bg-[#2d5a8a] text-white py-3 font-semibold hover:bg-[#244a72] transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Child&apos;s name</label>
                <div className="relative">
                  <Baby className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter child's name"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2d5a8a]/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Child&apos;s age</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={age}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    if (value === '' || (parseInt(value, 10) >= 1 && parseInt(value, 10) <= 18)) {
                      setAge(value);
                    }
                  }}
                  maxLength={2}
                  placeholder="Age"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2d5a8a]/30"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full rounded-xl bg-[#2d5a8a] text-white py-3 font-semibold hover:bg-[#244a72] transition-colors disabled:opacity-60"
              >
                {loading ? 'Creating account…' : 'Create child account'}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
