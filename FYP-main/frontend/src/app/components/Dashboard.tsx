import {
  House,
  Gift,
  User,
  LogOut,
  ArrowLeft,
  ChevronDown,
  Volume2,
  VolumeX,
  Play,
  Wrench,
  Target,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import avatarImage from '@/assets/6c810de1bdbd8e10d005127c0af3c4614babe691.png';
import modulePasswordCastle from '@/assets/module-password-castle.png';
import moduleScamSafari from '@/assets/module-scam-safari.png';
import moduleCyberbullyBattle from '@/assets/module-cyberbully-battle.png';
import modulePrivacyVillage from '@/assets/module-privacy-village.png';
import { PasswordCastle } from './PasswordCastle';
import { ScamSafari } from './ScamSafari';
import { PrivacyVillage } from './PrivacyVillage';
import { CyberbullyBattle } from './CyberbullyBattle';
import { RewardsPage } from './RewardsPage';
import { ProfilePage } from './ProfilePage';
import { BugStarfieldBackground } from './BugStarfieldBackground';
import { AnimatedGameCard } from './animations/AnimatedGameCard';
import { motion } from 'motion/react';
import { DashboardMainBgm } from './audio/DashboardMainBgm';
import { useMusicSettings } from './audio/useMusicSettings';
import { useProfileAvatar } from './profile/useProfileAvatar';
import { CyberBackground } from './visual/CyberBackground';
import { fadeInUp } from './visual/motionPresets';
import { loadGlobalProgress } from './moduleProgress';
import {
  encodeLastPlayed,
  inferLastPlayedModule,
  MODULE_DISPLAY_NAMES,
  parseLastPlayed,
  type LastPlayedModule,
} from './game/lastPlayed';
import { summarizeParentProgress } from './game/parentProgressSummary';
import { api } from '@/lib/api';
import { usePlatformSettings } from './usePlatformSettings';

interface DashboardProps {
  childData?: any;
  onSignOut?: () => void;
  onGoBack?: () => void;
  showBackButton?: boolean;
}

const MODULE_CARDS: {
  key: LastPlayedModule;
  image: string;
  alt: string;
  delay: number;
}[] = [
  { key: 'passwordCastle', image: modulePasswordCastle, alt: 'Password Castle', delay: 0 },
  { key: 'scamSafari', image: moduleScamSafari, alt: 'Scam Safari', delay: 0.08 },
  { key: 'cyberbullyBattle', image: moduleCyberbullyBattle, alt: 'Cyberbully Battle', delay: 0.16 },
  { key: 'privacyVillage', image: modulePrivacyVillage, alt: 'Privacy Village', delay: 0.24 },
];

export default function Dashboard({ childData, onSignOut, onGoBack, showBackButton = false }: DashboardProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPasswordCastle, setShowPasswordCastle] = useState(false);
  const [showScamSafari, setShowScamSafari] = useState(false);
  const [showPrivacyVillage, setShowPrivacyVillage] = useState(false);
  const [showCyberbullyBattle, setShowCyberbullyBattle] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { musicEnabled, toggleMusic } = useMusicSettings();
  const { avatarSrc } = useProfileAvatar(childData, avatarImage);
  const [lastPlayedModule, setLastPlayedModule] = useState<LastPlayedModule | null>(null);
  const [lastPlayedLabel, setLastPlayedLabel] = useState('');
  const [lastPlayedLevel, setLastPlayedLevel] = useState<number | null>(null);
  const { settings, isModuleEnabled } = usePlatformSettings();

  const sortedModuleCards = useMemo(() => {
    const featured = settings.featuredModule;
    return [...MODULE_CARDS].sort((a, b) => {
      if (a.key === featured) return -1;
      if (b.key === featured) return 1;
      return 0;
    });
  }, [settings.featuredModule]);

  const enabledModuleCount = useMemo(
    () => MODULE_CARDS.filter((card) => isModuleEnabled(card.key)).length,
    [isModuleEnabled],
  );

  const lastPlayedEnabled = lastPlayedModule ? isModuleEnabled(lastPlayedModule) : false;

  const applyProgress = useCallback((progress: Awaited<ReturnType<typeof loadGlobalProgress>> | null) => {
    if (!progress) return;

    const parsed = parseLastPlayed(progress.lastPlayed);
    const module = parsed.module ?? inferLastPlayedModule(progress);
    const summary = summarizeParentProgress(progress);
    const levelModule = module ?? summary.activeModule;
    const levelInfo = summary.modules.find((m) => m.key === levelModule);

    setLastPlayedModule(module);
    setLastPlayedLabel(module ? MODULE_DISPLAY_NAMES[module] : '');
    setLastPlayedLevel(levelInfo?.currentLevel ?? (module ? 1 : null));
  }, []);

  const recordLastPlayed = useCallback(async (module: LastPlayedModule) => {
    setLastPlayedModule(module);
    setLastPlayedLabel(MODULE_DISPLAY_NAMES[module]);
    try {
      const progress = await loadGlobalProgress();
      const summary = summarizeParentProgress({
        ...progress,
        lastPlayed: encodeLastPlayed(module),
      });
      const levelInfo = summary.modules.find((m) => m.key === module);
      setLastPlayedLevel(levelInfo?.currentLevel ?? 1);
      await api.saveProgress({
        ...progress,
        lastPlayed: encodeLastPlayed(module),
      });
    } catch {
      /* keep local state even if save fails */
    }
  }, []);

  const openModule = useCallback(
    (module: LastPlayedModule) => {
      if (!isModuleEnabled(module) || settings.maintenanceMode) return;
      if (module === 'passwordCastle') setShowPasswordCastle(true);
      if (module === 'scamSafari') setShowScamSafari(true);
      if (module === 'privacyVillage') setShowPrivacyVillage(true);
      if (module === 'cyberbullyBattle') setShowCyberbullyBattle(true);
      void recordLastPlayed(module);
    },
    [isModuleEnabled, recordLastPlayed, settings.maintenanceMode],
  );

  useEffect(() => {
    if (!isModuleEnabled('passwordCastle')) setShowPasswordCastle(false);
    if (!isModuleEnabled('scamSafari')) setShowScamSafari(false);
    if (!isModuleEnabled('privacyVillage')) setShowPrivacyVillage(false);
    if (!isModuleEnabled('cyberbullyBattle')) setShowCyberbullyBattle(false);
  }, [settings.modulesEnabled, isModuleEnabled]);

  // Load progress from API
  useEffect(() => {
    loadGlobalProgress().then(applyProgress);
  }, [showPasswordCastle, showScamSafari, showPrivacyVillage, showCyberbullyBattle, showRewards, applyProgress]);

  if (showPasswordCastle && isModuleEnabled('passwordCastle') && !settings.maintenanceMode) {
    return <PasswordCastle onClose={() => setShowPasswordCastle(false)} />;
  }

  if (showScamSafari && isModuleEnabled('scamSafari') && !settings.maintenanceMode) {
    return <ScamSafari onClose={() => setShowScamSafari(false)} />;
  }

  if (showPrivacyVillage && isModuleEnabled('privacyVillage') && !settings.maintenanceMode) {
    return <PrivacyVillage onClose={() => setShowPrivacyVillage(false)} />;
  }

  if (showCyberbullyBattle && isModuleEnabled('cyberbullyBattle') && !settings.maintenanceMode) {
    return <CyberbullyBattle onClose={() => setShowCyberbullyBattle(false)} />;
  }

  if (showRewards) {
    return (
      <>
        <DashboardMainBgm />
        <RewardsPage onBack={() => setShowRewards(false)} />
      </>
    );
  }

  if (showProfile) {
    return (
      <>
        <DashboardMainBgm />
        <ProfilePage childData={childData} onBack={() => setShowProfile(false)} />
      </>
    );
  }

  const childName = (childData?.name || 'Explorer').toString().trim().split(/\s+/)[0] || 'Explorer';
  const challengeModule =
    (lastPlayedModule && lastPlayedEnabled ? lastPlayedModule : null) ||
    (isModuleEnabled(settings.featuredModule) ? settings.featuredModule : null) ||
    sortedModuleCards.find((c) => isModuleEnabled(c.key))?.key ||
    null;
  const challengeLabel = challengeModule ? MODULE_DISPLAY_NAMES[challengeModule] : 'a mission';
  const challengeEnabled = Boolean(challengeModule && isModuleEnabled(challengeModule) && !settings.maintenanceMode);

  return (
    <>
      <DashboardMainBgm />
    <div className="min-h-screen w-full cq-bg-app flex flex-col overflow-x-hidden relative">
      <CyberBackground />
      <BugStarfieldBackground />
      {/* Main Content */}
      <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden pb-[calc(4.25rem+env(safe-area-inset-bottom,0px))] sm:pb-20">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col min-h-[calc(100dvh-4.25rem-env(safe-area-inset-bottom,0px))] sm:min-h-[calc(100dvh-5rem)]">
          {/* Top stack: more breathing room between header blocks */}
          <div className="space-y-4 sm:space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0 space-y-1.5">
                <motion.h1
                  className="cq-title-display text-2xl sm:text-3xl md:text-4xl"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                >
                  Dashboard
                </motion.h1>
                <motion.p
                  className="text-sm sm:text-base text-white/80"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                >
                  <span aria-hidden>👋</span> Welcome back, <span className="font-semibold text-white">{childName}</span>!
                </motion.p>
              </div>

              <div className="flex items-start gap-2 sm:gap-3">
                <motion.button
                  type="button"
                  title={musicEnabled ? 'Mute music' : 'Unmute music'}
                  aria-label={musicEnabled ? 'Mute music' : 'Unmute music'}
                  onClick={toggleMusic}
                  className="cq-btn-icon w-10 h-10 text-white"
                  whileTap={{ scale: 0.92 }}
                >
                  {musicEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                </motion.button>

              {/* Profile Menu */}
              <div className="relative">
                <motion.button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 cq-panel rounded-full p-1.5 pr-3 hover:cq-panel-glow transition-shadow"
                  whileTap={{ scale: 0.96 }}
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ring-cyan-400/40 shrink-0">
                    <img
                      src={avatarSrc}
                      alt="Profile"
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <ChevronDown className="w-4 h-4 text-white" />
                </motion.button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10"
                      onClick={() => setShowProfileMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute right-0 mt-2 w-48 cq-panel rounded-xl overflow-hidden z-20 border-white/20"
                    >
                      {showBackButton && onGoBack && (
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onGoBack();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-white/90"
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
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/20 transition-colors text-red-300"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm">Sign Out</span>
                        </button>
                      )}
                    </motion.div>
                  </>
                )}
              </div>
              </div>
            </div>

            {/* Last Played — display only (Daily Challenge is the CTA) */}
            <motion.div {...fadeInUp}>
              <div
                className="cq-chip inline-flex items-center gap-2 text-sm font-medium text-cyan-100/90 pointer-events-none select-none max-w-full"
                aria-label={
                  lastPlayedLabel
                    ? `Last played: ${lastPlayedLabel}${lastPlayedLevel ? `, Level ${lastPlayedLevel}` : ''}`
                    : 'Last played: No module yet'
                }
              >
                <Play className="w-3.5 h-3.5 shrink-0 opacity-80" />
                <span className="truncate">
                  Last Played:{' '}
                  <strong className="text-white">
                    {lastPlayedLabel
                      ? `${lastPlayedEnabled ? lastPlayedLabel : `${lastPlayedLabel} (paused)`}${
                          lastPlayedLevel ? ` • Level ${lastPlayedLevel}` : ''
                        }`
                      : 'No module yet'}
                  </strong>
                </span>
              </div>
            </motion.div>

            {settings.maintenanceMode && (
              <motion.div
                {...fadeInUp}
                className="rounded-2xl border border-amber-400/40 bg-amber-500/15 px-4 py-3.5 flex items-start gap-3"
              >
                <Wrench className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-100">Maintenance break</p>
                  <p className="text-xs text-amber-100/80 mt-1 leading-relaxed">
                    Missions are temporarily paused while the admin updates CyberQuest. Check back soon!
                  </p>
                </div>
              </motion.div>
            )}

            {/* Daily Challenge — primary resume CTA */}
            <motion.button
              type="button"
              {...fadeInUp}
              onClick={() => challengeModule && challengeEnabled && openModule(challengeModule)}
              disabled={!challengeEnabled}
              whileTap={challengeEnabled ? { scale: 0.98 } : undefined}
              className="w-full text-left rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-500/15 via-indigo-500/10 to-violet-500/15 px-4 py-4 sm:px-5 sm:py-4.5 hover:border-cyan-300/50 transition-colors disabled:opacity-55 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-400/20 border border-amber-300/35 flex items-center justify-center shrink-0">
                  <Target className="w-5 h-5 text-amber-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span aria-hidden>🎯</span> Daily Challenge
                  </p>
                  <p className="text-xs sm:text-sm text-white/70 mt-0.5 leading-snug truncate">
                    Jump back into <span className="text-cyan-200 font-semibold">{challengeLabel}</span>
                  </p>
                </div>
                <Sparkles className="w-4 h-4 text-cyan-300/80 shrink-0" />
              </div>
            </motion.button>

            {/* Learning Modules — same stack spacing as sections above the CTA */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-cyan-300 shrink-0" />
                <h2 className="text-base sm:text-lg font-bold text-white">Learning Modules</h2>
              </div>
              <p className="text-xs sm:text-sm text-white/60 pl-6 mb-4 sm:mb-5">
                Choose your adventure — continue your cybersecurity journey!
              </p>

              <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-5 sm:gap-6 md:gap-7 lg:gap-8 items-stretch">
                {sortedModuleCards.map((card) => {
                  const enabled = isModuleEnabled(card.key) && !settings.maintenanceMode;
                  return (
                    <div key={card.key} className="min-w-0 w-full aspect-square">
                      <AnimatedGameCard
                        image={card.image}
                        alt={card.alt}
                        onClick={() => openModule(card.key)}
                        moduleArt
                        delay={card.delay}
                        disabled={!enabled}
                        featured={settings.featuredModule === card.key && enabled}
                      />
                    </div>
                  );
                })}
              </div>

              {enabledModuleCount === 0 && (
                <div className="cq-panel rounded-2xl p-6 text-center mt-4">
                  <p className="text-sm font-semibold text-white mb-1">No missions available right now</p>
                  <p className="text-xs text-white/65 leading-relaxed">
                    The admin has paused all learning modules. Ask your parent to check back later.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Small gap above nav only */}
          <div className="h-2 sm:h-3 shrink-0 mt-auto" aria-hidden />
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-20 cq-nav-bar">
        <div className="max-w-4xl mx-auto flex items-center justify-around py-2 sm:py-4 px-2 sm:px-4">
          <motion.button
            className="flex flex-col items-center gap-1 sm:gap-2 cq-nav-item-active min-w-[64px] sm:min-w-[80px] min-h-[56px] justify-center"
            whileTap={{ scale: 0.92 }}
          >
            <House className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
            <span className="text-xs sm:text-sm font-semibold">Home</span>
          </motion.button>
          <motion.button
            onClick={() => setShowRewards(true)}
            className="flex flex-col items-center gap-1 sm:gap-2 text-white/55 hover:text-cyan-300 min-w-[64px] sm:min-w-[80px] min-h-[56px] justify-center transition-colors"
            whileTap={{ scale: 0.92 }}
          >
            <Gift className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
            <span className="text-xs sm:text-sm">Rewards</span>
          </motion.button>
          <motion.button
            onClick={() => setShowProfile(true)}
            className="flex flex-col items-center gap-1 sm:gap-2 text-white/55 hover:text-cyan-300 min-w-[64px] sm:min-w-[80px] min-h-[56px] justify-center transition-colors"
            whileTap={{ scale: 0.92 }}
          >
            <User className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
            <span className="text-xs sm:text-sm">Profile</span>
          </motion.button>
        </div>
      </div>
    </div>
    </>
  );
}
