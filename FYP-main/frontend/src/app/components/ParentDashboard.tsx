import { LayoutDashboard, TrendingUp, Bell, FileText, Settings, Edit, Award, CheckCircle, Sparkles, Menu, X, LogOut, ArrowLeft, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import referenceImage from '@/assets/a1d8d303765b6e2b64cfddb6cc0f075bfd46bf0d.png';
import { loadProgress } from './RewardsPage';

interface ParentDashboardProps {
  parentData?: any;
  onNavigateToChild?: () => void;
  onSignOut?: () => void;
  onGoBack?: () => void;
  showBackButton?: boolean;
}

export function ParentDashboard({ parentData, onNavigateToChild, onSignOut, onGoBack, showBackButton = false }: ParentDashboardProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [linkedChildren, setLinkedChildren] = useState<any[]>([]);
  const [childProgress, setChildProgress] = useState({
    completedLevels: 0,
    currentLevel: 1,
    currentModule: 'Password Castle',
    totalScore: 0,
    accuracy: 0,
  });

  // Load parent's linked children from localStorage
  useEffect(() => {
    if (parentData && parentData.id) {
      // Reload parent data from localStorage to get updated children list
      const storedParent = localStorage.getItem(`parent_${parentData.id}`);
      if (storedParent) {
        const parent = JSON.parse(storedParent);
        setLinkedChildren(parent.children || []);
        
        // Load first child's progress if available
        if (parent.children && parent.children.length > 0) {
          const firstChild = parent.children[0];
          const progress = loadProgress();
          if (progress) {
            const completedCount = progress.completedLevels?.length || 0;
            const totalScore = completedCount * 100;
            const accuracy = completedCount > 0 ? 85 : 0;

            setChildProgress({
              completedLevels: completedCount,
              currentLevel: completedCount < 5 ? completedCount + 1 : 5,
              currentModule: 'Password Castle',
              totalScore,
              accuracy,
            });
          }
        }
      }
    }
  }, [parentData]);

  return (
    <div className="min-h-screen w-full flex bg-gray-50">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar Navigation */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gradient-to-b from-[#2d5a8a] to-[#1e3a5f] text-white flex flex-col flex-shrink-0
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Close button for mobile */}
        <button 
          className="lg:hidden absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
          onClick={() => setIsSidebarOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo and App Name */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-[#2d5a8a] text-lg">🛡️</span>
          </div>
          <span className="text-xl">CyberQuest</span>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 pt-8">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 text-white mb-2 hover:bg-white/20 transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 mb-2 hover:bg-white/10 transition-colors">
            <TrendingUp className="w-5 h-5" />
            <span>Insights</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 mb-2 hover:bg-white/10 transition-colors">
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 mb-2 hover:bg-white/10 transition-colors">
            <FileText className="w-5 h-5" />
            <span>Reports</span>
          </button>
        </nav>

        {/* Recent Notifications - Sidebar Panel */}
        <div className="px-4 pb-6">
          <div className="bg-white/10 rounded-xl p-4">
            <h3 className="text-sm mb-4">Recent Notifications</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/90 leading-tight">Mia earned a new badge: Password Pro</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/90 leading-tight">Session completed Privacy Village</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/90 leading-tight">AI recommended a new mission: Spam Safari</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger Menu for Mobile */}
            <button 
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl lg:text-2xl text-gray-800">Parent Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">👤</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-20 border border-gray-200">
                    {showBackButton && onGoBack && (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onGoBack();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors text-gray-700"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">Go Back</span>
                      </button>
                    )}
                    {onSignOut && (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onSignOut();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Sign Out</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {/* View Child Dashboard Button */}
          {onNavigateToChild && (
            <div className="max-w-7xl mx-auto mb-4">
              <button
                onClick={onNavigateToChild}
                className="text-sm text-gray-600 hover:text-gray-800 underline transition-colors"
              >
                ← View Child Dashboard
              </button>
            </div>
          )}
          
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Left Column - Performance & Notifications */}
            <div className="lg:col-span-2 space-y-4 lg:space-y-6">
              {/* Child Performance Summary Card */}
              <div className="bg-white rounded-2xl shadow-sm p-4 lg:p-6">
                <div className="flex items-start gap-3 lg:gap-4 mb-4 lg:mb-6">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl lg:text-2xl">👧</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg lg:text-xl text-gray-800 mb-1">Mia's Performance Summary</h2>
                    <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-500">
                      <span>Your age</span>
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <Edit className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
                  {/* Level Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                        <LayoutDashboard className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm text-gray-600">Level</span>
                    </div>
                    <p className="text-2xl lg:text-3xl text-gray-800">{childProgress.currentLevel}</p>
                  </div>

                  {/* Accuracy Card */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm text-gray-600">Accuracy</span>
                    </div>
                    <p className="text-2xl lg:text-3xl text-gray-800">{childProgress.accuracy}%</p>
                  </div>

                  {/* Total Score Card */}
                  <div className="bg-gradient-to-br from-orange-50 to-pink-100 rounded-xl p-4 border border-orange-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm text-gray-600">Total Score</span>
                    </div>
                    <p className="text-2xl lg:text-3xl text-gray-800">{childProgress.totalScore}</p>
                  </div>
                </div>
              </div>

              {/* Recent Notifications Panel */}
              <div className="bg-white rounded-2xl shadow-sm p-4 lg:p-6">
                <h2 className="text-lg lg:text-xl text-gray-800 mb-4">Recent Notifications</h2>
                <div className="space-y-3 lg:space-y-4">
                  <div className="flex items-start gap-3 lg:gap-4 pb-3 lg:pb-4 border-b border-gray-100">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 mb-1 text-sm lg:text-base">Mia earned a new badge:</p>
                      <p className="text-gray-500 text-xs lg:text-sm">Password Pro</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 lg:gap-4 pb-3 lg:pb-4 border-b border-gray-100">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 mb-1 text-sm lg:text-base">Session completed</p>
                      <p className="text-gray-500 text-xs lg:text-sm">Privacy Village</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 lg:gap-4">
                    <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 mb-1 text-sm lg:text-base">AI recommended a new mission:</p>
                      <p className="text-gray-500 text-xs lg:text-sm">Spam Safari</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Linked Children */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-4 lg:p-6 lg:sticky lg:top-6">
                <h2 className="text-lg lg:text-xl text-gray-800 mb-4 lg:mb-6">Linked Children</h2>
                <div className="space-y-3 lg:space-y-4 mb-4 lg:mb-6">
                  {linkedChildren.length > 0 ? (
                    linkedChildren.map((child, index) => (
                      <div key={child.id} className={`flex flex-col gap-2 p-3 rounded-xl ${index === 0 ? 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200' : 'hover:bg-gray-50'} transition-colors cursor-pointer`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 ${index === 0 ? 'bg-gradient-to-br from-orange-400 to-pink-500' : index === 1 ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-purple-400 to-purple-600'} rounded-full flex items-center justify-center flex-shrink-0`}>
                            <span className="text-white text-lg">{index % 2 === 0 ? '👧' : '👦'}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-800 text-sm lg:text-base font-semibold">{child.name}</p>
                            <p className="text-xs lg:text-sm text-gray-600">
                              {index === 0 ? `${childProgress.currentModule} - Level ${childProgress.currentLevel}` : 'Getting Started'}
                            </p>
                          </div>
                        </div>
                        {index === 0 && (
                          <div className="ml-0">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-500">Progress</span>
                              <span className="text-xs text-gray-700 font-semibold">{childProgress.completedLevels}/5 levels</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500"
                                style={{ width: `${(childProgress.completedLevels / 5) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">No children linked yet</p>
                      <p className="text-gray-400 text-xs mt-2">Share your Parent ID with your child to get started!</p>
                    </div>
                  )}
                </div>

                {/* Generate Report Button */}
                <button className="w-full bg-gradient-to-r from-[#2d5a8a] to-[#1e3a5f] text-white py-3 lg:py-4 rounded-xl hover:shadow-lg transition-all text-sm lg:text-base">
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}