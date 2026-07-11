import { motion } from 'motion/react';
import { Key, Copy, Check, FileText } from 'lucide-react';
import { useState } from 'react';
import type { ChildLoginCode } from './parent/parentChildren';

interface LoginCodeModalProps {
  childAccounts: ChildLoginCode[];
  onContinue: () => void;
  onGoToLogins: () => void;
}

export function LoginCodeModal({ childAccounts, onContinue, onGoToLogins }: LoginCodeModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const count = childAccounts.length;
  const singleChild = count === 1 ? childAccounts[0] : null;

  const copyToClipboard = (loginCode: string, index: number) => {
    const textarea = document.createElement('textarea');
    textarea.value = loginCode;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand('copy');
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    } finally {
      document.body.removeChild(textarea);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="bg-gradient-to-br from-[#4a9fd8] to-[#5a9fd4] rounded-2xl sm:rounded-[28px] p-4 sm:p-6 md:p-8 lg:p-10 max-w-md w-full shadow-2xl relative my-auto max-h-[calc(100vh-2rem)] overflow-y-auto"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-block p-4 sm:p-5 bg-white/20 rounded-full mb-4 sm:mb-5"
          >
            <Key className="w-12 h-12 sm:w-14 sm:h-14 text-yellow-300" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white text-2xl sm:text-3xl font-bold mb-3"
          >
            Account Created! 🎉
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/90 text-sm sm:text-base mb-6 sm:mb-7"
          >
            {count === 1
              ? `${singleChild?.name}'s account is ready!`
              : `${count} child accounts are ready!`}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/20 rounded-2xl p-5 sm:p-6 mb-5 sm:mb-6 border-2 border-white/30 space-y-4"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Hash className="w-5 h-5 text-yellow-300" />
              <p className="text-white/90 text-sm sm:text-base font-semibold">
                {count === 1 ? "Child's Login Code" : "Children's Login Codes"}
              </p>
            </div>

            {childAccounts.map((child, index) => (
              <div key={`${child.name}-${child.loginCode}`} className="bg-white/15 rounded-xl p-4">
                <p className="text-white/90 text-sm font-semibold mb-2">{child.name}</p>
                <div className="bg-white/30 rounded-xl p-4 mb-3">
                  <motion.p
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.55 + index * 0.05, type: 'spring', stiffness: 150 }}
                    className="text-4xl sm:text-5xl font-bold text-white tracking-[0.25em] font-mono"
                  >
                    {child.loginCode}
                  </motion.p>
                </div>
                <button
                  onClick={() => copyToClipboard(child.loginCode, index)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/30 hover:bg-white/40 rounded-xl text-white font-semibold transition-all text-sm"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy {child.name}&apos;s code
                    </>
                  )}
                </button>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-orange-500/30 border-2 border-orange-300/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-5 sm:mb-6 text-left"
          >
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-orange-200 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-semibold text-sm sm:text-base mb-2">
                  📌 Important: Save These Codes!
                </p>
                <ul className="text-white/95 text-xs sm:text-sm space-y-1.5">
                  <li>• Each child gets their own unique login code</li>
                  <li>• They need their name + code to sign in</li>
                  <li>• Keep the codes safe — they cannot be changed</li>
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onContinue}
            className="w-full bg-[#f37835] hover:bg-[#e86925] text-white rounded-xl sm:rounded-2xl py-3.5 sm:py-4 font-bold transition-colors text-base sm:text-lg shadow-lg"
          >
            Continue to Parent Dashboard
          </motion.button>

          <button
            onClick={onGoToLogins}
            className="mt-3 w-full bg-white/15 hover:bg-white/25 text-white rounded-xl sm:rounded-2xl py-3 text-sm sm:text-base font-semibold transition-colors border border-white/30"
          >
            Go to Login Options
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Hash({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  );
}
