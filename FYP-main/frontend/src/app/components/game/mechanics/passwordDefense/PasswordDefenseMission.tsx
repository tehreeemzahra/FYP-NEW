import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Castle, Fingerprint, KeyRound, Lock, Shield, ShieldCheck, Sparkles, Trash2, Vault, Zap,
} from 'lucide-react';
import { playUiClick } from '../../../playUiClick';
import {
  analyzePassword,
  calcInitialWallHp,
  calcWallDamage,
  getAttacksForWave,
  meetsWaveRequirements,
  type PasswordAnalysis,
} from './strength';

type Stage = 'build' | 'attack' | 'defense' | 'upgrade';

const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ'.split('');
const LOWER = 'abcdefghjkmnpqrstuvwxyz'.split('');
const NUMBERS = '23456789'.split('');
const SYMBOLS = '!@#$%&*?'.split('');

const UPGRADES = [
  { id: 'mfa', label: 'Multi-Factor Auth', icon: Fingerprint, bonus: 15, tip: 'Adds a second lock — even if password leaks, vault stays safe.' },
  { id: 'manager', label: 'Password Manager', icon: KeyRound, bonus: 12, tip: 'Unique passwords for every account — reuse attacks fail.' },
  { id: 'shield', label: 'Security Shield', icon: ShieldCheck, bonus: 10, tip: 'Blocks automated guessing bots at the gate.' },
];

interface PasswordDefenseMissionProps {
  wave: number;
  onStageComplete: () => void;
  onStageReset?: () => void;
  onAllComplete: () => void;
  onCorrect: (message: string, points?: number) => void;
  onWrong: (message: string, mistakeId: string) => void;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function CastleScene({
  wallHp,
  maxHp,
  shieldActive,
  underAttack,
  gateOpen,
  projectileKey,
}: {
  wallHp: number;
  maxHp: number;
  shieldActive: boolean;
  underAttack: boolean;
  gateOpen: boolean;
  projectileKey?: number;
}) {
  const hpPct = (wallHp / maxHp) * 100;

  return (
    <div className="relative h-36 sm:h-44 mb-4 rounded-xl overflow-hidden bg-gradient-to-b from-indigo-950/80 to-slate-900/90 border border-cyan-500/20">
      {/* Sky glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 to-transparent" />

      {/* Castle body */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-36 min-[380px]:w-48 sm:w-56">
        <div className="flex justify-center gap-1 mb-0">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-8 h-10 sm:w-10 sm:h-12 bg-slate-600 border border-slate-500 rounded-t-lg relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[8px] border-l-transparent border-r-transparent border-b-slate-500" />
            </div>
          ))}
        </div>
        <div
          className="h-14 sm:h-16 bg-gradient-to-b from-slate-500 to-slate-700 border-x-4 border-slate-600 rounded-sm relative transition-all duration-500"
          style={{
            boxShadow: shieldActive ? '0 0 24px rgba(34,211,238,0.5)' : undefined,
            opacity: 0.5 + hpPct / 200,
          }}
        >
          {/* Gate */}
          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-12 sm:w-12 sm:h-14 bg-amber-900/80 border-2 border-amber-600 rounded-t-full"
            animate={{ scaleY: gateOpen ? 0.3 : 1 }}
            style={{ transformOrigin: 'bottom' }}
          />
          {shieldActive && (
            <motion.div
              className="absolute inset-0 border-2 border-cyan-400/60 rounded-sm"
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          )}
        </div>
      </div>

      {/* Wall health */}
      <div className="absolute top-2 left-2 right-2">
        <div className="flex justify-between text-[10px] sm:text-xs text-white/70 mb-0.5">
          <span className="flex items-center gap-1"><Castle className="w-3 h-3" /> Wall Integrity</span>
          <span>{Math.round(hpPct)}%</span>
        </div>
        <div className="h-2 bg-black/40 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${hpPct > 50 ? 'bg-emerald-500' : hpPct > 25 ? 'bg-amber-500' : 'bg-red-500'}`}
            animate={{ width: `${hpPct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Attack flash */}
      <AnimatePresence>
        {underAttack && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1.5, 2] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-red-500/30 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Attack projectile */}
      <AnimatePresence>
        {projectileKey !== undefined && projectileKey > 0 && (
          <motion.div
            key={projectileKey}
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)] z-20"
            initial={{ left: '100%', opacity: 1 }}
            animate={{ left: '42%', opacity: [1, 1, 0] }}
            transition={{ duration: 0.55, ease: 'easeIn' }}
          />
        )}
      </AnimatePresence>

      {/* Shield burst on block */}
      <AnimatePresence>
        {shieldActive && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0.8 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute left-1/2 bottom-8 -translate-x-1/2 w-20 h-20 rounded-full border-2 border-cyan-400 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <Vault className="absolute bottom-3 right-4 w-6 h-6 text-yellow-400/80" />
    </div>
  );
}

function PowerMeter({ analysis }: { analysis: PasswordAnalysis | null }) {
  const score = analysis?.score ?? 0;
  const color = score >= 70 ? 'from-emerald-400 to-cyan-400' : score >= 40 ? 'from-amber-400 to-orange-400' : 'from-red-500 to-rose-500';

  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-white/70 mb-1">
        <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Password Power</span>
        <span>{score}/100</span>
      </div>
      <div className="h-3 bg-black/30 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${color}`}
          animate={{ width: `${score}%` }}
          transition={{ type: 'spring', stiffness: 200 }}
        />
      </div>
      {analysis && (
        <p className="text-xs text-cyan-300 mt-1">Est. crack time: {analysis.crackTimeLabel}</p>
      )}
    </div>
  );
}

export function PasswordDefenseMission({
  wave,
  onStageComplete,
  onStageReset,
  onAllComplete,
  onCorrect,
  onWrong,
}: PasswordDefenseMissionProps) {
  const [stage, setStage] = useState<Stage>('build');
  const [slots, setSlots] = useState<string[]>([]);
  const [password, setPassword] = useState('');
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);
  const [attacks] = useState(() => getAttacksForWave(wave));
  const [attackIndex, setAttackIndex] = useState(0);
  const [wallHp, setWallHp] = useState(100);
  const [maxHp, setMaxHp] = useState(100);
  const [underAttack, setUnderAttack] = useState(false);
  const [shieldActive, setShieldActive] = useState(false);
  const [selectedUpgrades, setSelectedUpgrades] = useState<string[]>([]);
  const [attackLog, setAttackLog] = useState<string[]>([]);
  const [defenseDone, setDefenseDone] = useState(false);
  const [projectileKey, setProjectileKey] = useState(0);

  const tiles = useMemo(
    () => ({
      upper: shuffle(UPPER).slice(0, 8),
      lower: shuffle(LOWER).slice(0, 8),
      numbers: shuffle(NUMBERS).slice(0, 6),
      symbols: shuffle(SYMBOLS).slice(0, 6),
    }),
    [wave],
  );

  const currentAttack = attacks[attackIndex];

  const addChar = (ch: string) => {
    if (slots.length >= 16) return;
    playUiClick(0.2);
    setSlots((s) => [...s, ch]);
  };

  const clearPassword = () => {
    playUiClick(0.2);
    setSlots([]);
  };

  const submitBuild = () => {
    const pwd = slots.join('');
    const check = meetsWaveRequirements(pwd, wave);
    if (!check.ok) {
      onWrong(check.message, `build_wave${wave}`);
      return;
    }
    const a = analyzePassword(pwd);
    setPassword(pwd);
    setAnalysis(a);
    setMaxHp(calcInitialWallHp(a));
    setWallHp(calcInitialWallHp(a));
    onCorrect(`Gate password armed! Power: ${a.score}/100 — crack time: ${a.crackTimeLabel}`, 20);
    setTimeout(() => {
      setStage('attack');
      onStageComplete();
    }, 1200);
  };

  const runNextAttack = useCallback(() => {
    if (!analysis || attackIndex >= attacks.length) return;

    const attack = attacks[attackIndex];
    setUnderAttack(true);
    setProjectileKey((k) => k + 1);
    setTimeout(() => setUnderAttack(false), 600);

    const blocked = analysis.score >= attack.power;
    const damage = blocked ? 0 : calcWallDamage(analysis, attack);

    setTimeout(() => {
      if (blocked) {
        setAttackLog((l) => [...l, `✅ ${attack.name} blocked!`]);
        onCorrect(`${attack.name} failed — your password held strong!`, 15);
        setShieldActive(true);
        setTimeout(() => setShieldActive(false), 800);
      } else {
        setWallHp((hp) => Math.max(0, hp - damage));
        setAttackLog((l) => [...l, `💥 ${attack.name} breached —${damage} wall HP`]);
        onWrong(`${attack.name} cracked weak spots! ${attack.description}`, `attack_${attack.id}_w${wave}`);
      }

      if (attackIndex + 1 < attacks.length) {
        setAttackIndex((i) => i + 1);
      } else {
        setTimeout(() => {
          setStage('defense');
          setDefenseDone(true);
          onStageComplete();
        }, 1000);
      }
    }, 700);
  }, [analysis, attackIndex, attacks, onCorrect, onWrong, onStageComplete, wave]);

  const proceedToUpgrades = () => {
    if (wallHp <= 0) {
      onWrong('The castle walls fell! Stronger passwords are needed.', `walls_fell_w${wave}`);
      setStage('build');
      setSlots([]);
      setAttackIndex(0);
      setAttackLog([]);
      setDefenseDone(false);
      setPassword('');
      setAnalysis(null);
      onStageReset?.();
      return;
    }
    onCorrect('Castle standing! Choose security upgrades to fortify the vault.', 10);
    setStage('upgrade');
    onStageComplete();
  };

  const toggleUpgrade = (id: string) => {
    playUiClick(0.25);
    setSelectedUpgrades((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  };

  const finishMission = () => {
    if (selectedUpgrades.length < 2) {
      onWrong('Select 2 security upgrades to fully protect the vault.', `upgrade_w${wave}`);
      return;
    }
    const bonus = selectedUpgrades.reduce((sum, id) => {
      const u = UPGRADES.find((x) => x.id === id);
      return sum + (u?.bonus ?? 0);
    }, 0);
    onCorrect(`Vault secured! +${bonus} defense bonus. MFA, managers, and shields save kingdoms!`, 25);
    setTimeout(onAllComplete, 1500);
  };

  const stageTitle = {
    build: 'Stage 1 — Arm the Gate',
    attack: 'Stage 2 — Attack Simulation',
    defense: 'Stage 3 — Castle Defense',
    upgrade: 'Stage 4 — Security Upgrade',
  }[stage];

  return (
    <div className="cq-game-panel p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-cyan-200">
          <Castle className="w-5 h-5" />
          <span className="font-bold text-sm sm:text-base">Password Defense Mission</span>
        </div>
        <span className="cq-chip text-xs">Wave {wave}</span>
      </div>

      <p className="text-white/80 text-xs sm:text-sm mb-3">{stageTitle}</p>

      <CastleScene
        wallHp={wallHp}
        maxHp={maxHp}
        shieldActive={shieldActive}
        underAttack={underAttack}
        gateOpen={stage === 'build'}
        projectileKey={projectileKey}
      />

      <AnimatePresence mode="wait">
        {stage === 'build' && (
          <motion.div key="build" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <p className="text-white/90 text-sm mb-3">
              Cyber criminals are attacking the vault! Drag components to build a gate password.
            </p>
            <PowerMeter analysis={slots.length > 0 ? analyzePassword(slots.join('')) : null} />

            <div className="bg-slate-900/70 rounded-xl p-3 mb-3 min-h-[52px] flex items-center gap-0.5 flex-wrap font-mono text-base sm:text-lg break-all border border-cyan-500/20">
              {slots.length === 0 ? (
                <span className="text-white/40 text-sm">Tap letters, numbers & symbols below…</span>
              ) : (
                slots.map((c, i) => (
                  <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-yellow-300">
                    {c}
                  </motion.span>
                ))
              )}
            </div>

            {(['upper', 'lower', 'numbers', 'symbols'] as const).map((bucket) => (
              <div key={bucket} className="mb-2">
                <p className="text-[10px] uppercase tracking-wider text-white/50 mb-1">
                  {bucket === 'upper' ? 'Uppercase' : bucket === 'lower' ? 'Lowercase' : bucket === 'numbers' ? 'Numbers' : 'Symbols'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {tiles[bucket].map((ch, i) => (
                    <motion.button
                      key={`${bucket}-${ch}-${i}`}
                      type="button"
                      whileTap={{ scale: 0.88 }}
                      onClick={() => addChar(ch)}
                      className="cq-touch-target w-11 h-11 sm:w-10 sm:h-10 rounded-lg bg-white/15 hover:bg-cyan-500/30 font-mono font-bold text-sm border border-white/10"
                    >
                      {ch}
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <button type="button" onClick={clearPassword} className="cq-btn-secondary px-3 py-2.5 text-sm flex items-center justify-center gap-1 sm:w-auto w-full">
                <Trash2 className="w-4 h-4" /> Clear
              </button>
              <button type="button" onClick={submitBuild} className="cq-btn-primary flex-1 py-2 text-sm font-bold flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" /> Lock the Gate
              </button>
            </div>
          </motion.div>
        )}

        {stage === 'attack' && analysis && (
          <motion.div key="attack" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <PowerMeter analysis={analysis} />
            <div className="bg-black/30 rounded-xl p-3 mb-3 font-mono text-yellow-300 text-center tracking-widest">
              {password.replace(/./g, '•')}
            </div>

            <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
              {attackLog.map((log, i) => (
                <motion.p key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs text-white/80">
                  {log}
                </motion.p>
              ))}
            </div>

            {attackIndex < attacks.length && currentAttack && (
              <motion.div
                key={currentAttack.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/15 border border-red-400/30 rounded-xl p-4 mb-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{currentAttack.icon}</span>
                  <div>
                    <p className="font-bold text-red-200">{currentAttack.name}</p>
                    <p className="text-xs text-white/70">{currentAttack.description}</p>
                  </div>
                </div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-red-300">Attack power: {currentAttack.power}</span>
                  <span className="text-cyan-300">Your defense: {analysis.score}</span>
                </div>
                <div className="flex gap-2 h-2">
                  <div className="flex-1 bg-red-900/50 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${currentAttack.power}%` }} />
                  </div>
                  <div className="flex-1 bg-cyan-900/50 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-cyan-400" animate={{ width: `${analysis.score}%` }} />
                  </div>
                </div>
              </motion.div>
            )}

            {attackIndex < attacks.length ? (
              <button type="button" onClick={runNextAttack} className="cq-btn-primary w-full py-3 font-bold flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />
                {attackIndex === 0 ? 'Simulate Attacks' : 'Next Attack'}
              </button>
            ) : null}
          </motion.div>
        )}

        {stage === 'defense' && analysis && defenseDone && (
          <motion.div key="defense" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {wallHp > 50 ? (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="cq-feedback-success rounded-xl p-4 mb-4 text-center"
              >
                <Shield className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="font-bold text-emerald-100">Attacks repelled!</p>
                <p className="text-sm text-white/80 mt-1">
                  Strong length, mixed characters, and symbols dramatically increased crack time to {analysis.crackTimeLabel}.
                </p>
              </motion.div>
            ) : wallHp > 0 ? (
              <div className="cq-hint-box rounded-xl p-4 mb-4 text-center">
                <p className="font-bold text-amber-200">Walls damaged but standing</p>
                <p className="text-sm text-white/80 mt-1">
                  Password length and complexity matter — add symbols and avoid predictable patterns.
                </p>
              </div>
            ) : (
              <div className="cq-feedback-error rounded-xl p-4 mb-4 text-center">
                <p className="font-bold text-red-200">Castle breached!</p>
                <p className="text-sm text-white/80 mt-1">
                  Weak or common passwords fall to dictionary and brute-force attacks in seconds.
                </p>
              </div>
            )}

            <button type="button" onClick={proceedToUpgrades} className="cq-btn-primary w-full py-3 font-bold">
              {wallHp > 0 ? 'Fortify the Vault →' : 'Rebuild Gate Password'}
            </button>
          </motion.div>
        )}

        {stage === 'upgrade' && (
          <motion.div key="upgrade" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <p className="text-white/90 text-sm mb-4">
              Select <strong className="text-cyan-300">2 upgrades</strong> to protect the kingdom&apos;s vault.
            </p>
            <div className="space-y-3 mb-4">
              {UPGRADES.map((u) => {
                const Icon = u.icon;
                const selected = selectedUpgrades.includes(u.id);
                return (
                  <motion.button
                    key={u.id}
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => toggleUpgrade(u.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selected
                        ? 'bg-cyan-500/20 border-cyan-400/50 ring-2 ring-cyan-400/30'
                        : 'bg-white/5 border-white/15 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-8 h-8 ${selected ? 'text-cyan-300' : 'text-white/60'}`} />
                      <div>
                        <p className="font-bold text-white">{u.label}</p>
                        <p className="text-xs text-white/70">{u.tip}</p>
                      </div>
                      {selected && <Sparkles className="w-5 h-5 text-yellow-400 ml-auto" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>
            <button type="button" onClick={finishMission} className="cq-btn-primary w-full py-3 font-bold flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5" /> Secure the Vault
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
