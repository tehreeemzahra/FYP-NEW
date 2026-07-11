import { useState, type ComponentType } from 'react';
import { ChatSimulatorGame } from '../../mechanics/ChatSimulatorGame';
import { WebsiteCompareGame } from '../../mechanics/WebsiteCompareGame';
import { InvestigationGame } from '../../mechanics/InvestigationGame';
import { DragSortGame } from '../../mechanics/DragSortGame';
import { ThreatResponseGame } from '../../mechanics/ThreatResponseGame';
import { BossMissionGame, BossAdvanceButton } from '../../mechanics/BossMissionGame';
import { MemoryMatchGame } from '../../mechanics/MemoryMatchGame';
import { useLevelRunner } from '../../shell/useLevelRunner';
import { unlockAchievement, getAchievementForMechanic } from '../../achievementService';
import type { GameLevel, LevelCompleteStats, LevelMeta } from '../../types';

type LevelProps = { onBack: () => void; onComplete: (stats: LevelCompleteStats) => void };

export const BULLY_REWARDS = ['Harassment Shield', 'Identity Protector', 'Truth Defender', 'Privacy Guardian', 'Safety Tracker', 'Troll Tamer Crown'];

export const BULLY_META: LevelMeta[] = [
  { level: 1, title: 'Harassment', concept: 'Repeated hurtful messages are harassment — support and reporting help.', summary: 'Do not endure repeated hurtful messages; block, report, and tell a trusted adult.', hint: 'Choose responses that protect yourself and others.', tips: ['Read each chat carefully', 'Support victims and report harassment', 'Never encourage mean messages'], ageGroup: '7-9', reward: BULLY_REWARDS[0], mechanic: 'Group Chat Navigator' },
  { level: 2, title: 'Impersonation', concept: 'Fake accounts copy identities to trick friends.', summary: 'Verify accounts through known channels before trusting copied profiles.', hint: 'New accounts with copied photos are suspicious.', tips: ['Compare both profiles', 'Identify the impersonator', 'Report fake accounts'], ageGroup: '8-10', reward: BULLY_REWARDS[1], mechanic: 'Profile Comparison' },
  { level: 3, title: 'Denigration', concept: 'False rumors damage reputations and spread harm.', summary: 'Identify harmful rumor language and refuse to spread it.', hint: 'Tap words that spread false rumors.', tips: ['Find harmful phrases in each message', 'Do not spread unverified rumors', 'Support the person being targeted'], ageGroup: '8-10', reward: BULLY_REWARDS[2], mechanic: 'Rumor Investigation' },
  { level: 4, title: 'Outing', concept: 'Sharing private chats without permission violates privacy.', summary: 'Sort content into private vs safe-to-share categories.', hint: 'Private conversations should never be posted publicly.', tips: ['Sort each item into the right category', 'Protect private conversations', 'Ask permission before sharing others content'], ageGroup: '9-11', reward: BULLY_REWARDS[3], mechanic: 'Privacy Boundary Sort' },
  { level: 5, title: 'Cyberstalking', concept: 'Online tracking and fear messages are serious threats.', summary: 'Respond quickly to stalking: document, block, report, tell adults.', hint: 'You have limited time — choose the safest action.', tips: ['Read each incident carefully', 'Block and report stalkers', 'Tell a trusted adult immediately'], ageGroup: '9-11', reward: BULLY_REWARDS[4], mechanic: 'Threat Response' },
  { level: 6, title: 'Trolling & Boss Mission', concept: 'Combine all cyberbully skills in a final rescue mission.', summary: 'Use everything you learned to protect Cyber City from bullies and trolls.', hint: 'Complete all three mission phases.', tips: ['Phase 1: Spot the troll', 'Phase 2: Protect a friend', 'Phase 3: Report and block'], ageGroup: '10-12', reward: BULLY_REWARDS[5], mechanic: 'Cyber City Rescue' },
];

export function BullyLevel1({ onBack, onComplete }: LevelProps) {
  const [step, setStep] = useState(1);
  const runner = useLevelRunner({ title: 'Harassment Chat', mechanic: 'Group Chat Navigator', hint: BULLY_META[0].hint, totalSteps: 2, currentStep: step, onBack, onComplete: async (s) => { const a = getAchievementForMechanic('chat'); if (a) await unlockAchievement(a); onComplete(s); } });
  return runner.wrap(
    <ChatSimulatorGame
      nodes={[
        { id: 'h1', messages: [{ id: 'm1', from: 'them', text: 'You are so bad at this game. Everyone thinks so. Say it too or we keep going.' }], choices: [
          { id: 'join', text: 'Yeah they are terrible!', isSafe: false, explanation: 'Joining harassment makes it worse for everyone.' },
          { id: 'support', text: 'Stop. I am reporting this and telling a teacher.', isSafe: true, explanation: 'Reporting harassment protects victims.' },
        ]},
        { id: 'h2', messages: [{ id: 'm2', from: 'them', text: 'We will message you every day until you quit the team.' }], choices: [
          { id: 'ignore', text: 'Okay I will quit...', isSafe: false, explanation: 'Giving in to threats rewards bullies.' },
          { id: 'block', text: 'Block, screenshot, and tell my parent.', isSafe: true, explanation: 'Documenting and blocking is the right response to threats.' },
        ]},
      ]}
      onNodeComplete={() => setStep((s) => s + 1)}
      onAllComplete={runner.finish}
      onCorrect={(m) => runner.showCorrect(m, 20)}
      onWrong={(m, id) => runner.showWrong(m, id)}
    />,
  );
}

export function BullyLevel2({ onBack, onComplete }: LevelProps) {
  const runner = useLevelRunner({ title: 'Impersonation Detective', mechanic: 'Profile Comparison', hint: BULLY_META[1].hint, totalSteps: 1, currentStep: 1, onBack, onComplete });
  return runner.wrap(
    <WebsiteCompareGame
      rounds={[{ id: 'imp', prompt: 'Your friend says someone is pretending to be them. Which account is fake?', left: { id: 'fake', url: 'chat.app/maya_real_official', title: 'Maya_Real_Official', details: ['Created today', 'DMs classmates for codes', 'Copied profile pic'], isLegit: false, explanation: 'Brand-new accounts copying photos and asking for codes are impersonators.' }, right: { id: 'real', url: 'chat.app/maya_j', title: 'maya_j', details: ['2 years of posts', 'Friends recognize stories', 'Never asks for passwords'], isLegit: true, explanation: 'Long history with recognizable content indicates the real account.' } }]}
      onRoundComplete={() => {}}
      onAllComplete={runner.finish}
      onCorrect={(m) => runner.showCorrect(m, 25)}
      onWrong={(m, id) => runner.showWrong(m, id)}
    />,
  );
}

export function BullyLevel3({ onBack, onComplete }: LevelProps) {
  const [step, setStep] = useState(1);
  const runner = useLevelRunner({ title: 'Rumor Investigation', mechanic: 'Rumor Investigation', hint: BULLY_META[2].hint, totalSteps: 1, currentStep: step, onBack, onComplete: async (s) => { const a = getAchievementForMechanic('investigation'); if (a) await unlockAchievement(a); onComplete(s); } });
  return runner.wrap(
    <InvestigationGame
      rounds={[{ id: 'rumor', title: 'Group Chat Rumor', context: 'Someone posted this about a classmate:', segments: [
        { id: 'a', text: 'I heard ', isSuspicious: false, explanation: '' },
        { id: 'b', text: 'definitely cheated ', isSuspicious: true, explanation: 'Unverified accusations spread harm.' },
        { id: 'c', text: 'on the test — ', isSuspicious: false, explanation: '' },
        { id: 'd', text: 'pass it on!', isSuspicious: true, explanation: 'Asking others to spread rumors is denigration.' },
      ]}]}
      onRoundComplete={() => setStep(2)}
      onAllComplete={runner.finish}
      onCorrect={(m) => runner.showCorrect(m, 25)}
      onWrong={(m, id) => runner.showWrong(m, id)}
    />,
  );
}

export function BullyLevel4({ onBack, onComplete }: LevelProps) {
  const runner = useLevelRunner({ title: 'Privacy Boundaries', mechanic: 'Privacy Boundary Sort', hint: BULLY_META[3].hint, totalSteps: 1, currentStep: 1, onBack, onComplete });
  return runner.wrap(
    <DragSortGame
      safeLabel="OK to share (with permission)"
      unsafeLabel="Private — do not share"
      items={[
        { id: '1', label: 'Screenshot of private DM conversation', bucket: 'unsafe', explanation: 'Private chats shared without permission is outing.' },
        { id: '2', label: 'Public meme from a comedy page', bucket: 'safe', explanation: 'Public content meant for sharing is different from private chats.' },
        { id: '3', label: 'Friend\'s secret told in confidence', bucket: 'unsafe', explanation: 'Secrets shared in confidence must stay private.' },
        { id: '4', label: 'Your own art you made to share', bucket: 'safe', explanation: 'Sharing your own creations is fine.' },
        { id: '5', label: 'Embarrassing photo of someone else', bucket: 'unsafe', explanation: 'Posting embarrassing photos without consent is outing.' },
      ]}
      onAllComplete={runner.finish}
      onCorrect={(m) => runner.showCorrect(m, 25)}
      onWrong={(m, id) => runner.showWrong(m, id)}
    />,
  );
}

export function BullyLevel5({ onBack, onComplete }: LevelProps) {
  const [step, setStep] = useState(1);
  const runner = useLevelRunner({ title: 'Stalker Response', mechanic: 'Threat Response', hint: BULLY_META[4].hint, totalSteps: 2, currentStep: step, onBack, onComplete: async (s) => { const a = getAchievementForMechanic('threat'); if (a) await unlockAchievement(a); onComplete(s); } });
  return runner.wrap(
    <ThreatResponseGame
      incidents={[
        { id: 'st1', title: 'Unknown account follows every post', description: 'A stranger comments on everything you post within seconds and says they know where you live.', timeLimit: 12, actions: [
          { id: 'a1', label: 'Block, screenshot, tell a trusted adult', isCorrect: true, explanation: 'Documenting and reporting stalking protects you.' },
          { id: 'a2', label: 'Share your address to prove you are brave', isCorrect: false, explanation: 'Never share location with stalkers.' },
          { id: 'a3', label: 'Ignore it forever', isCorrect: false, explanation: 'Stalking escalates — tell an adult and report.' },
        ]},
        { id: 'st2', title: 'Fear messages at midnight', description: '"I am outside your school tomorrow" from an unknown account.', timeLimit: 10, actions: [
          { id: 'b1', label: 'Reply with your schedule', isCorrect: false, explanation: 'Never give personal schedules to threats.' },
          { id: 'b2', label: 'Screenshot, report, alert parent and school', isCorrect: true, explanation: 'Threats require immediate adult intervention.' },
        ]},
      ]}
      onRoundComplete={() => setStep((s) => s + 1)}
      onAllComplete={runner.finish}
      onCorrect={(m) => runner.showCorrect(m, 20)}
      onWrong={(m, id) => runner.showWrong(m, id)}
    />,
  );
}

function BossPhase1({ onAdvance }: { onAdvance: () => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div>
      <p className="text-sm mb-3">A troll is spamming mean comments. Tap the troll tactic:</p>
      <div className="grid gap-2">
        {[{ id: 't', label: 'Provoking anger on purpose', correct: true }, { id: 'f', label: 'Giving helpful feedback', correct: false }].map((o) => (
          <button key={o.id} type="button" onClick={() => { setPicked(o.id); if (o.correct) setTimeout(onAdvance, 800); }} className={`p-3 rounded-xl text-left text-sm ${picked === o.id ? (o.correct ? 'bg-green-500/30' : 'bg-red-500/30') : 'bg-white/10'}`}>{o.label}</button>
        ))}
      </div>
    </div>
  );
}

function BossPhase2({ onAdvance }: { onAdvance: () => void }) {
  return (
    <div>
      <p className="text-sm mb-3">Match troll tactics to the best response:</p>
      <MemoryMatchGame pairs={[
        { id: 'm1', term: 'Insult bait', definition: 'Ignore and do not feed' },
        { id: 'm2', term: 'Fake rumor', definition: 'Report and support victim' },
      ]} onAllComplete={onAdvance} onCorrect={() => {}} onWrong={() => {}} />
    </div>
  );
}

function BossPhase3({ onAdvance }: { onAdvance: () => void }) {
  return (
    <div>
      <p className="text-sm mb-3">Final step: choose the city rescue action.</p>
      <BossAdvanceButton label="Report, block, and celebrate Cyber City saved!" onClick={onAdvance} />
    </div>
  );
}

export function BullyLevel6({ onBack, onComplete }: LevelProps) {
  const [phase, setPhase] = useState(0);
  const runner = useLevelRunner({ title: 'Cyber City Rescue', mechanic: 'Cyber City Rescue', hint: BULLY_META[5].hint, totalSteps: 3, currentStep: phase + 1, onBack, onComplete: async (s) => { await unlockAchievement('boss_slayer'); onComplete(s); } });

  const advance = () => {
    runner.showCorrect('Phase complete!', 15);
    if (phase >= 2) runner.finish();
    else setPhase((p) => p + 1);
  };

  return runner.wrap(
    <BossMissionGame
      title="Cyber City Rescue Mission"
      phases={[
        { id: 'p1', title: 'Phase 1: Spot the Troll', content: <BossPhase1 onAdvance={advance} /> },
        { id: 'p2', title: 'Phase 2: Protect & Support', content: <BossPhase2 onAdvance={advance} /> },
        { id: 'p3', title: 'Phase 3: Save the City', content: <BossPhase3 onAdvance={advance} /> },
      ]}
      onAllComplete={runner.finish}
    />,
  );
}

export const BULLY_LEVELS: Record<GameLevel, ComponentType<LevelProps>> = { 1: BullyLevel1, 2: BullyLevel2, 3: BullyLevel3, 4: BullyLevel4, 5: BullyLevel5, 6: BullyLevel6 };
