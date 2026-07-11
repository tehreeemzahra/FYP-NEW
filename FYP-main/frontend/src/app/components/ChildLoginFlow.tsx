import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Link2, CheckCircle, AlertCircle, Key, Mail, User, Loader, ArrowRight } from 'lucide-react';

type FlowStep = 'login' | 'checking' | 'needs-linking' | 'linking' | 'success' | 'error';

interface ChildLoginFlowProps {
  onComplete: () => void;
  onBack?: () => void;
  onCreateParent?: () => void;
}

export function ChildLoginFlow({ onComplete, onBack, onCreateParent }: ChildLoginFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('login');
  const [childData, setChildData] = useState({
    name: '',
    age: '',
    childId: '',
  });
  const [linkingData, setLinkingData] = useState({
    parentId: '',
    parentEmail: '',
  });
  const [error, setError] = useState('');

  // Simulated child login - checks if account exists and linking status
  const handleChildLogin = () => {
    if (!childData.name || !childData.age) {
      setError('Please enter your name and age');
      return;
    }

    setError('');
    setCurrentStep('checking');

    // Simulate checking account and linking status
    setTimeout(() => {
      // Try to find existing child account in localStorage
      const childId = `CHILD_${childData.name.toLowerCase().replace(/\s+/g, '_')}`;
      const existingChild = localStorage.getItem(`child_${childId}`);

      if (existingChild) {
        const childAccount = JSON.parse(existingChild);
        
        // Check if child is already linked to a parent
        if (childAccount.parentId) {
          // Child is linked - go directly to dashboard
          setChildData({ ...childData, childId });
          setCurrentStep('success');
          setTimeout(() => onComplete(), 1500);
        } else {
          // Child exists but not linked - needs linking
          setChildData({ ...childData, childId });
          setCurrentStep('needs-linking');
        }
      } else {
        // New child - create account and prompt for linking
        const newChildId = 'CH' + Math.random().toString(36).substr(2, 8).toUpperCase();
        const newChild = {
          id: newChildId,
          name: childData.name,
          age: childData.age,
          parentId: null,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem(`child_${newChildId}`, JSON.stringify(newChild));
        setChildData({ ...childData, childId: newChildId });
        setCurrentStep('needs-linking');
      }
    }, 1500);
  };

  // Handle parent linking
  const handleParentLink = () => {
    if (!linkingData.parentId || !linkingData.parentEmail) {
      setError('Please enter both Parent ID and Parent Email');
      return;
    }

    setError('');
    setCurrentStep('linking');

    // Verify Parent ID and Email
    setTimeout(() => {
      const parentAccount = localStorage.getItem(`parent_${linkingData.parentId}`);
      
      if (!parentAccount) {
        setError('Invalid Parent ID. Please check and try again.');
        setCurrentStep('error');
        return;
      }

      const parent = JSON.parse(parentAccount);

      if (parent.email.toLowerCase() !== linkingData.parentEmail.toLowerCase()) {
        setError('Parent Email does not match. Please check and try again.');
        setCurrentStep('error');
        return;
      }

      // Link child to parent
      const childAccount = JSON.parse(localStorage.getItem(`child_${childData.childId}`) || '{}');
      childAccount.parentId = linkingData.parentId;
      childAccount.linkedAt = new Date().toISOString();
      localStorage.setItem(`child_${childData.childId}`, JSON.stringify(childAccount));

      // Update parent's children list
      parent.children = parent.children || [];
      parent.children.push(childAccount);
      localStorage.setItem(`parent_${linkingData.parentId}`, JSON.stringify(parent));

      // Success - redirect to dashboard
      setCurrentStep('success');
      setTimeout(() => onComplete(), 1500);
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#1e3a5f] via-[#2d5a8a] to-[#1e3a5f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {/* Step 1: Child Login */}
          {currentStep === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-block p-3 bg-green-500/20 rounded-full mb-4"
                >
                  <Shield className="w-10 h-10 text-green-400" />
                </motion.div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  Welcome Back! 👋
                </h2>
                <p className="text-white/70 text-sm sm:text-base">
                  Enter your details to continue
                </p>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-white/80 text-sm mb-2">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                    <input
                      type="text"
                      value={childData.name}
                      onChange={(e) => setChildData({ ...childData, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-green-500/50 text-lg"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                {/* Age */}
                <div>
                  <label className="block text-white/80 text-sm mb-2">Your Age</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={childData.age}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 18)) {
                        setChildData({ ...childData, age: value });
                      }
                    }}
                    className="w-full px-4 py-4 rounded-xl bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-green-500/50 text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="How old are you?"
                    maxLength={2}
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/20 border-2 border-red-500 rounded-xl p-3 flex items-center gap-2"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-200 text-sm">{error}</p>
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleChildLogin}
                  className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold text-lg transition-all flex items-center justify-center gap-2"
                >
                  Let's Play! <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Checking Status */}
          {currentStep === 'checking' && (
            <motion.div
              key="checking"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-8"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block mb-6"
                >
                  <Loader className="w-16 h-16 text-blue-400" />
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Checking your account...
                </h2>
                <p className="text-white/70">Please wait a moment</p>
              </div>
            </motion.div>
          )}

          {/* Step 3: Needs Linking */}
          {currentStep === 'needs-linking' && (
            <motion.div
              key="needs-linking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8"
            >
              <div className="text-center mb-6">
                <div className="inline-block p-3 bg-purple-500/20 rounded-full mb-4">
                  <Link2 className="w-10 h-10 text-purple-400" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  Connect to Your Parent
                </h2>
                <p className="text-white/70 text-sm sm:text-base">
                  Ask your parent for their Parent ID to continue
                </p>
              </div>

              <div className="space-y-4">
                {/* Parent ID */}
                <div>
                  <label className="block text-white/80 text-sm mb-2">Parent ID</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                    <input
                      type="text"
                      value={linkingData.parentId}
                      onChange={(e) => setLinkingData({ ...linkingData, parentId: e.target.value.toUpperCase() })}
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-purple-500/50 text-lg font-mono uppercase"
                      placeholder="Enter Parent ID"
                      maxLength={10}
                    />
                  </div>
                  <p className="text-white/60 text-xs mt-2">Example: CQ12ABC34D</p>
                </div>

                {/* Parent Email */}
                <div>
                  <label className="block text-white/80 text-sm mb-2">Parent's Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                    <input
                      type="email"
                      value={linkingData.parentEmail}
                      onChange={(e) => setLinkingData({ ...linkingData, parentEmail: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-purple-500/50 text-lg"
                      placeholder="parent@email.com"
                    />
                  </div>
                </div>

                {/* Help Box */}
                <div className="bg-blue-500/20 rounded-xl p-4">
                  <p className="text-white/80 text-sm">
                    💡 Ask your parent for their Parent ID and email to connect your account safely!
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/20 border-2 border-red-500 rounded-xl p-3 flex items-center gap-2"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-200 text-sm">{error}</p>
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleParentLink}
                  className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg transition-all flex items-center justify-center gap-2"
                >
                  <Link2 className="w-5 h-5" />
                  Connect Account
                </motion.button>

                {/* Don't have Parent ID link */}
                {onCreateParent && (
                  <div className="text-center pt-4">
                    <p className="text-white/60 text-sm mb-2">Don't have a Parent ID?</p>
                    <button
                      onClick={onCreateParent}
                      className="text-blue-300 hover:text-blue-200 font-semibold text-sm underline transition-colors"
                    >
                      Create Parent Account First →
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 4: Linking in Progress */}
          {currentStep === 'linking' && (
            <motion.div
              key="linking"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-8"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block mb-6"
                >
                  <Loader className="w-16 h-16 text-purple-400" />
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Connecting to parent...
                </h2>
                <p className="text-white/70">Verifying credentials</p>
              </div>
            </motion.div>
          )}

          {/* Step 5: Success */}
          {currentStep === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-8"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.6 }}
                  className="inline-block mb-6"
                >
                  <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center relative">
                    <CheckCircle className="w-16 h-16 text-white" />
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.5, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute inset-0 border-4 border-green-400 rounded-full"
                    />
                  </div>
                </motion.div>
                
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Welcome, {childData.name}! 🎉
                </h2>
                <p className="text-white/80 text-lg mb-4">
                  Loading your dashboard...
                </p>
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex justify-center gap-2"
                >
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Step 6: Error */}
          {currentStep === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8"
            >
              <div className="text-center mb-6">
                <div className="inline-block mb-6">
                  <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-12 h-12 text-white" />
                  </div>
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  Connection Failed
                </h2>
                <p className="text-white/80 text-base mb-6">
                  {error}
                </p>

                <div className="bg-yellow-500/20 rounded-xl p-4 mb-6 text-left">
                  <h4 className="text-white font-semibold mb-2">Please check:</h4>
                  <ul className="space-y-2 text-white/80 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">•</span>
                      <span>The Parent ID is correct</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">•</span>
                      <span>The Parent Email matches exactly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">•</span>
                      <span>There are no typos or extra spaces</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => {
                    setError('');
                    setCurrentStep('needs-linking');
                  }}
                  className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-lg transition-all"
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}