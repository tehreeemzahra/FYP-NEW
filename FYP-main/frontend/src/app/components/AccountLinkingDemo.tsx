import { useState } from 'react';
import { AccountLinking } from './AccountLinking';
import { Shield, Users, Link2, CheckCircle } from 'lucide-react';

interface AccountLinkingDemoProps {
  onComplete?: (accountType: 'parent' | 'child', data: any) => void;
}

export function AccountLinkingDemo({ onComplete }: AccountLinkingDemoProps) {
  const [showFlow, setShowFlow] = useState(false);
  const [completedAccount, setCompletedAccount] = useState<any>(null);

  const handleComplete = (accountType: 'parent' | 'child', data: any) => {
    setCompletedAccount({ accountType, data });
    setShowFlow(false);
    
    // Call parent onComplete callback if provided
    if (onComplete) {
      onComplete(accountType, data);
    }
  };

  if (showFlow) {
    return (
      <AccountLinking
        onComplete={handleComplete}
        onBack={() => setShowFlow(false)}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#1e3a5f] via-[#2d5a8a] to-[#1e3a5f] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Demo Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Parent-Child Account Linking
          </h1>
          <p className="text-white/80 text-lg sm:text-xl">
            Secure & Simple Account Connection System
          </p>
        </div>

        {/* Completed Account Display */}
        {completedAccount && (
          <div className="bg-green-500/20 border-2 border-green-500 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-bold text-white">
                {completedAccount.accountType === 'parent' ? 'Parent Account Created!' : 'Child Account Linked!'}
              </h3>
            </div>
            <div className="text-white/80 space-y-2">
              {completedAccount.accountType === 'parent' ? (
                <>
                  <p><strong>Name:</strong> {completedAccount.data.name}</p>
                  <p><strong>Email:</strong> {completedAccount.data.email}</p>
                  <p className="text-yellow-400"><strong>Parent ID:</strong> {completedAccount.data.parentId}</p>
                </>
              ) : (
                <>
                  <p><strong>Child Name:</strong> {completedAccount.data.name}</p>
                  <p><strong>Age:</strong> {completedAccount.data.age}</p>
                  <p><strong>Linked to Parent ID:</strong> {completedAccount.data.parentId}</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* UX Flow Overview */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">How It Works</h2>
          
          <div className="space-y-6">
            {/* Parent Flow */}
            <div className="bg-blue-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Parent Flow</h3>
              </div>
              <ol className="space-y-2 text-white/80 text-sm pl-13">
                <li>1. Select "Parent Account"</li>
                <li>2. Enter name, email, and password</li>
                <li>3. System generates unique Parent ID (e.g., CQ12ABC34D)</li>
                <li>4. Share Parent ID with child</li>
              </ol>
            </div>

            {/* Child Flow */}
            <div className="bg-green-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Child Flow</h3>
              </div>
              <ol className="space-y-2 text-white/80 text-sm pl-13">
                <li>1. Select "Child Account"</li>
                <li>2. Enter name and age</li>
                <li>3. Enter Parent ID and Parent Email for verification</li>
                <li>4. System verifies both credentials match</li>
                <li>5. Account successfully linked! 🎉</li>
              </ol>
            </div>

            {/* Security Features */}
            <div className="bg-purple-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <Link2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Security Features</h3>
              </div>
              <ul className="space-y-2 text-white/80 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>Unique Parent ID prevents unauthorized linking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>Double verification: Parent ID + Parent Email</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>Clear error messages for failed attempts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>Only matching credentials allow connection</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => setShowFlow(true)}
          className="w-full px-8 py-6 rounded-2xl bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold text-xl shadow-2xl hover:shadow-3xl transition-all"
        >
          Start Demo Flow →
        </button>

        {/* Feature List */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-3xl mb-2">🎨</div>
            <p className="text-white/80 text-sm">Child-Friendly UI</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-3xl mb-2">🔒</div>
            <p className="text-white/80 text-sm">Secure Linking</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-3xl mb-2">⚡</div>
            <p className="text-white/80 text-sm">Fast & Simple</p>
          </div>
        </div>
      </div>
    </div>
  );
}