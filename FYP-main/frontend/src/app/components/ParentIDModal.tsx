import { motion } from 'motion/react';
import { X, Key, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ParentIDModalProps {
  parentId: string;
  onContinue: () => void;
}

export function ParentIDModal({ parentId, onContinue }: ParentIDModalProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const textarea = document.createElement('textarea');
    textarea.value = parentId;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    } finally {
      document.body.removeChild(textarea);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#6ca9d8] rounded-[24px] p-8 max-w-md w-full shadow-2xl relative"
      >
        <div className="text-center">
          {/* Icon */}
          <div className="inline-block p-4 bg-white/20 rounded-full mb-4">
            <Key className="w-12 h-12 text-yellow-300" />
          </div>

          {/* Title */}
          <h2 className="text-white text-2xl sm:text-3xl font-bold mb-3">
            Account Created! 🎉
          </h2>
          
          <p className="text-white/90 text-sm mb-6">
            Your unique Parent ID has been generated
          </p>

          {/* Parent ID Card */}
          <div className="bg-white/20 rounded-2xl p-6 mb-6">
            <p className="text-white/80 text-sm mb-2">Your Parent ID</p>
            <div className="bg-white/30 rounded-xl p-4 mb-4">
              <p className="text-3xl font-bold text-white tracking-wider font-mono">
                {parentId}
              </p>
            </div>

            <button
              onClick={copyToClipboard}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/30 hover:bg-white/40 rounded-xl text-white font-semibold transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy Parent ID
                </>
              )}
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/20 rounded-xl p-4 mb-6 text-left">
            <p className="text-white/90 text-sm">
              <strong>📌 Important:</strong> Share this Parent ID with your child so they can link their account during registration or login!
            </p>
          </div>

          {/* Continue Button */}
          <button
            onClick={onContinue}
            className="w-full bg-[#f37835] hover:bg-[#e86925] text-white rounded-xl py-4 font-bold transition-colors text-lg"
          >
            Continue to Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
}
