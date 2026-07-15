import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, Check, PartyPopper, ShieldCheck, Timer, X } from 'lucide-react';
import { playUiClick } from '../../../playUiClick';
import { analyzePassword, meetsWaveRequirements } from './strength';
import {
  CastleScene,
  MissionPanel,
  PasswordBuilderPanel,
  PasswordTypingPanel,
  PowerMeter,
  usePasswordSlots,
} from './PasswordBuilderKit';
import {
  LEVEL2_QUESTS,
  LEVEL3_QUESTS,
  LEVEL4_QUESTS,
  LEVEL5_QUESTS,
  LEVEL6_QUESTS,
  QUESTS_PER_LEVEL,
  VAULT_CHECKLIST,
  checklistComplete,
  isImprovedDictionaryPassword,
  type RaidItem,
} from './levelQuests';

export interface WaveQuestMissionProps {
  wave: number;
  onStageComplete: () => void;
  onQuestProgress?: (questNumber: number) => void;
  onAllComplete: () => void;
  onCorrect: (message: string, points?: number) => void;
  onWrong: (message: string, mistakeId: string) => void;
}

function ChecklistPanel({ password }: { password: string }) {
  return (
    <div className="rounded-2xl border border-cyan-400/25 bg-slate-950/60 p-3 sm:p-3.5 mb-3 space-y-2">
      <p className="text-[11px] uppercase tracking-wider text-cyan-200/70 font-semibold">Security checklist</p>
      {VAULT_CHECKLIST.map((rule) => {
        const done = rule.test(password);
        return (
          <motion.div
            key={rule.id}
            animate={done ? { scale: [1, 1.03, 1] } : { scale: 1 }}
            className={`flex items-center gap-2 rounded-xl px-2.5 py-2 border text-sm ${
              done
                ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-100'
                : 'bg-white/5 border-white/10 text-white/60'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
              done ? 'bg-emerald-400 text-emerald-950' : 'bg-white/10'
            }`}>
              {done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : null}
            </span>
            {rule.label}
          </motion.div>
        );
      })}
    </div>
  );
}

function ClassifyStep({
  items,
  onResolved,
  onWrong,
  onCorrectPick,
  showCastle = false,
  wallHp = 100,
  onDamage,
}: {
  items: RaidItem[];
  onResolved: () => void;
  onWrong: (message: string, id: string) => void;
  /** Fired when the player correctly classifies a password. */
  onCorrectPick?: (item: RaidItem) => void;
  showCastle?: boolean;
  wallHp?: number;
  onDamage?: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, boolean | null>>(
    () => Object.fromEntries(items.map((i) => [i.id, null])),
  );

  const allCorrect = items.every((i) => answers[i.id] === i.isSafe);

  const pick = (id: string, safe: boolean) => {
    const item = items.find((x) => x.id === id);
    if (!item || answers[id] !== null) return;
    playUiClick(0.2);
    const correct = item.isSafe === safe;
    if (!correct) {
      onWrong(
        safe ? 'That password is actually unsafe — try again.' : 'That password is actually safe — try again.',
        `classify_${id}`,
      );
      onDamage?.();
      return;
    }
    setAnswers((a) => ({ ...a, [id]: safe }));
    onCorrectPick?.(item);
  };

  useEffect(() => {
    if (!allCorrect) return;
    const t = window.setTimeout(onResolved, 700);
    return () => window.clearTimeout(t);
  }, [allCorrect, onResolved]);

  return (
    <div className="space-y-3">
      {showCastle && <CastleScene wallHp={wallHp} maxHp={100} gateOpen={false} />}
      {items.map((item) => {
        const answered = answers[item.id];
        const correct = answered !== null && answered === item.isSafe;
        return (
          <div
            key={item.id}
            className={`rounded-xl border p-3 ${
              correct
                ? 'border-emerald-400/40 bg-emerald-500/10'
                : 'border-white/15 bg-white/5'
            }`}
          >
            <p className="font-mono text-yellow-300 text-base mb-2">{item.password}</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={answered !== null}
                onClick={() => pick(item.id, true)}
                className="cq-touch-target min-h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-100 text-sm font-bold flex items-center justify-center gap-1"
              >
                <ShieldCheck className="w-4 h-4" /> Safe
              </button>
              <button
                type="button"
                disabled={answered !== null}
                onClick={() => pick(item.id, false)}
                className="cq-touch-target min-h-11 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-100 text-sm font-bold flex items-center justify-center gap-1"
              >
                <X className="w-4 h-4" /> Unsafe
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VictoryOverlay({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 2800);
    return () => window.clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/80 px-4"
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-sm rounded-3xl border border-amber-300/40 bg-gradient-to-b from-indigo-950 to-slate-950 p-6 text-center shadow-[0_0_48px_rgba(251,191,36,0.25)]"
      >
        <motion.div
          animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          className="mx-auto mb-3 w-16 h-16 rounded-full bg-amber-400/20 border border-amber-300/50 flex items-center justify-center"
        >
          <PartyPopper className="w-8 h-8 text-amber-300" />
        </motion.div>
        <h3 className="text-xl font-extrabold text-white mb-1">Kingdom Secured!</h3>
        <p className="text-sm text-white/75 leading-relaxed">
          Final Fortress Stand complete. Badge unlocked — the castle stands strong.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full bg-cyan-300"
              animate={{ y: [0, -10, 0], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.08 }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function WaveQuestMission({
  wave,
  onStageComplete,
  onQuestProgress,
  onAllComplete,
  onCorrect,
  onWrong,
}: WaveQuestMissionProps) {
  const [questIndex, setQuestIndex] = useState(0);
  const [success, setSuccess] = useState(false);
  const [wallHp, setWallHp] = useState(100);
  const [phase, setPhase] = useState<'scenario' | 'classify' | 'build'>('scenario');
  const [timeLeft, setTimeLeft] = useState(30);
  const [forgeList, setForgeList] = useState<string[]>([]);
  const [forgeIndex, setForgeIndex] = useState(0);
  const [showVictory, setShowVictory] = useState(false);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const builder = usePasswordSlots('');

  const total = QUESTS_PER_LEVEL;

  const showError = (message: string) => {
    builder.pulseShake();
    setErrorAlert(message);
    playUiClick(0.15);
  };

  const errorModal =
    typeof document !== 'undefined' &&
    createPortal(
      <AnimatePresence>
        {errorAlert && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="alertdialog"
            aria-modal="true"
          >
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" aria-hidden />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-2xl border border-cyan-400/35 bg-gradient-to-b from-slate-900/95 to-indigo-950/95 p-5 sm:p-6 shadow-[0_0_40px_rgba(34,211,238,0.18)]"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-400/15 border border-amber-300/35 flex items-center justify-center mb-3">
                  <AlertCircle className="w-7 h-7 text-amber-300" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Almost there!</h3>
                <p className="text-sm sm:text-base text-white/85 leading-snug mb-5">{errorAlert}</p>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    playUiClick(0.2);
                    setErrorAlert(null);
                  }}
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
    );

  const advanceQuest = () => {
    onStageComplete();
    if (questIndex >= total - 1) {
      if (wave === 6) {
        setShowVictory(true);
        return;
      }
      onAllComplete();
      return;
    }
    setQuestIndex((i) => i + 1);
    setSuccess(false);
    setPhase('classify');
  };

  useEffect(() => {
    onQuestProgress?.(questIndex + 1);
  }, [questIndex, onQuestProgress]);

  // Seed builder when quest changes
  useEffect(() => {
    if (wave === 2) {
      builder.resetTo('');
    } else if (wave === 3) {
      builder.resetTo('');
      setPhase('scenario');
      setTimeLeft(LEVEL3_QUESTS[questIndex].seconds);
      setWallHp(100);
    } else if (wave === 4) {
      builder.resetTo('');
      setPhase('classify');
      setWallHp(100);
    } else if (wave === 5) {
      builder.resetTo('');
    } else if (wave === 6) {
      builder.resetTo('');
      setPhase('classify');
      setForgeList([]);
      setForgeIndex(0);
      setWallHp(100);
    }
    setSuccess(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wave, questIndex]);

  // Timer for L3 (after Ready)
  useEffect(() => {
    const timedL3 = wave === 3 && phase === 'build';
    if (!timedL3 || success || showVictory) return;

    const seconds = LEVEL3_QUESTS[questIndex].seconds;

    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          onWrong('Time is up! Read the scenario again and try a stronger password.', `timer_w${wave}_q${questIndex}`);
          builder.resetTo('');
          setWallHp(100);
          setPhase('scenario');
          return seconds;
        }
        setWallHp((hp) => Math.max(8, hp - 100 / seconds));
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wave, questIndex, phase, success, showVictory, onWrong]);

  const submitImproved = (base: string) => {
    const check = isImprovedDictionaryPassword(base, builder.password);
    if (!check.ok) {
      showError(check.message);
      onWrong(check.message, `improve_w${wave}_q${questIndex}`);
      builder.pulseShake();
      // Under 75% defense — replay this challenge from an empty field
      if (check.message.includes('Defense Strength')) {
        builder.resetTo('');
      }
      return;
    }
    setSuccess(true);
    const score = analyzePassword(builder.password).score;
    setWallHp((hp) => Math.min(100, hp + Math.round(score * 0.25)));
    onCorrect(`Fortified! Defense power ${score}/100`, 18);
    window.setTimeout(advanceQuest, 1100);
  };

  const submitStrong = (requireSymbol = true) => {
    const reqWave = requireSymbol ? 3 : 2;
    const check = meetsWaveRequirements(builder.password, reqWave);
    if (!check.ok) {
      builder.pulseShake();
      onWrong(check.message, `build_w${wave}_q${questIndex}`);
      return;
    }
    setSuccess(true);
    onCorrect(`Strong password locked — score ${analyzePassword(builder.password).score}/100`, 20);
    window.setTimeout(advanceQuest, 1100);
  };

  const submitChecklist = () => {
    if (!checklistComplete(builder.password)) {
      builder.pulseShake();
      onWrong('Complete every checklist item before sealing the vault.', `check_w${wave}_q${questIndex}`);
      return;
    }
    setSuccess(true);
    onCorrect('Vault requirements complete — door sealed!', 22);
    window.setTimeout(advanceQuest, 1100);
  };

  const challengeLabel = `Challenge ${questIndex + 1}/${total}`;

  // ——— Level 2 ———
  if (wave === 2) {
    const q = LEVEL2_QUESTS[questIndex];
    return (
      <>
        {errorModal}
        <MissionPanel wave={wave} challengeLabel={challengeLabel} stageTitle="Strengthen the dictionary word">
          <CastleScene wallHp={wallHp} maxHp={100} gateOpen={!success} />
          <div className="mb-3">
            <p className="text-white text-sm font-semibold">Dictionary word spotted</p>
            <p className="text-yellow-300 text-2xl sm:text-3xl font-bold font-mono tracking-wide mt-1">
              {q.weakPassword}
            </p>
          </div>
          <PowerMeter analysis={builder.analysis} label="Defense Strength" />
          <PasswordBuilderPanel
            slots={builder.slots}
            lastAddedIndex={builder.lastAddedIndex}
            shake={builder.shake}
            success={success}
            activeCategory={builder.activeCategory}
            onSelectCategory={builder.selectCategory}
            onAddChar={builder.addChar}
            onBackspace={builder.backspace}
            onClear={builder.clear}
            onSubmit={() => submitImproved(q.weakPassword)}
            submitLabel="Lock Stronger Password"
            placeholder={q.weakPassword}
            placeholderEmphasis
          />
        </MissionPanel>
      </>
    );
  }

  // ——— Level 3 ———
  // Read scenario → Ready CTA → timer + typing (brute-force lesson).
  if (wave === 3) {
    const q = LEVEL3_QUESTS[questIndex];
    const urgent = timeLeft <= 8;

    if (phase === 'scenario') {
      return (
        <MissionPanel wave={wave} challengeLabel={challengeLabel} stageTitle="Read the scenario first">
          <div className="rounded-2xl border border-indigo-400/30 bg-indigo-950/50 px-3.5 py-4 sm:px-5 sm:py-5">
            <p className="text-[11px] uppercase tracking-wider text-cyan-200/70 font-semibold mb-1">Scenario</p>
            <p className="text-white text-lg sm:text-xl font-bold leading-snug mb-3">{q.title}</p>
            <p className="text-[11px] uppercase tracking-wider text-white/45 font-semibold mb-1">Create a password for</p>
            <p className="text-amber-200 font-semibold text-sm sm:text-base mb-3">{q.forLabel}</p>
            <p className="text-white/85 text-sm sm:text-base leading-relaxed mb-4">{q.situation}</p>
            <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 mb-4">
              <p className="text-[11px] sm:text-xs text-cyan-200/85 leading-relaxed">
                When you’re ready, the clock starts ({q.seconds}s). You’ll need uppercase, lowercase, a number, and a symbol.
              </p>
            </div>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                playUiClick(0.22);
                builder.resetTo('');
                setSuccess(false);
                setTimeLeft(q.seconds);
                setPhase('build');
              }}
              className="cq-btn-primary w-full min-h-12 py-3.5 text-sm sm:text-base font-bold flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              I’m ready — start the timer
            </motion.button>
          </div>
        </MissionPanel>
      );
    }

    return (
      <MissionPanel wave={wave} challengeLabel={challengeLabel} stageTitle="Beat the clock — invent a strong password">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-cyan-200/70 font-semibold mb-0.5">Password for</p>
            <p className="text-amber-200 font-semibold text-sm sm:text-base leading-snug">{q.forLabel}</p>
          </div>
          <div
            className={`shrink-0 rounded-xl border px-3 py-2 text-center min-w-[4.5rem] ${
              urgent
                ? 'border-rose-400/50 bg-rose-500/15 text-rose-100'
                : 'border-cyan-400/35 bg-cyan-500/10 text-cyan-100'
            }`}
          >
            <Timer className="w-4 h-4 mx-auto mb-0.5" />
            <p className="text-lg font-black tabular-nums leading-none">{timeLeft}s</p>
          </div>
        </div>

        <PowerMeter analysis={builder.analysis} label="Password Strength" />
        <PasswordTypingPanel
          value={builder.password}
          shake={builder.shake}
          success={success}
          onChange={builder.setPassword}
          onClear={builder.clear}
          onSubmit={() => submitStrong(true)}
          submitLabel="Lock Password"
          placeholder={`Password for ${q.forLabel}…`}
          focusKey={`${wave}-${questIndex}-build`}
        />
      </MissionPanel>
    );
  }

  // ——— Level 4 ———
  // Five Safe / Unsafe questions only — no password rebuilding.
  if (wave === 4) {
    const q = LEVEL4_QUESTS[questIndex];
    return (
      <>
        {errorModal}
        <MissionPanel
          wave={wave}
          challengeLabel={challengeLabel}
          stageTitle={`${q.title} — Safe or Unsafe`}
        >
          <p className="text-white/75 text-xs sm:text-sm mb-3 leading-relaxed">{q.situation}</p>
          <ClassifyStep
            key={q.id}
            items={q.items}
            onWrong={onWrong}
            onResolved={() => {
              onCorrect(
                questIndex >= total - 1 ? 'Raid complete — you spotted the weak passwords!' : 'Correct — next question!',
                12,
              );
              advanceQuest();
            }}
          />
        </MissionPanel>
      </>
    );
  }

  // ——— Level 5 ———
  if (wave === 5) {
    const q = LEVEL5_QUESTS[questIndex];
    return (
      <MissionPanel wave={wave} challengeLabel={challengeLabel} stageTitle={`${q.title} — Checklist`}>
        <CastleScene wallHp={100} maxHp={100} gateOpen={!success} shieldActive={checklistComplete(builder.password)} />
        <div className="mb-3 space-y-1">
          <p className="text-white text-sm font-semibold">{q.title}</p>
          <p className="text-white/70 text-xs sm:text-sm leading-relaxed">{q.situation}</p>
        </div>
        <ChecklistPanel password={builder.password} />
        <PowerMeter analysis={builder.analysis} />
        <PasswordTypingPanel
          value={builder.password}
          shake={builder.shake}
          success={success}
          onChange={builder.setPassword}
          onClear={builder.clear}
          onSubmit={submitChecklist}
          submitLabel="Seal the Vault"
          placeholder="Type a password that meets every rule…"
          focusKey={`l5-${questIndex}`}
        />
      </MissionPanel>
    );
  }

  // ——— Level 6 Boss ———
  // Each challenge: Safe/Unsafe scan → strengthen the unsafe passwords → next.
  if (wave === 6) {
    const boss = LEVEL6_QUESTS[questIndex];
    if (boss.kind !== 'classify') {
      // All Level 6 quests are classify + forge; skip legacy improve entries if any remain.
      return null;
    }

    const weak = forgeList[forgeIndex];

    if (phase === 'build' && weak) {
      return (
        <>
          {errorModal}
          {showVictory && <VictoryOverlay onDone={onAllComplete} />}
          <MissionPanel
            wave={wave}
            challengeLabel={`Strengthen ${forgeIndex + 1}/${forgeList.length}`}
            stageTitle="Make the unsafe password stronger"
          >
            <div className="mb-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-3.5 py-3">
              <p className="text-[11px] uppercase tracking-wider text-amber-200/80 font-semibold mb-1">
                Unsafe password
              </p>
              <p className="font-mono text-yellow-300 text-xl sm:text-2xl font-bold mb-2">{weak}</p>
              <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                Invent a brand-new strong password — don’t reuse “{weak}”.
              </p>
            </div>
            <PowerMeter analysis={builder.analysis} label="Password Strength" />
            <PasswordTypingPanel
              value={builder.password}
              shake={builder.shake}
              success={success}
              onChange={builder.setPassword}
              onClear={builder.clear}
              onSubmit={() => {
                if (builder.password.toLowerCase().includes(weak.toLowerCase())) {
                  showError(`Don’t reuse “${weak}” — invent a brand-new password.`);
                  onWrong(`reuse_${weak}`, `l6_forge_${questIndex}_${forgeIndex}`);
                  return;
                }
                const letterWord = /^[a-zA-Z]+$/.test(weak);
                const check = letterWord
                  ? isImprovedDictionaryPassword(weak, builder.password)
                  : meetsWaveRequirements(builder.password, 4);
                if (!check.ok) {
                  showError(check.message);
                  onWrong(check.message, `l6_forge_${questIndex}_${forgeIndex}`);
                  return;
                }
                setSuccess(true);
                onCorrect('Secure replacement locked!', 16);
                window.setTimeout(() => {
                  if (forgeIndex >= forgeList.length - 1) {
                    advanceQuest();
                    return;
                  }
                  setForgeIndex((i) => i + 1);
                  builder.resetTo('');
                  setSuccess(false);
                }, 900);
              }}
              submitLabel="Lock Strong Password"
              placeholder="Type a brand-new strong password…"
              focusKey={`l6-forge-${questIndex}-${forgeIndex}`}
            />
          </MissionPanel>
        </>
      );
    }

    return (
      <>
        {errorModal}
        {showVictory && <VictoryOverlay onDone={onAllComplete} />}
        <MissionPanel wave={wave} challengeLabel={challengeLabel} stageTitle={boss.title}>
          <p className="text-white/75 text-xs sm:text-sm mb-3">{boss.situation}</p>
          <ClassifyStep
            key={boss.id}
            items={boss.items}
            onWrong={onWrong}
            onResolved={() => {
              const unsafe = boss.items.filter((i) => !i.isSafe).map((i) => i.password);
              if (unsafe.length === 0) {
                onCorrect('Threat list cleared!', 12);
                window.setTimeout(advanceQuest, 700);
                return;
              }
              onCorrect('Now strengthen the unsafe passwords!', 12);
              setForgeList(unsafe);
              setForgeIndex(0);
              builder.resetTo('');
              setSuccess(false);
              setPhase('build');
            }}
          />
        </MissionPanel>
      </>
    );
  }

  return null;
}
