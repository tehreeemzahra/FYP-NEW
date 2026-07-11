import { ArrowLeft, User, Mail, Calendar, Shield, CheckCircle, AlertCircle, Camera, Save, Users } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import avatarImage from '@/assets/6c810de1bdbd8e10d005127c0af3c4614babe691.png';
import { BugStarfieldBackground } from './BugStarfieldBackground';
import { CyberBackground } from './visual/CyberBackground';
import { api } from '@/lib/api';
import { loadUserSettings, saveUserSettings, useMusicSettings } from './audio/useMusicSettings';
import { useProfileAvatar } from './profile/useProfileAvatar';

interface ProfilePageProps {
  childData?: any;
  onBack: () => void;
}

export function ProfilePage({ childData, onBack }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'parent' | 'settings'>('info');
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { musicEnabled, setMusicEnabled } = useMusicSettings();
  const { avatarSrc, uploadAvatar } = useProfileAvatar(childData, avatarImage);
  
  // Profile Info State - Use childData if available
  const [profileData, setProfileData] = useState({
    name: childData?.name || 'Mia Carlson',
    age: childData?.age || '10',
  });

  // Parent Info State - loaded from API
  const [parentData, setParentData] = useState({
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    relationship: 'Parent',
  });

  useEffect(() => {
    if (!childData) return;
    api.getChildParent().then(setParentData).catch(() => {});
  }, [childData]);

  // Settings State
  const [settings, setSettings] = useState({
    notifications: true,
    soundEffects: true,
    musicEnabled: true,
    parentalReports: true,
  });

  useEffect(() => {
    setSettings(loadUserSettings());
  }, []);

  // Keep local settings form aligned with global music store (dashboard mute ↔ profile toggle).
  useEffect(() => {
    setSettings((s) => ({ ...s, musicEnabled }));
  }, [musicEnabled]);

  const handleProfileSave = () => {
    // Save to localStorage
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleParentSave = () => {
    // Save to localStorage
    localStorage.setItem('userParent', JSON.stringify(parentData));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSettingsSave = () => {
    saveUserSettings(settings);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleAvatarPick = () => {
    setUploadError('');
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploadingAvatar(true);
    setUploadError('');
    try {
      await uploadAvatar(file);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Could not upload photo.');
    } finally {
      setUploadingAvatar(false);
    }
  };

 

  return (
    <div className="min-h-screen w-full cq-bg-app flex flex-col overflow-x-hidden relative">
      <CyberBackground />
      <BugStarfieldBackground />
      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed cq-safe-top left-1/2 transform -translate-x-1/2 z-50 cq-feedback-success text-white px-4 sm:px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 border max-w-[calc(100vw-2rem)]"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Changes saved successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="cq-nav-bar cq-nav-bar--top px-4 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={onBack}
            className="cq-btn-icon w-10 h-10 text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="cq-title-display text-2xl sm:text-3xl">My Profile</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
          {/* Profile Header Card */}
          <div className="cq-level-card bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative shrink-0">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-blue-500/80">
                  <img
                    src={avatarSrc}
                    alt="Profile"
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  aria-hidden
                  onChange={handleAvatarChange}
                />
                <button
                  type="button"
                  aria-label="Upload profile photo"
                  disabled={uploadingAvatar}
                  onClick={handleAvatarPick}
                  className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-60"
                >
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </button>
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-white text-2xl sm:text-3xl font-bold mb-2">{profileData.name}</h2>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs sm:text-sm">
                    🎂 Age: {profileData.age}
                  </span>
                  <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs sm:text-sm">
                    🛡️ CyberQuest Hero
                  </span>
                  
                </div>
              </div>
            </div>
            {uploadError && (
              <p className="mt-4 text-red-100 text-sm flex items-center justify-center sm:justify-start gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {uploadError}
              </p>
            )}
          </div>

          {/* Tabs */}
          <div className="cq-tab-row mb-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex items-center justify-center gap-2 px-3 sm:px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'info'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Profile Info</span>
            </button>
            <button
              onClick={() => setActiveTab('parent')}
              className={`flex items-center justify-center gap-2 px-3 sm:px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'parent'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Parent Info</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center justify-center gap-2 px-3 sm:px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Settings</span>
            </button>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'info' && (
              <motion.div
                key="info"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8"
              >
                <h3 className="text-white text-xl sm:text-2xl font-bold mb-6">Personal Information</h3>
                
                <div className="space-y-6">
                  

                  {/* Name */}
                  <div>
                    <label className="block text-white/80 text-sm sm:text-base mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-blue-500/50 text-sm sm:text-base"
                        placeholder="Enter your name"
                      />
                    </div>
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-white/80 text-sm sm:text-base mb-2">Age</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={profileData.age}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 120)) {
                            setProfileData({ ...profileData, age: value });
                          }
                        }}
                        className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-blue-500/50 text-sm sm:text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="Enter your age"
                        maxLength={3}
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleProfileSave}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Changes
                  </motion.button>
                </div>
              </motion.div>
            )}

            {activeTab === 'parent' && (
              <motion.div
                key="parent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8"
              >
                <h3 className="text-white text-xl sm:text-2xl font-bold mb-6">Parent Information</h3>
                
                <div className="space-y-6">
                  {/* Parent Name */}
                  <div>
                    <label className="block text-white/80 text-sm sm:text-base mb-2">Parent/Guardian Name</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                      <input
                        type="text"
                        value={parentData.parentName}
                        onChange={(e) => setParentData({ ...parentData, parentName: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-blue-500/50 text-sm sm:text-base"
                        placeholder="Enter parent/guardian name"
                      />
                    </div>
                  </div>

                  {/* Parent Email */}
                  <div>
                    <label className="block text-white/80 text-sm sm:text-base mb-2">Parent/Guardian Email</label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                      <input
                        type="email"
                        value={parentData.parentEmail}
                        onChange={(e) => setParentData({ ...parentData, parentEmail: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-blue-500/50 text-sm sm:text-base"
                        placeholder="parent@example.com"
                      />
                    </div>
                  </div>

                  {/* Parent Phone */}
                  <div>
                    <label className="block text-white/80 text-sm sm:text-base mb-2">Parent/Guardian Phone</label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                      <input
                        type="tel"
                        value={parentData.parentPhone}
                        onChange={(e) => setParentData({ ...parentData, parentPhone: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-blue-500/50 text-sm sm:text-base"
                        placeholder="Enter parent/guardian phone number"
                      />
                    </div>
                  </div>

                  {/* Relationship */}
                  <div>
                    <label className="block text-white/80 text-sm sm:text-base mb-2">Relationship</label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                      <input
                        type="text"
                        value={parentData.relationship}
                        onChange={(e) => setParentData({ ...parentData, relationship: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-blue-500/50 text-sm sm:text-base"
                        placeholder="Enter relationship"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleParentSave}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Changes
                  </motion.button>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8"
              >
                <h3 className="text-white text-xl sm:text-2xl font-bold mb-6">Game Settings</h3>
                
                <div className="space-y-6">
                  {/* Notifications */}
                  <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                    <div>
                      <h4 className="text-white font-semibold text-sm sm:text-base">🔔 Notifications</h4>
                      <p className="text-white/70 text-xs sm:text-sm">Receive game updates and alerts</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
                      className={`w-14 h-8 rounded-full transition-all ${
                        settings.notifications ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    >
                      <motion.div
                        className="w-6 h-6 bg-white rounded-full shadow-lg"
                        animate={{ x: settings.notifications ? 28 : 4 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>

                  {/* Sound Effects */}
                  <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                    <div>
                      <h4 className="text-white font-semibold text-sm sm:text-base">🔊 Sound Effects</h4>
                      <p className="text-white/70 text-xs sm:text-sm">Play sound effects in games</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, soundEffects: !settings.soundEffects })}
                      className={`w-14 h-8 rounded-full transition-all ${
                        settings.soundEffects ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    >
                      <motion.div
                        className="w-6 h-6 bg-white rounded-full shadow-lg"
                        animate={{ x: settings.soundEffects ? 28 : 4 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>

                  {/* Music */}
                  <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                    <div>
                      <h4 className="text-white font-semibold text-sm sm:text-base">🎵 Background Music</h4>
                      <p className="text-white/70 text-xs sm:text-sm">Play background music</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMusicEnabled(!musicEnabled)}
                      className={`w-14 h-8 rounded-full transition-all ${
                        musicEnabled ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    >
                      <motion.div
                        className="w-6 h-6 bg-white rounded-full shadow-lg"
                        animate={{ x: musicEnabled ? 28 : 4 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>

                  {/* Parental Reports */}
                  <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                    <div>
                      <h4 className="text-white font-semibold text-sm sm:text-base">📊 Parental Reports</h4>
                      <p className="text-white/70 text-xs sm:text-sm">Send progress reports to parents</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, parentalReports: !settings.parentalReports })}
                      className={`w-14 h-8 rounded-full transition-all ${
                        settings.parentalReports ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    >
                      <motion.div
                        className="w-6 h-6 bg-white rounded-full shadow-lg"
                        animate={{ x: settings.parentalReports ? 28 : 4 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>

                  {/* Save Settings Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSettingsSave}
                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Settings
                  </motion.button>
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
