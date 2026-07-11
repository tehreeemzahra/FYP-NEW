import { motion } from 'motion/react';
import { Key, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ChildIDModalProps {
  childId: string;
  childName: string;
  onContinue: () => void;
}

export function ChildIDModal({ childId, childName, onContinue }: ChildIDModalProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const textarea = document.createElement('textarea');
    textarea.value = childId;
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
        className="bg-gradient-to-br from-[#4a9fd8] to-[#3d7ba8] rounded-[24px] p-6 sm:p-8 max-w-md w-full shadow-2xl relative"
      >
        <div className="text-center">
          {/* Icon */}
          <div className="inline-block p-4 bg-white/20 rounded-full mb-4">
            <Key className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-300" />
          </div>

          {/* Title */}
          <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-bold mb-3">
            Welcome, {childName}! 🎉
          </h2>
          
          <p className="text-white/90 text-xs sm:text-sm mb-5 sm:mb-6">
            Your account has been created successfully!
          </p>

          {/* Child ID Card */}
          <div className="bg-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-5 sm:mb-6">
            <p className="text-white/80 text-sm mb-2">Your Login ID</p>
            <div className="bg-white/30 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-wider font-mono break-all">
                {childId}
              </p>
            </div>

            <button
              onClick={copyToClipboard}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-white/30 hover:bg-white/40 rounded-lg sm:rounded-xl text-white font-semibold transition-all text-sm sm:text-base"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                  Copy Login ID
                </>
              )}
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-orange-500/30 border-2 border-orange-300/50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-5 sm:mb-6 text-left">
            <p className="text-white/95 text-xs sm:text-sm leading-relaxed">
              <strong className="text-orange-200">📌 Important:</strong> Save this Login ID! You'll need it to log in next time. You can also find it in your Profile page.
            </p>
          </div>

          {/* Continue Button */}
          <button
            onClick={onContinue}
            className="w-full bg-[#f37835] hover:bg-[#e86925] text-white rounded-lg sm:rounded-xl py-3 sm:py-4 font-bold transition-colors text-base sm:text-lg shadow-lg"
          >
            Start Your Adventure! 🚀
          </button>
        </div>
      </motion.div>
    </div>
  );
}
