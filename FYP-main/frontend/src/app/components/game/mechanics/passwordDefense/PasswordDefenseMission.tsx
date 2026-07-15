import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle,
  CaseLower,
  CaseUpper,
  Castle,
  Delete,
  Hash,
  Lock,
  Shield,
  ShieldCheck,
  Sparkles,
  Trash2,
  Vault,
  Zap,
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
import { getScenariosForWave, getUpgradesForWave, isPairedQuizLevel } from './level1Content';
import { WaveQuestMission } from './WaveQuestMission';

type Stage = 'build' | 'quiz' | 'attack' | 'defense' | 'upgrade';
type CharCategory = 'upper' | 'lower' | 'numbers' | 'symbols';

const CHARSETS: Record<CharCategory, string[]> = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  lower: 'abcdefghijklmnopqrstuvwxyz'.split(''),
  numbers: '0123456789'.split(''),
  symbols: '!@#$%&*?+_-=.'.split(''),
};

const CATEGORIES: {
  id: CharCategory;
  label: string;
  shortLabel: string;
  sample: string;
  Icon: typeof CaseUpper;
}[] = [
  { id: 'upper', label: 'Uppercase', shortLabel: 'A–Z', sample: 'ABC', Icon: CaseUpper },
  { id: 'lower', label: 'Lowercase', shortLabel: 'a–z', sample: 'abc', Icon: CaseLower },
  { id: 'numbers', label: 'Numbers', shortLabel: '0–9', sample: '123', Icon: Hash },
  { id: 'symbols', label: 'Symbols', shortLabel: '!@#', sample: '!@#', Icon: Sparkles },
];

const MAX_PASSWORD_LEN = 16;

interface PasswordDefenseMissionProps {
  wave: number;
  onStageComplete: () => void;
  /** 1-based quest/challenge number — keeps the level progress bar in sync. */
  onQuestProgress?: (questNumber: number) => void;
  onStageReset?: () => void;
  onAllComplete: () => void;
  onCorrect: (message: string, points?: number) => void;
  onWrong: (message: string, mistakeId: string) => void;
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
    <div className="relative h-28 min-[380px]:h-32 sm:h-40 mb-3 sm:mb-4 rounded-xl overflow-hidden bg-gradient-to-b from-indigo-950/80 to-slate-900/90 border border-cyan-500/20">
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 to-transparent" />

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 min-[380px]:w-40 sm:w-52">
        <div className="flex justify-center gap-1 mb-0">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-7 h-8 sm:w-10 sm:h-12 bg-slate-600 border border-slate-500 rounded-t-lg relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[9px] border-r-[9px] border-b-[7px] border-l-transparent border-r-transparent border-b-slate-500" />
            </div>
          ))}
        </div>
        <div
          className="h-12 sm:h-16 bg-gradient-to-b from-slate-500 to-slate-700 border-x-4 border-slate-600 rounded-sm relative transition-all duration-500"
          style={{
            boxShadow: shieldActive ? '0 0 24px rgba(34,211,238,0.5)' : undefined,
            opacity: 0.5 + hpPct / 200,
          }}
        >
          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-9 h-10 sm:w-12 sm:h-14 bg-amber-900/80 border-2 border-amber-600 rounded-t-full"
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

      <Vault className="absolute bottom-2 right-3 w-5 h-5 sm:w-6 sm:h-6 text-yellow-400/80" />
    </div>
  );
}

function PowerMeter({ analysis }: { analysis: PasswordAnalysis | null }) {
  const score = analysis?.score ?? 0;
  const color = score >= 70 ? 'from-emerald-400 to-cyan-400' : score >= 40 ? 'from-amber-400 to-orange-400' : 'from-red-500 to-rose-500';

  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs sm:text-sm text-white/75 mb-1.5">
        <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-300" /> Password Power</span>
        <span className="font-semibold tabular-nums">{score}/100</span>
      </div>
      <div className="h-2.5 sm:h-3 bg-black/35 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${color}`}
          animate={{ width: `${score}%` }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        />
      </div>
      {analysis && analysis.length > 0 && (
        <p className="text-[11px] sm:text-xs text-cyan-300/90 mt-1.5">Crack time: {analysis.crackTimeLabel}</p>
      )}
    </div>
  );
}

function BlinkingCursor() {
  return (
    <motion.span
      aria-hidden
      className="inline-block w-0.5 h-5 sm:h-6 bg-cyan-300 rounded-full ml-0.5 align-middle"
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
}

function CategoryKeyboard({
  category,
  onPick,
}: {
  category: CharCategory;
  onPick: (ch: string) => void;
}) {
  const chars = CHARSETS[category];
  const cols =
    category === 'numbers'
      ? 'grid-cols-5'
      : category === 'symbols'
        ? 'grid-cols-5 sm:grid-cols-7'
        : 'grid-cols-6 sm:grid-cols-7';

  return (
    <motion.div
      key={category}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className="rounded-2xl border border-cyan-400/25 bg-slate-950/70 p-3 sm:p-4 shadow-[0_0_24px_rgba(34,211,238,0.08)]"
    >
      <p className="text-[11px] sm:text-xs uppercase tracking-wider text-cyan-200/70 mb-2.5 font-semibold">
        Tap a character
      </p>
      <div className={`grid ${cols} gap-2`}>
        {chars.map((ch) => (
          <motion.button
            key={`${category}-${ch}`}
            type="button"
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.04 }}
            onClick={() => onPick(ch)}
            className="cq-touch-target min-h-12 sm:min-h-11 rounded-xl bg-white/12 hover:bg-cyan-500/35 active:bg-cyan-500/45 font-mono font-bold text-base sm:text-lg text-white border border-white/15 transition-colors"
            aria-label={`Add ${ch}`}
          >
            {ch}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

export function PasswordDefenseMission(props: PasswordDefenseMissionProps) {
  if (props.wave >= 2) {
    return (
      <WaveQuestMission
        wave={props.wave}
        onStageComplete={props.onStageComplete}
        onQuestProgress={props.onQuestProgress}
        onAllComplete={props.onAllComplete}
        onCorrect={props.onCorrect}
        onWrong={props.onWrong}
      />
    );
  }
  return <Level1PairedMission {...props} />;
}

function Level1PairedMission({
  wave,
  onStageComplete,
  onQuestProgress,
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
  const [activeCategory, setActiveCategory] = useState<CharCategory | null>(null);
  const [builderShake, setBuilderShake] = useState(false);
  const [builderSuccess, setBuilderSuccess] = useState(false);
  const [lastAddedIndex, setLastAddedIndex] = useState<number | null>(null);
  const [upgradeAlertOpen, setUpgradeAlertOpen] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
  const [quizLocked, setQuizLocked] = useState(false);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  const scenarios = useMemo(() => getScenariosForWave(wave), [wave]);
  const upgrades = useMemo(() => getUpgradesForWave(wave), [wave]);
  const pairedQuizMode = isPairedQuizLevel(wave);
  const scenario = scenarios[Math.min(questionIndex, scenarios.length - 1)];
  const totalQuestions = scenarios.length;
  const isMultiQuestionLevel = totalQuestions > 1;
  const currentMcq = scenario.mcq;

  const liveAnalysis = useMemo(
    () => (slots.length > 0 ? analyzePassword(slots.join('')) : null),
    [slots],
  );

  const currentAttack = attacks[attackIndex];

  useEffect(() => {
    onQuestProgress?.(questionIndex + 1);
  }, [questionIndex, onQuestProgress]);

  useEffect(() => {
    if (lastAddedIndex === null) return;
    const t = window.setTimeout(() => setLastAddedIndex(null), 280);
    return () => window.clearTimeout(t);
  }, [lastAddedIndex]);

  const resetBuilderForNextQuestion = () => {
    setSlots([]);
    setActiveCategory(null);
    setBuilderSuccess(false);
    setQuizFeedback(null);
    setQuizLocked(false);
    setSelectedChoiceId(null);
  };

  const addChar = (ch: string) => {
    if (slots.length >= MAX_PASSWORD_LEN) {
      setBuilderShake(true);
      playUiClick(0.15);
      window.setTimeout(() => setBuilderShake(false), 400);
      return;
    }
    playUiClick(0.2);
    setSlots((s) => {
      const next = [...s, ch];
      setLastAddedIndex(next.length - 1);
      return next;
    });
  };

  const backspace = () => {
    if (slots.length === 0) {
      setBuilderShake(true);
      playUiClick(0.12);
      window.setTimeout(() => setBuilderShake(false), 350);
      return;
    }
    playUiClick(0.2);
    setSlots((s) => s.slice(0, -1));
  };

  const clearPassword = () => {
    playUiClick(0.2);
    setSlots([]);
    setActiveCategory(null);
  };

  const selectCategory = (id: CharCategory) => {
    playUiClick(0.22);
    setActiveCategory((prev) => (prev === id ? null : id));
  };

  const submitBuild = () => {
    const pwd = slots.join('');
    const check = meetsWaveRequirements(pwd, wave);
    if (!check.ok) {
      setBuilderShake(true);
      window.setTimeout(() => setBuilderShake(false), 450);
      onWrong(check.message, `build_wave${wave}_q${questionIndex + 1}`);
      return;
    }
    const a = analyzePassword(pwd);
    setBuilderSuccess(true);
    setActiveCategory(null);
    setPassword(pwd);
    setAnalysis(a);

    // Level 1: password → short success → unique MCQ (no attack/defense).
    if (pairedQuizMode && currentMcq) {
      onCorrect(`${scenario.successMessage} Power: ${a.score}/100`, 15);
      window.setTimeout(() => {
        setBuilderSuccess(false);
        setStage('quiz');
        setQuizFeedback(null);
        setQuizLocked(false);
        setSelectedChoiceId(null);
      }, 1100);
      return;
    }

    setMaxHp(calcInitialWallHp(a));
    setWallHp(calcInitialWallHp(a));
    onCorrect(
      `${scenario.successMessage} Power: ${a.score}/100 — crack time: ${a.crackTimeLabel}`,
      20,
    );
    window.setTimeout(() => {
      setBuilderSuccess(false);
      setStage('attack');
      onStageComplete();
    }, 1200);
  };

  const answerMcq = (choiceId: string) => {
    if (!currentMcq || quizLocked) return;
    const choice = currentMcq.choices.find((c) => c.id === choiceId);
    if (!choice) return;

    playUiClick(0.22);
    setSelectedChoiceId(choiceId);
    setQuizFeedback(choice.feedback);

    if (!choice.isCorrect) {
      onWrong(choice.feedback, `mcq_${currentMcq.id}_${choiceId}`);
      return;
    }

    setQuizLocked(true);
    onCorrect(choice.feedback, 15);

    const isLast = questionIndex >= totalQuestions - 1;
    window.setTimeout(() => {
      onStageComplete();
      if (isLast) {
        onAllComplete();
        return;
      }
      resetBuilderForNextQuestion();
      setQuestionIndex((i) => i + 1);
      setStage('build');
    }, 1400);
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
      setActiveCategory(null);
      setQuestionIndex(0);
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
      return [...prev, id];
    });
  };

  const dismissUpgradeAlert = () => {
    playUiClick(0.2);
    setUpgradeAlertOpen(false);
  };

  const finishMission = () => {
    if (selectedUpgrades.length !== 2) {
      playUiClick(0.15);
      setUpgradeAlertOpen(true);
      onWrong('Please select exactly 2 options.', `upgrade_w${wave}`);
      return;
    }
    const bonus = selectedUpgrades.reduce((sum, id) => {
      const u = upgrades.find((x) => x.id === id);
      return sum + (u?.bonus ?? 0);
    }, 0);
    onCorrect(`Vault secured! +${bonus} defense bonus. MFA, managers, and shields save kingdoms!`, 25);
    setTimeout(onAllComplete, 1500);
  };

  const stageTitle = pairedQuizMode
    ? stage === 'build'
      ? `Challenge ${questionIndex + 1} of ${totalQuestions} — Build Password`
      : `Challenge ${questionIndex + 1} of ${totalQuestions} — Security Check`
    : {
        build: isMultiQuestionLevel
          ? `Question ${questionIndex + 1} of ${totalQuestions} — Arm the Gate`
          : 'Arm the Gate',
        quiz: 'Security Check',
        attack: 'Attack Simulation',
        defense: 'Castle Defense',
        upgrade: 'Security Upgrade',
      }[stage];

  const stageProgressLabel = pairedQuizMode
    ? `${stage === 'build' ? 'Password' : 'Quiz'} · ${questionIndex + 1}/${totalQuestions}`
    : `Stage ${stage === 'build' ? 1 : stage === 'attack' ? 2 : stage === 'defense' ? 3 : 4}/4`;

  const minLen = 6 + Math.min(wave, 4);

  return (
    <div className="cq-game-panel p-3.5 sm:p-5 md:p-6">
      {/* Compact mission header */}
      <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-3">
        <div className="flex items-center gap-2 text-cyan-200 min-w-0">
          <Castle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span className="font-bold text-sm sm:text-base truncate">Password Castle</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="cq-chip text-[10px] sm:text-xs px-2 py-0.5">Wave {wave}</span>
          <span className="text-[10px] sm:text-xs text-white/55 font-medium">{stageProgressLabel}</span>
        </div>
      </div>
      <p className="text-white/70 text-xs sm:text-sm mb-3">{stageTitle}</p>

      <CastleScene
        wallHp={pairedQuizMode ? 100 : wallHp}
        maxHp={pairedQuizMode ? 100 : maxHp}
        shieldActive={shieldActive}
        underAttack={underAttack}
        gateOpen={stage === 'build'}
        projectileKey={pairedQuizMode ? 0 : projectileKey}
      />

      <AnimatePresence mode="wait">
        {stage === 'build' && (
          <motion.div
            key={`build-q${questionIndex}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3.5 sm:space-y-4"
          >
            {/* Scenario question */}
            <div className="space-y-2">
              {isMultiQuestionLevel && (
                <span className="inline-flex cq-chip text-[10px] sm:text-xs px-2 py-0.5">
                  Question {questionIndex + 1}/{totalQuestions}
                </span>
              )}
              <p className="text-white text-sm sm:text-base font-semibold leading-snug">
                {scenario.title}
              </p>
              <p className="text-white/75 text-xs sm:text-sm leading-relaxed">
                {scenario.situation}
              </p>
              <p className="text-cyan-200/90 text-xs sm:text-sm font-medium leading-snug">
                {scenario.objective}
              </p>
              <p className="text-white/55 text-xs sm:text-sm leading-relaxed">
                {scenario.tip} Need {minLen}+ chars
                {wave >= 3 ? ', with a symbol' : ', with A–Z, a–z, and a number'}.
              </p>
            </div>

            <PowerMeter analysis={liveAnalysis} />

            {/* Password builder — primary focus */}
            <motion.div
              animate={
                builderShake
                  ? { x: [0, -8, 8, -6, 6, 0] }
                  : builderSuccess
                    ? { scale: [1, 1.03, 1], boxShadow: ['0 0 0 rgba(34,211,238,0)', '0 0 28px rgba(34,211,238,0.45)', '0 0 0 rgba(34,211,238,0)'] }
                    : { x: 0, scale: 1 }
              }
              transition={{ duration: builderShake ? 0.4 : 0.7 }}
              className={`rounded-2xl border px-3 py-3 sm:px-4 sm:py-3.5 ${
                builderSuccess
                  ? 'bg-emerald-500/15 border-emerald-400/50'
                  : 'bg-slate-950/80 border-cyan-400/35 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.06)]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] sm:text-xs uppercase tracking-wider text-cyan-200/80 font-semibold">
                  Your password
                </span>
                <span className="text-[11px] sm:text-xs text-white/45 tabular-nums">
                  {slots.length}/{MAX_PASSWORD_LEN}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className="flex-1 min-w-0 min-h-12 sm:min-h-14 rounded-xl bg-black/35 border border-white/10 px-3 py-2.5 flex items-center overflow-x-auto"
                  role="textbox"
                  aria-label="Password being built"
                  aria-live="polite"
                >
                  {slots.length === 0 ? (
                    <span className="text-white/40 text-sm sm:text-base flex items-center gap-1">
                      Tap a category below
                      <BlinkingCursor />
                    </span>
                  ) : (
                    <div className="flex items-center flex-wrap gap-y-1 font-mono text-xl sm:text-2xl tracking-wide">
                      {slots.map((c, i) => (
                        <motion.span
                          key={`${i}-${c}`}
                          initial={i === lastAddedIndex ? { scale: 0, y: 8, opacity: 0 } : false}
                          animate={{ scale: 1, y: 0, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                          className="text-yellow-300"
                        >
                          {c}
                        </motion.span>
                      ))}
                      <BlinkingCursor />
                    </div>
                  )}
                </div>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={backspace}
                  className="cq-touch-target shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/10 hover:bg-rose-500/30 border border-white/15 flex items-center justify-center"
                  aria-label="Delete last character"
                >
                  <Delete className="w-5 h-5 text-white/90" />
                </motion.button>
              </div>
            </motion.div>

            {/* Category selection */}
            <div>
              <p className="text-[11px] sm:text-xs uppercase tracking-wider text-white/50 mb-2 font-semibold">
                Choose characters
              </p>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {CATEGORIES.map(({ id, label, shortLabel, sample, Icon }) => {
                  const active = activeCategory === id;
                  return (
                    <motion.button
                      key={id}
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => selectCategory(id)}
                      className={`cq-touch-target min-h-[3.25rem] sm:min-h-[3.5rem] rounded-2xl border px-3 py-2.5 sm:py-3 text-left transition-colors ${
                        active
                          ? 'bg-cyan-500/25 border-cyan-300/60 ring-2 ring-cyan-400/35'
                          : 'bg-white/8 border-white/15 hover:bg-white/12'
                      }`}
                      aria-pressed={active}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          active ? 'bg-cyan-400/25 text-cyan-200' : 'bg-white/10 text-white/70'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-white leading-tight">{label}</p>
                          <p className="text-[11px] text-white/55 mt-0.5">
                            <span className="font-mono text-white/70">{sample}</span>
                            <span className="mx-1">·</span>
                            {shortLabel}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Category keyboard (only after selection) */}
            <AnimatePresence mode="wait">
              {activeCategory && (
                <CategoryKeyboard
                  key={activeCategory}
                  category={activeCategory}
                  onPick={addChar}
                />
              )}
            </AnimatePresence>

            {!activeCategory && (
              <p className="text-center text-xs text-white/40 py-1">
                Select Uppercase, Lowercase, Numbers, or Symbols to open the keyboard.
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-1">
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={clearPassword}
                className="cq-btn-secondary min-h-12 px-4 py-3 text-sm font-semibold flex items-center justify-center gap-2 sm:w-auto w-full"
              >
                <Trash2 className="w-4 h-4" /> Clear
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={submitBuild}
                className="cq-btn-primary flex-1 min-h-12 py-3 text-sm sm:text-base font-bold flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                {pairedQuizMode ? 'Lock Password' : 'Lock the Gate'}
              </motion.button>
            </div>
          </motion.div>
        )}

        {stage === 'quiz' && pairedQuizMode && currentMcq && (
          <motion.div
            key={`quiz-${currentMcq.id}`}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="space-y-3.5 sm:space-y-4"
          >
            <div className="rounded-2xl border border-emerald-400/35 bg-emerald-500/10 px-3 py-3 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-emerald-100">Password locked!</p>
                <p className="text-xs text-white/70 mt-0.5 leading-relaxed">{scenario.successMessage}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex cq-chip text-[10px] sm:text-xs px-2 py-0.5">
                {currentMcq.topic}
              </span>
              <p className="text-white text-sm sm:text-base font-semibold leading-snug">
                {currentMcq.prompt}
              </p>
              <p className="text-white/55 text-xs">
                Choose the best answer to continue.
              </p>
            </div>

            <div className="space-y-2.5">
              {currentMcq.choices.map((choice) => {
                const selected = selectedChoiceId === choice.id;
                const showCorrect = quizLocked && choice.isCorrect;
                const showWrong = selected && !choice.isCorrect;
                return (
                  <motion.button
                    key={choice.id}
                    type="button"
                    disabled={quizLocked}
                    whileTap={quizLocked ? undefined : { scale: 0.98 }}
                    onClick={() => answerMcq(choice.id)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all min-h-[3.25rem] ${
                      showCorrect
                        ? 'bg-emerald-500/20 border-emerald-400/50 ring-2 ring-emerald-400/30'
                        : showWrong
                          ? 'bg-rose-500/15 border-rose-400/40'
                          : selected
                            ? 'bg-cyan-500/15 border-cyan-400/40'
                            : 'bg-white/5 border-white/15 hover:bg-white/10'
                    } ${quizLocked && !choice.isCorrect ? 'opacity-70' : ''}`}
                  >
                    <p className="text-sm font-semibold text-white leading-snug">{choice.text}</p>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {quizFeedback && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`text-xs sm:text-sm leading-relaxed rounded-xl px-3 py-2.5 border ${
                    quizLocked
                      ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-100'
                      : 'bg-amber-500/10 border-amber-400/30 text-amber-100'
                  }`}
                >
                  {quizFeedback}
                  {!quizLocked && ' Try another answer.'}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {stage === 'attack' && !pairedQuizMode && analysis && (
          <motion.div key="attack" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <PowerMeter analysis={analysis} />
            <div className="bg-black/30 rounded-xl p-3 mb-3 font-mono text-yellow-300 text-center tracking-widest text-lg">
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
              <button type="button" onClick={runNextAttack} className="cq-btn-primary w-full min-h-12 py-3 font-bold flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />
                {attackIndex === 0 ? 'Simulate Attacks' : 'Next Attack'}
              </button>
            ) : null}
          </motion.div>
        )}

        {stage === 'defense' && !pairedQuizMode && analysis && defenseDone && (
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

            <button type="button" onClick={proceedToUpgrades} className="cq-btn-primary w-full min-h-12 py-3 font-bold">
              {wallHp > 0 ? 'Fortify the Vault →' : 'Rebuild Gate Password'}
            </button>
          </motion.div>
        )}

        {stage === 'upgrade' && !pairedQuizMode && (
          <motion.div key="upgrade" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex items-center justify-between gap-2 mb-4">
              <p className="text-white/90 text-sm">
                Select <strong className="text-cyan-300">exactly 2 options</strong> to protect the vault.
              </p>
              <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border tabular-nums ${
                selectedUpgrades.length === 2
                  ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                  : 'bg-white/10 border-white/20 text-white/70'
              }`}>
                {selectedUpgrades.length}/2
              </span>
            </div>
            <div className="space-y-3 mb-4">
              {upgrades.map((u) => {
                const Icon = u.icon;
                const selected = selectedUpgrades.includes(u.id);
                return (
                  <motion.button
                    key={u.id}
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => toggleUpgrade(u.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all min-h-[4.5rem] ${
                      selected
                        ? 'bg-cyan-500/20 border-cyan-400/50 ring-2 ring-cyan-400/30'
                        : 'bg-white/5 border-white/15 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-8 h-8 shrink-0 ${selected ? 'text-cyan-300' : 'text-white/60'}`} />
                      <div className="min-w-0">
                        <p className="font-bold text-white">{u.label}</p>
                        <p className="text-xs text-white/70">{u.tip}</p>
                      </div>
                      {selected && <Sparkles className="w-5 h-5 text-yellow-400 ml-auto shrink-0" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>
            <button type="button" onClick={finishMission} className="cq-btn-primary w-full min-h-12 py-3 font-bold flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5" /> Secure the Vault
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {upgradeAlertOpen && (
              <motion.div
                className="fixed inset-0 z-[100] flex items-center justify-center px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="upgrade-alert-title"
                aria-describedby="upgrade-alert-message"
              >
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" aria-hidden />
                <motion.div
                  initial={{ opacity: 0, scale: 0.88, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: 8 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 26 }}
                  className="relative w-full max-w-sm rounded-2xl border border-cyan-400/35 bg-gradient-to-b from-slate-900/95 to-indigo-950/95 p-5 sm:p-6 shadow-[0_0_40px_rgba(34,211,238,0.18)]"
                >
                  <div className="flex flex-col items-center text-center pt-1">
                    <div className="w-14 h-14 rounded-2xl bg-amber-400/15 border border-amber-300/35 flex items-center justify-center mb-3">
                      <AlertCircle className="w-7 h-7 text-amber-300" />
                    </div>
                    <h3 id="upgrade-alert-title" className="text-lg font-bold text-white mb-2">
                      Almost there!
                    </h3>
                    <p id="upgrade-alert-message" className="text-sm sm:text-base text-white/85 leading-snug mb-5">
                      Please select exactly 2 options.
                    </p>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={dismissUpgradeAlert}
                      className="cq-btn-primary w-full min-h-12 py-3 font-bold"
                    >
                      OK
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
