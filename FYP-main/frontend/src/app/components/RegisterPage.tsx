import { User, Hash, Lock, Key, Mail } from 'lucide-react';
import { useState } from 'react';
import boyIllustration from '@/assets/6c810de1bdbd8e10d005127c0af3c4614babe691.png';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
  onRegister: (role: 'child' | 'parent' | 'admin', data: any) => void;
}

export function RegisterPage({ onSwitchToLogin, onRegister }: RegisterPageProps) {
  const [selectedRole, setSelectedRole] = useState<'child' | 'parent' | 'admin'>('child');
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [parentId, setParentId] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = () => {
    // Validation
    if (!username || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (selectedRole === 'parent') {
      if (!email) {
        setError('Email is required for parent accounts');
        return;
      }

      // Generate Parent ID
      const generatedParentId = 'CQ' + Math.random().toString(36).substr(2, 8).toUpperCase();
      const parentAccount = {
        id: generatedParentId,
        name: username,
        email: email,
        password: password,
        children: [],
        createdAt: new Date().toISOString(),
      };
      
      // Save to localStorage
      localStorage.setItem(`parent_${generatedParentId}`, JSON.stringify(parentAccount));
      
      // Pass parent data to show Parent ID
      onRegister('parent', parentAccount);
      return;
    } 
    
    if (selectedRole === 'child') {
      if (!age) {
        setError('Age is required for child accounts');
        return;
      }

      if (!parentId || !parentEmail) {
        setError('Parent ID and Parent Email are required to link your account');
        return;
      }

      // Verify Parent ID exists
      const parentAccount = localStorage.getItem(`parent_${parentId}`);
      
      if (!parentAccount) {
        setError('Invalid Parent ID. Please check with your parent.');
        return;
      }

      const parent = JSON.parse(parentAccount);

      // Verify Parent Email matches
      if (parent.email.toLowerCase() !== parentEmail.toLowerCase()) {
        setError('Parent Email does not match. Please check with your parent.');
        return;
      }

      // Create child account
      const childId = 'CH' + Math.random().toString(36).substr(2, 8).toUpperCase();
      const childAccount = {
        id: childId,
        name: username,
        age: age,
        password: password,
        parentId: parentId,
        createdAt: new Date().toISOString(),
      };
      
      // Save child account
      localStorage.setItem(`child_${childId}`, JSON.stringify(childAccount));

      // Update parent's children list
      parent.children = parent.children || [];
      parent.children.push(childAccount);
      localStorage.setItem(`parent_${parentId}`, JSON.stringify(parent));
      
      setError('');
      onRegister('child', childAccount);
      return;
    }

    // Admin registration
    onRegister(selectedRole, { username, password });
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
        {/* Register Title */}
        <h1 className="text-white text-center mb-6 sm:mb-7 md:mb-8 tracking-wide">
          Register
        </h1>

        {/* Role Selection */}
        <div className="mb-4 sm:mb-5">
          <p className="text-white/90 text-xs sm:text-sm mb-2">I am registering as:</p>
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

        {/* Username Input */}
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center bg-[#d4e8f7] rounded-[12px] sm:rounded-[14px] md:rounded-[16px] px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 gap-3 sm:gap-4">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#4a7ba3] flex-shrink-0" strokeWidth={2} />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[#4a7ba3] placeholder:text-[#4a7ba3]/60 text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Age Input - Only for Child */}
        {selectedRole === 'child' && (
          <div className="mb-3 sm:mb-4">
            <div className="flex items-center bg-[#d4e8f7] rounded-[12px] sm:rounded-[14px] md:rounded-[16px] px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 gap-3 sm:gap-4">
              <Hash className="w-5 h-5 sm:w-6 sm:h-6 text-[#4a7ba3] flex-shrink-0" strokeWidth={2} />
              <input
                type="text"
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-[#4a7ba3] placeholder:text-[#4a7ba3]/60 text-sm sm:text-base"
              />
            </div>
          </div>
        )}

        {/* Email Input - Only for Parent and Admin */}
        {(selectedRole === 'parent' || selectedRole === 'admin') && (
          <div className="mb-3 sm:mb-4">
            <div className="flex items-center bg-[#d4e8f7] rounded-[12px] sm:rounded-[14px] md:rounded-[16px] px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 gap-3 sm:gap-4">
              <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-[#4a7ba3] flex-shrink-0" strokeWidth={2} />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-[#4a7ba3] placeholder:text-[#4a7ba3]/60 text-sm sm:text-base"
              />
            </div>
          </div>
        )}

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

        {/* Parent ID Input - Only for Child */}
        {selectedRole === 'child' && (
          <div className="mb-3 sm:mb-4">
            <div className="flex items-center bg-[#d4e8f7] rounded-[12px] sm:rounded-[14px] md:rounded-[16px] px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 gap-3 sm:gap-4">
              <Key className="w-5 h-5 sm:w-6 sm:h-6 text-[#4a7ba3] flex-shrink-0" strokeWidth={2} />
              <input
                type="text"
                placeholder="Parent ID (e.g., CQ12ABC34D)"
                value={parentId}
                onChange={(e) => setParentId(e.target.value.toUpperCase())}
                className="flex-1 bg-transparent border-none outline-none text-[#4a7ba3] placeholder:text-[#4a7ba3]/60 text-sm sm:text-base font-mono uppercase"
                maxLength={10}
              />
            </div>
          </div>
        )}

        {/* Parent Email Input - Only for Child */}
        {selectedRole === 'child' && (
          <div className="mb-3 sm:mb-4">
            <div className="flex items-center bg-[#d4e8f7] rounded-[12px] sm:rounded-[14px] md:rounded-[16px] px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 gap-3 sm:gap-4">
              <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-[#4a7ba3] flex-shrink-0" strokeWidth={2} />
              <input
                type="email"
                placeholder="Parent Email"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-[#4a7ba3] placeholder:text-[#4a7ba3]/60 text-sm sm:text-base"
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

        {/* Sign Up Button */}
        <button 
          onClick={handleSignUp}
          className="w-full bg-[#f37835] hover:bg-[#e86925] text-white rounded-[12px] sm:rounded-[14px] md:rounded-[16px] py-3 sm:py-3.5 md:py-4 mb-4 sm:mb-5 transition-colors shadow-md text-sm sm:text-base md:text-lg"
        >
          Sign Up
        </button>

        {/* Login Link */}
        <p className="text-center text-white/90 text-xs sm:text-sm md:text-base">
          Already have an account?{' '}
          <button 
            onClick={onSwitchToLogin}
            className="underline hover:text-white transition-colors cursor-pointer"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}