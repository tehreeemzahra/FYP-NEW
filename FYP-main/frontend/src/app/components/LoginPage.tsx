import { Mail, Lock, Key } from 'lucide-react';
import { useState } from 'react';
import boyIllustration from '@/assets/6c810de1bdbd8e10d005127c0af3c4614babe691.png';

interface LoginPageProps {
  onSwitchToRegister: () => void;
  onLogin: (role: 'child' | 'parent' | 'admin', data: any) => void;
}

export function LoginPage({ onSwitchToRegister, onLogin }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<'child' | 'parent' | 'admin'>('child');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [parentId, setParentId] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!loginId || !password) {
      setError('Please enter both Login ID and Password');
      return;
    }

    if (selectedRole === 'child') {
      // For child login, check if account exists
      const childAccount = localStorage.getItem(`child_${loginId}`);
      
      if (!childAccount) {
        setError('Invalid Login ID or Password');
        return;
      }

      const child = JSON.parse(childAccount);

      // Verify password
      if (child.password !== password) {
        setError('Invalid Login ID or Password');
        return;
      }

      // Check if child is already linked
      if (child.parentId) {
        // Already linked, proceed to dashboard
        setError('');
        onLogin('child', child);
        return;
      }

      // Not linked, need Parent ID
      if (!parentId) {
        setError('Please enter Parent ID to link your account');
        return;
      }

      // Verify Parent ID
      const parentAccount = localStorage.getItem(`parent_${parentId}`);
      if (!parentAccount) {
        setError('Invalid Parent ID. Please check with your parent.');
        return;
      }

      // Link child to parent
      child.parentId = parentId;
      child.linkedAt = new Date().toISOString();
      localStorage.setItem(`child_${loginId}`, JSON.stringify(child));

      // Update parent's children list
      const parent = JSON.parse(parentAccount);
      parent.children = parent.children || [];
      parent.children.push(child);
      localStorage.setItem(`parent_${parentId}`, JSON.stringify(parent));

      setError('');
      onLogin('child', child);
      return;
    }

    if (selectedRole === 'parent') {
      // For parent login
      const parentAccount = localStorage.getItem(`parent_${loginId}`);
      
      if (!parentAccount) {
        setError('Invalid Login ID or Password');
        return;
      }

      const parent = JSON.parse(parentAccount);

      if (parent.password !== password) {
        setError('Invalid Login ID or Password');
        return;
      }

      setError('');
      onLogin('parent', parent);
      return;
    }

    // Admin login (simple check)
    if (selectedRole === 'admin') {
      if (loginId === 'admin' && password === 'admin123') {
        onLogin('admin', { username: 'admin' });
      } else {
        setError('Invalid admin credentials');
      }
      return;
    }
  };

  return (
    <div className="w-full max-w-[340px] sm:max-w-[380px] md:max-w-[420px] lg:max-w-[460px] bg-[#6ca9d8] rounded-[24px] sm:rounded-[28px] md:rounded-[32px] shadow-lg relative overflow-hidden">
      {/* Cartoon Boy Illustration with integrated background */}
      <div className="w-full">
        <img 
          src={boyIllustration} 
          alt="Cartoon boy" 
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Form Content */}
      <div className="px-6 sm:px-8 md:px-10 pb-6 sm:pb-8 md:pb-10">
        {/* Login Title */}
        <h1 className="text-white text-center mb-6 sm:mb-7 md:mb-8 tracking-wide">
          Login
        </h1>

        {/* Role Selection */}
        <div className="mb-4 sm:mb-5">
          <p className="text-white/90 text-xs sm:text-sm mb-2">I am logging in as:</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedRole('child')}
              className={`py-2.5 sm:py-3 rounded-[10px] sm:rounded-[12px] text-xs sm:text-sm transition-all ${
                selectedRole === 'child'
                  ? 'bg-[#f37835] text-white shadow-md'
                  : 'bg-[#d4e8f7] text-[#4a7ba3] hover:bg-[#c0daf0]'
              }`}
            >
              Child
            </button>
            <button
              onClick={() => setSelectedRole('parent')}
              className={`py-2.5 sm:py-3 rounded-[10px] sm:rounded-[12px] text-xs sm:text-sm transition-all ${
                selectedRole === 'parent'
                  ? 'bg-[#f37835] text-white shadow-md'
                  : 'bg-[#d4e8f7] text-[#4a7ba3] hover:bg-[#c0daf0]'
              }`}
            >
              Parent
            </button>
            <button
              onClick={() => setSelectedRole('admin')}
              className={`py-2.5 sm:py-3 rounded-[10px] sm:rounded-[12px] text-xs sm:text-sm transition-all ${
                selectedRole === 'admin'
                  ? 'bg-[#f37835] text-white shadow-md'
                  : 'bg-[#d4e8f7] text-[#4a7ba3] hover:bg-[#c0daf0]'
              }`}
            >
              Admin
            </button>
          </div>
        </div>

        {/* Login ID Input */}
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center bg-[#d4e8f7] rounded-[12px] sm:rounded-[14px] md:rounded-[16px] px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 gap-3 sm:gap-4">
            <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-[#4a7ba3] flex-shrink-0" strokeWidth={2} />
            <input
              type="text"
              placeholder="Login ID"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[#4a7ba3] placeholder:text-[#4a7ba3]/60 text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center bg-[#d4e8f7] rounded-[12px] sm:rounded-[14px] md:rounded-[16px] px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 gap-3 sm:gap-4">
            <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-[#4a7ba3] flex-shrink-0" strokeWidth={2} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[#4a7ba3] placeholder:text-[#4a7ba3]/60 text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Parent ID Input - Only for Child (if not linked) */}
        {selectedRole === 'child' && (
          <div className="mb-3 sm:mb-4">
            <div className="flex items-center bg-[#d4e8f7] rounded-[12px] sm:rounded-[14px] md:rounded-[16px] px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 gap-3 sm:gap-4">
              <Key className="w-5 h-5 sm:w-6 sm:h-6 text-[#4a7ba3] flex-shrink-0" strokeWidth={2} />
              <input
                type="text"
                placeholder="Parent ID (optional if already linked)"
                value={parentId}
                onChange={(e) => setParentId(e.target.value.toUpperCase())}
                className="flex-1 bg-transparent border-none outline-none text-[#4a7ba3] placeholder:text-[#4a7ba3]/60 text-sm sm:text-base font-mono uppercase"
                maxLength={10}
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-3 sm:mb-4 bg-red-500/20 border-2 border-red-400 rounded-[12px] px-4 py-3">
            <p className="text-red-100 text-xs sm:text-sm text-center">{error}</p>
          </div>
        )}

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="w-full bg-[#f37835] hover:bg-[#e86925] text-white rounded-[12px] sm:rounded-[14px] md:rounded-[16px] py-3 sm:py-3.5 md:py-4 mb-4 sm:mb-5 transition-colors shadow-md text-sm sm:text-base md:text-lg"
        >
          Login
        </button>

        {/* Register Link */}
        <p className="text-center text-white/90 text-xs sm:text-sm md:text-base">
          Don't have an account?{' '}
          <button 
            onClick={onSwitchToRegister}
            className="underline hover:text-white transition-colors cursor-pointer"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}