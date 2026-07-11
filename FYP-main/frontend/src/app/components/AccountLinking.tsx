import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Shield, Users, Link2, CheckCircle, AlertCircle, Copy, Check, Lock, Mail, User, Key } from 'lucide-react';

type FlowStep = 
  | 'account-type'
  | 'parent-signup'
  | 'parent-success'
  | 'child-signup'
  | 'child-link'
  | 'link-verification'
  | 'link-success'
  | 'link-error';

interface AccountLinkingProps {
  onComplete?: (accountType: 'parent' | 'child', linkedData?: any) => void;
  onBack?: () => void;
}

export function AccountLinking({ onComplete, onBack }: AccountLinkingProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('account-type');
  const [accountType, setAccountType] = useState<'parent' | 'child' | null>(null);
  const [copied, setCopied] = useState(false);

  // Parent data
  const [parentData, setParentData] = useState({
    name: '',
    email: '',
    password: '',
    parentId: '',
  });

  // Child data
  const [childData, setChildData] = useState({
    name: '',
    age: '',
    parentId: '',
    parentEmail: '',
  });

  const [error, setError] = useState('');

  // Generate unique Parent ID
  const generateParentId = () => {
    return 'CQ' + Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  const handleAccountTypeSelect = (type: 'parent' | 'child') => {
    setAccountType(type);
    if (type === 'parent') {
      setCurrentStep('parent-signup');
    } else {
      setCurrentStep('child-signup');
    }
  };

  const handleParentSignup = () => {
    if (!parentData.name || !parentData.email || !parentData.password) {
      setError('Please fill in all fields');
      return;
    }

    // Generate Parent ID
    const generatedId = generateParentId();
    setParentData({ ...parentData, parentId: generatedId });

    // Save to localStorage (in production, this would be API call)
    const parentAccount = {
      id: generatedId,
      name: parentData.name,
      email: parentData.email,
      password: parentData.password,
      children: [],
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(`parent_${generatedId}`, JSON.stringify(parentAccount));

    setError('');
    setCurrentStep('parent-success');
  };

  const handleChildSignup = () => {
    if (!childData.name || !childData.age) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setCurrentStep('child-link');
  };

  const handleChildLink = () => {
    if (!childData.parentId || !childData.parentEmail) {
      setError('Please enter both Parent ID and Parent Email');
      return;
    }

    // Verify Parent ID exists
    const parentAccount = localStorage.getItem(`parent_${childData.parentId}`);
    
    if (!parentAccount) {
      setError('Invalid Parent ID. Please check and try again.');
      setCurrentStep('link-error');
      return;
    }

    const parent = JSON.parse(parentAccount);

    // Verify Parent Email matches
    if (parent.email.toLowerCase() !== childData.parentEmail.toLowerCase()) {
      setError('Parent Email does not match. Please check and try again.');
      setCurrentStep('link-error');
      return;
    }

    // Link child to parent
    const childAccount = {
      id: 'CH' + Math.random().toString(36).substr(2, 8).toUpperCase(),
      name: childData.name,
      age: childData.age,
      parentId: childData.parentId,
      linkedAt: new Date().toISOString(),
    };

    // Update parent's children list
    parent.children.push(childAccount);
    localStorage.setItem(`parent_${childData.parentId}`, JSON.stringify(parent));

    // Save child account
    localStorage.setItem(`child_${childAccount.id}`, JSON.stringify(childAccount));

    setError('');
    setCurrentStep('link-success');
  };

  const copyToClipboard = (text: string) => {
    // Fallback method that works without Clipboard API
    const textarea = document.createElement('textarea');
    textarea.value = text;
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
    <div className="min-h-screen w-full bg-gradient-to-b from-[#1e3a5f] via-[#2d5a8a] to-[#1e3a5f] relative overflow-hidden">
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        {onBack && (
          <div className="p-4 sm:p-6">
            <button
              onClick={onBack}
              className="text-white/80 hover:text-white transition-colors p-2 flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-sm sm:text-base">Back</span>
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              {/* Step 1: Account Type Selection */}
              {currentStep === 'account-type' && (
                <motion.div
                  key="account-type"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', duration: 0.6 }}
                      className="inline-block mb-4"
                    >
                      <Shield className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-400" />
                    </motion.div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                      Welcome to CyberQuest!
                    </h1>
                    <p className="text-white/80 text-sm sm:text-base">
                      Choose your account type to get started
                    </p>
                  </div>

                  {/* Parent Account Card */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAccountTypeSelect('parent')}
                    className="w-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-left shadow-xl hover:shadow-2xl transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">Parent Account</h3>
                        <p className="text-white/80 text-sm">
                          Create an account to monitor your children's progress
                        </p>
                      </div>
                    </div>
                  </motion.button>

                  {/* Child Account Card */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAccountTypeSelect('child')}
                    className="w-full bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-left shadow-xl hover:shadow-2xl transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">Child Account</h3>
                        <p className="text-white/80 text-sm">
                          Play games and learn about cybersecurity!
                        </p>
                      </div>
                    </div>
                  </motion.button>
                </motion.div>
              )}

              {/* Step 2: Parent Signup */}
              {currentStep === 'parent-signup' && (
                <motion.div
                  key="parent-signup"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8"
                >
                  <div className="text-center mb-6">
                    <div className="inline-block p-3 bg-blue-500/20 rounded-full mb-4">
                      <Users className="w-8 h-8 text-blue-400" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                      Create Parent Account
                    </h2>
                    <p className="text-white/70 text-sm sm:text-base">
                      Enter your details to get started
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-white/80 text-sm mb-2">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                        <input
                          type="text"
                          value={parentData.name}
                          onChange={(e) => setParentData({ ...parentData, name: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-white/80 text-sm mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                        <input
                          type="email"
                          value={parentData.email}
                          onChange={(e) => setParentData({ ...parentData, email: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-white/80 text-sm mb-2">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                        <input
                          type="password"
                          value={parentData.password}
                          onChange={(e) => setParentData({ ...parentData, password: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                          placeholder="Create a secure password"
                        />
                      </div>
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

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setCurrentStep('account-type')}
                        className="px-6 py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold transition-all"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleParentSignup}
                        className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold transition-all"
                      >
                        Create Account
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Parent Success with Parent ID */}
              {currentStep === 'parent-success' && (
                <motion.div
                  key="parent-success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8"
                >
                  <div className="text-center mb-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', duration: 0.6 }}
                      className="inline-block mb-4"
                    >
                      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-white" />
                      </div>
                    </motion.div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                      Account Created! 🎉
                    </h2>
                    <p className="text-white/70 text-sm sm:text-base">
                      Your Parent ID has been generated
                    </p>
                  </div>

                  {/* Parent ID Card */}
                  <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Key className="w-6 h-6 text-yellow-400" />
                      <h3 className="text-lg font-bold text-white">Your Parent ID</h3>
                    </div>
                    
                    <div className="bg-white/10 rounded-xl p-4 mb-4">
                      <p className="text-3xl font-bold text-center text-white tracking-wider">
                        {parentData.parentId}
                      </p>
                    </div>

                    <button
                      onClick={() => copyToClipboard(parentData.parentId)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 rounded-xl text-white font-semibold transition-all"
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

                  {/* Important Instructions */}
                  <div className="bg-blue-500/20 rounded-xl p-4 mb-6">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Important:
                    </h4>
                    <ul className="space-y-2 text-white/80 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-0.5">•</span>
                        <span>Share this Parent ID with your child to link their account</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-0.5">•</span>
                        <span>Keep this ID safe and secure</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-0.5">•</span>
                        <span>Your child will need this ID and your email to link</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => onComplete?.('parent', parentData)}
                    className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold text-lg transition-all"
                  >
                    Continue to Dashboard
                  </button>
                </motion.div>
              )}

              {/* Step 4: Child Signup */}
              {currentStep === 'child-signup' && (
                <motion.div
                  key="child-signup"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8"
                >
                  <div className="text-center mb-6">
                    <div className="inline-block p-3 bg-green-500/20 rounded-full mb-4">
                      <Shield className="w-8 h-8 text-green-400" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                      Create Your Account
                    </h2>
                    <p className="text-white/70 text-sm sm:text-base">
                      Tell us a bit about yourself!
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
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-green-500/50 text-lg"
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
                        className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-green-500/50 text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setCurrentStep('account-type')}
                        className="px-6 py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold transition-all"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleChildSignup}
                        className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold transition-all"
                      >
                        Next Step
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 5: Child Link with Parent */}
              {currentStep === 'child-link' && (
                <motion.div
                  key="child-link"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8"
                >
                  <div className="text-center mb-6">
                    <div className="inline-block p-3 bg-purple-500/20 rounded-full mb-4">
                      <Link2 className="w-8 h-8 text-purple-400" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                      Connect to Parent
                    </h2>
                    <p className="text-white/70 text-sm sm:text-base">
                      Ask your parent for their Parent ID
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
                          value={childData.parentId}
                          onChange={(e) => setChildData({ ...childData, parentId: e.target.value.toUpperCase() })}
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-purple-500/50 text-lg font-mono uppercase"
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
                          value={childData.parentEmail}
                          onChange={(e) => setChildData({ ...childData, parentEmail: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-purple-500/50 text-lg"
                          placeholder="parent@email.com"
                        />
                      </div>
                      <p className="text-white/60 text-xs mt-2">This helps verify the connection</p>
                    </div>

                    {/* Help Box */}
                    <div className="bg-blue-500/20 rounded-xl p-4">
                      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Need Help?
                      </h4>
                      <p className="text-white/80 text-sm">
                        Ask your parent to share their Parent ID and email address with you. You'll need both to connect safely!
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

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setCurrentStep('child-signup')}
                        className="px-6 py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold transition-all"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleChildLink}
                        className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <Link2 className="w-5 h-5" />
                        Link Account
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 6: Link Success */}
              {currentStep === 'link-success' && (
                <motion.div
                  key="link-success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8"
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
                          transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                          className="absolute inset-0 border-4 border-green-400 rounded-full"
                        />
                      </div>
                    </motion.div>
                    
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                      Connected! 🎉
                    </h2>
                    <p className="text-white/80 text-base sm:text-lg mb-8">
                      Your account is now linked to your parent's account. You're ready to start your cybersecurity adventure!
                    </p>

                    <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-6 mb-6">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-3xl text-white">→</div>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <p className="text-white/70 text-sm">
                        {childData.name} is now connected to their parent's account
                      </p>
                    </div>

                    <button
                      onClick={() => onComplete?.('child', childData)}
                      className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold text-lg transition-all"
                    >
                      Start Playing! 🎮
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 7: Link Error */}
              {currentStep === 'link-error' && (
                <motion.div
                  key="link-error"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8"
                >
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', duration: 0.6 }}
                      className="inline-block mb-6"
                    >
                      <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-16 h-16 text-white" />
                      </div>
                    </motion.div>
                    
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                      Connection Failed
                    </h2>
                    <p className="text-white/80 text-base sm:text-lg mb-6">
                      {error}
                    </p>

                    <div className="bg-yellow-500/20 rounded-xl p-4 mb-6 text-left">
                      <h4 className="text-white font-semibold mb-2">Please check:</h4>
                      <ul className="space-y-2 text-white/80 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-0.5">•</span>
                          <span>The Parent ID is correct (ask your parent to check)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-0.5">•</span>
                          <span>The Parent Email matches exactly</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-0.5">•</span>
                          <span>There are no extra spaces or typos</span>
                        </li>
                      </ul>
                    </div>

                    <button
                      onClick={() => {
                        setError('');
                        setCurrentStep('child-link');
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
      </div>
    </div>
  );
}