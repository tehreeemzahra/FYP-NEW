import { motion } from 'motion/react';
import { ArrowLeft, Lock, Shield, Sparkles, Star, Trophy } from 'lucide-react';
import { BugStarfieldBackground } from './BugStarfieldBackground';
import { CyberBackground } from './visual/CyberBackground';
import { AnimatedProgressBar } from './visual/AnimatedProgressBar';
import { PASSWORD_REWARDS } from './game/modules/passwordCastle/PasswordCastleLevels';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';

interface RewardsPageProps {
  onBack: () => void;
}

interface GameProgress {
  completedLevels: number[];
  lastPlayed: string;
  inventory?: string[];
  totalScore?: number;
  modules?: {
    scamSafari?: { completedLevels?: number[]; version?: number };
    cyberbullyBattle?: { completedLevels?: number[]; version?: number };
    privacyVillage?: { completedLevels?: number[]; version?: number };
  };
}

type ModuleId = 'cyberbully' | 'scam' | 'privacy' | 'password';

export function RewardsPage({ onBack }: RewardsPageProps) {
  const [progress, setProgress] = useState<GameProgress | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleId>('cyberbully');

  useEffect(() => {
    loadProgress().then((p) => setProgress(p));
  }, []);

  const inventorySet = useMemo(() => new Set(progress?.inventory || []), [progress?.inventory]);

  const moduleConfig: Record<
    ModuleId,
    {
      label: string;
      color: string;
      rewards: string[];
      completedLevels: number[];
    }
  > = {
    cyberbully: {
      label: 'Cyberbullying',
      color: 'from-pink-500 to-rose-600',
      rewards: ['Harassment Shield', 'Identity Protector', 'Truth Defender', 'Privacy Guardian', 'Safety Tracker', 'Troll Tamer Crown'],
      completedLevels: progress?.modules?.cyberbullyBattle?.version === 2 ? progress?.modules?.cyberbullyBattle?.completedLevels || [] : [],
    },
    scam: {
      label: 'Scam Awareness',
      color: 'from-orange-500 to-red-600',
      rewards: ['Jungle Alert Badge', 'Name Trick Defender', 'Authority Check Medal', 'Text Shield Charm', 'Call Guard Lantern', 'Scam Safari Master Crown'],
      completedLevels: progress?.modules?.scamSafari?.version === 2 ? progress?.modules?.scamSafari?.completedLevels || [] : [],
    },
    privacy: {
      label: 'Privacy Village',
      color: 'from-cyan-500 to-indigo-600',
      rewards: ['Data Defender', 'Tracker Blocker', 'Identity Shield', 'Password Guardian', 'Safe Sharer Medal', 'Secure WiFi Crown'],
      completedLevels: progress?.modules?.privacyVillage?.version === 2 ? progress?.modules?.privacyVillage?.completedLevels || [] : [],
    },
    password: {
      label: 'Password Castle',
      color: 'from-blue-500 to-purple-600',
      rewards: [...PASSWORD_REWARDS],
      completedLevels: progress?.completedLevels || [],
    },
  };

  const moduleShortLabel: Record<ModuleId, string> = {
    cyberbully: 'Cyber',
    scam: 'Scams',
    privacy: 'Privacy',
    password: 'Password',
  };

  const active = moduleConfig[activeModule];

  const totalUnlocked = Object.values(moduleConfig).reduce((sum, m) => {
    const unlocked = m.rewards.filter((name, idx) => inventorySet.has(name) || m.completedLevels.includes(idx + 1)).length;
    return sum + unlocked;
  }, 0);
  const totalRewards = Object.values(moduleConfig).reduce((sum, m) => sum + m.rewards.length, 0);
  const progressPercent = Math.round((totalUnlocked / totalRewards) * 100);

  return (
    <div className="min-h-screen w-full cq-bg-app relative overflow-x-hidden">
      <CyberBackground />
      <BugStarfieldBackground />
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="p-4 sm:p-6">
          <button onClick={onBack} className="cq-btn-icon w-auto px-3 h-10 text-white/90 hover:text-white flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm sm:text-base">Back to Dashboard</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-24 px-4 sm:px-6 md:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6 sm:mb-8">
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
                <Trophy className="w-14 h-14 sm:w-16 sm:h-16 text-yellow-400 mx-auto mb-3 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]" />
              </motion.div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold cq-title-display mb-2">Reward Tab</h1>
              <p className="text-white/80 text-base sm:text-lg">Unlock rewards by finishing levels in each module.</p>
            </motion.div>

            <div className="cq-panel cq-panel-glow rounded-2xl p-4 sm:p-6 mb-6">
              <div className="grid grid-cols-1 min-[360px]:grid-cols-3 gap-3 text-center mb-4">
                <div>
                  <p className="text-white/60 text-xs sm:text-sm">Unlocked</p>
                  <p className="text-white text-2xl font-bold cq-text-gradient-gold">{totalUnlocked}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs sm:text-sm">Total</p>
                  <p className="text-white text-2xl font-bold">{totalRewards}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs sm:text-sm">Progress</p>
                  <p className="text-cyan-300 text-2xl font-bold">{progressPercent}%</p>
                </div>
              </div>
              <AnimatedProgressBar value={progressPercent} showPercent={false} size="lg" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {(Object.keys(moduleConfig) as ModuleId[]).map((key) => {
                const module = moduleConfig[key];
                const isActive = activeModule === key;
                return (
                  <motion.button
                    key={key}
                    onClick={() => setActiveModule(key)}
                    whileTap={{ scale: 0.97 }}
                    className={`p-3 sm:p-4 rounded-xl text-white font-semibold transition-all text-sm sm:text-base min-h-11 ${
                      isActive ? `bg-gradient-to-r ${module.color} shadow-lg ring-2 ring-white/30` : 'cq-panel hover:bg-white/15'
                    }`}
                  >
                    <span className="sm:hidden">{moduleShortLabel[key]}</span>
                    <span className="hidden sm:inline">{module.label}</span>
                  </motion.button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {active.rewards.map((reward, idx) => {
                const level = idx + 1;
                const unlocked = inventorySet.has(reward) || active.completedLevels.includes(level);
                return (
                  <div key={reward} className="relative">
                    <div className={`cq-level-card bg-gradient-to-br ${active.color} rounded-2xl p-5 ${unlocked ? 'opacity-100' : 'opacity-45'}`}>
                      {!unlocked && (
                        <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                          <Lock className="w-12 h-12 text-white/80" />
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-4">
                        <Sparkles className="w-8 h-8 text-white" />
                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">Level {level}</span>
                      </div>
                      <p className="text-white text-lg font-bold mb-2">{reward}</p>
                      <div className="flex items-center gap-2 text-yellow-200 text-sm">
                        <Star className="w-4 h-4" />
                        <span>{unlocked ? 'Unlocked' : 'Locked'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 text-center text-white/70 text-sm">
              Progress and rewards are synced automatically after each completed level.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Progress helpers (use API when child is logged in)
export async function loadProgress(): Promise<GameProgress | null> {
  try {
    return await api.getProgress();
  } catch {
    return null;
  }
}

export async function saveProgress(completedLevels: number[]) {
  try {
    await api.saveProgress({ completedLevels, lastPlayed: new Date().toISOString() });
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
}

export async function addCompletedLevel(level: number) {
  const p = await loadProgress();
  const arr = p?.completedLevels || [];
  if (!arr.includes(level)) {
    arr.push(level);
    await saveProgress(arr);
  }
}
