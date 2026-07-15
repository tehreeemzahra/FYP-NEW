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
  { level: 2, title: 'Impersonation', concept: 'Fake accounts copy identities to trick friends.', summary: 'Verify accounts through known channels before trusting copied profiles.', hint: 'New accounts with copied photos are suspicious.', tips: ['Compare both profiles each round', 'Identify the impersonator', 'Report fake accounts', 'Answer all 5 comparison questions'], ageGroup: '8-10', reward: BULLY_REWARDS[1], mechanic: 'Profile Comparison' },
  { level: 3, title: 'Denigration', concept: 'False rumors damage reputations and spread harm.', summary: 'Identify harmful rumor language and refuse to spread it.', hint: 'Tap words that spread false rumors.', tips: ['Find harmful phrases in each message', 'Do not spread unverified rumors', 'Support the person being targeted'], ageGroup: '8-10', reward: BULLY_REWARDS[2], mechanic: 'Rumor Investigation' },
  { level: 4, title: 'Outing', concept: 'Sharing private chats without permission violates privacy.', summary: 'Sort content into private vs safe-to-share categories.', hint: 'Private conversations should never be posted publicly.', tips: ['Sort each item into the right category', 'Protect private conversations', 'Ask permission before sharing others content'], ageGroup: '9-11', reward: BULLY_REWARDS[3], mechanic: 'Privacy Boundary Sort' },
  { level: 5, title: 'Cyberstalking', concept: 'Online tracking and fear messages are serious threats.', summary: 'Respond quickly to stalking: document, block, report, tell adults.', hint: 'You have limited time — choose the safest action.', tips: ['Read each incident carefully', 'Block and report stalkers', 'Tell a trusted adult immediately'], ageGroup: '9-11', reward: BULLY_REWARDS[4], mechanic: 'Threat Response' },
  { level: 6, title: 'Trolling & Boss Mission', concept: 'Combine all cyberbully skills in a final rescue mission.', summary: 'Use everything you learned to protect Cyber City from bullies and trolls.', hint: 'Complete all three mission phases.', tips: ['Phase 1: Spot the troll', 'Phase 2: Protect a friend', 'Phase 3: Report and block'], ageGroup: '10-12', reward: BULLY_REWARDS[5], mechanic: 'Cyber City Rescue' },
];

export function BullyLevel1({ onBack, onComplete }: LevelProps) {
  const [step, setStep] = useState(1);
  const runner = useLevelRunner({ title: 'Harassment Chat', mechanic: 'Group Chat Navigator', hint: BULLY_META[0].hint, totalSteps: 5, currentStep: step, onBack, onComplete: async (s) => { const a = getAchievementForMechanic('chat'); if (a) await unlockAchievement(a); onComplete(s); } });
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
        { id: 'h3', messages: [{ id: 'm3', from: 'them', text: 'Lol look at their old photo — share it in the class group for laughs.' }], choices: [
          { id: 'share', text: 'Haha yes share it!', isSafe: false, explanation: 'Sharing photos to mock someone is harassment.' },
          { id: 'refuse', text: 'No. That is mean — I will not share it.', isSafe: true, explanation: 'Refusing to pile on protects classmates.' },
        ]},
        { id: 'h4', messages: [{ id: 'm4', from: 'them', text: 'If you tell a teacher, we will make fun of you too.' }], choices: [
          { id: 'silent', text: 'Fine, I will stay quiet.', isSafe: false, explanation: 'Fear should not stop you from getting help.' },
          { id: 'tell', text: 'I am still telling a trusted adult.', isSafe: true, explanation: 'Trusted adults can stop the cycle of harassment.' },
        ]},
        { id: 'h5', messages: [{ id: 'm5', from: 'them', text: 'Why do you always defend people? Just leave them alone.' }], choices: [
          { id: 'leave', text: 'Okay, not my problem.', isSafe: false, explanation: 'Standing by lets bullying continue.' },
          { id: 'ally', text: 'Friends support each other. I report bullying.', isSafe: true, explanation: 'Being an upstander helps stop harassment.' },
        ]},
      ]}
      onNodeComplete={() => setStep((s) => Math.min(5, s + 1))}
      onAllComplete={runner.finish}
      onCorrect={(m) => runner.showCorrect(m, 20)}
      onWrong={(m, id) => runner.showWrong(m, id)}
    />,
  );
}

const IMPERSONATION_ROUNDS = [
  {
    id: 'imp1',
    prompt: 'Your friend says someone is pretending to be them. Which account is fake?',
    left: { id: 'fake1', url: 'chat.app/maya_real_official', title: 'Maya_Real_Official', details: ['Created today', 'DMs classmates for codes', 'Copied profile pic'], isLegit: false, explanation: 'Brand-new accounts copying photos and asking for codes are impersonators.' },
    right: { id: 'real1', url: 'chat.app/maya_j', title: 'maya_j', details: ['2 years of posts', 'Friends recognize stories', 'Never asks for passwords'], isLegit: true, explanation: 'Long history with recognizable content indicates the real account.' },
  },
  {
    id: 'imp2',
    prompt: 'A new profile messages your class offering “free game codes.” Which account is the impersonator?',
    left: { id: 'real2', url: 'chat.app/alex_gamer_09', title: 'alex_gamer_09', details: ['Posts weekly since 2023', 'Friends tag real matches', 'Warns about scams'], isLegit: true, explanation: 'Consistent history and trusted friends mark the real profile.' },
    right: { id: 'fake2', url: 'chat.app/alex.official.codes', title: 'Alex.Official.Codes', details: ['Joined this morning', 'Same photo as Alex', 'Asks for login to “verify”'], isLegit: false, explanation: 'New accounts that copy photos and ask for logins are fake.' },
  },
  {
    id: 'imp3',
    prompt: 'Someone claims to be your cousin on a chat app. Which profile looks real?',
    left: { id: 'fake3', url: 'chat.app/sam_family_vip', title: 'Sam_Family_VIP', details: ['Zero shared friends', 'Created yesterday', 'Wants gift card “for Mom”'], isLegit: false, explanation: 'Impersonators often ask for money or gift cards quickly.' },
    right: { id: 'real3', url: 'chat.app/sam.k', title: 'sam.k', details: ['Mutual family contacts', 'Years of photos together', 'Calls instead of asking for money'], isLegit: true, explanation: 'Real relatives share history and do not suddenly demand gift cards.' },
  },
  {
    id: 'imp4',
    prompt: 'Two profiles use your classmate Noah’s name. Tap the real one.',
    left: { id: 'real4', url: 'school.chat/noah.lee', title: 'noah.lee', details: ['School email verified', 'Posts from club events', 'Teachers know this account'], isLegit: true, explanation: 'Verified school-linked accounts with known activity are trustworthy.' },
    right: { id: 'fake4', url: 'school.chat/noah_lee_real2', title: 'noah_lee_real2', details: ['Misspelled bio details', 'Only 3 posts, all today', 'DMs asking for homework answers'], isLegit: false, explanation: 'Rushed posts and odd usernames are common impersonation signs.' },
  },
  {
    id: 'imp5',
    prompt: 'Your teammate says a fake captain account is messaging the squad. Which is fake?',
    left: { id: 'fake5', url: 'team.app/captain_official_now', title: 'Captain_Official_Now', details: ['Brand new badge spam', 'Demands team passwords', 'Copied team logo'], isLegit: false, explanation: 'Fake “captain” accounts often demand passwords and copy logos.' },
    right: { id: 'real5', url: 'team.app/jordan_captain', title: 'jordan_captain', details: ['Known since season start', 'Voice chats with the team', 'Never asks for passwords'], isLegit: true, explanation: 'Real captains communicate in known ways and never need your password.' },
  },
];

export function BullyLevel2({ onBack, onComplete }: LevelProps) {
  const [step, setStep] = useState(1);
  const runner = useLevelRunner({ title: 'Impersonation Detective', mechanic: 'Profile Comparison', hint: BULLY_META[1].hint, totalSteps: 5, currentStep: step, onBack, onComplete });
  return runner.wrap(
    <WebsiteCompareGame
      rounds={IMPERSONATION_ROUNDS}
      onRoundComplete={() => setStep((s) => Math.min(5, s + 1))}
      onAllComplete={runner.finish}
      onCorrect={(m) => runner.showCorrect(m, 20)}
      onWrong={(m, id) => runner.showWrong(m, id)}
    />,
  );
}

export function BullyLevel3({ onBack, onComplete }: LevelProps) {
  const [step, setStep] = useState(1);
  const runner = useLevelRunner({ title: 'Rumor Investigation', mechanic: 'Rumor Investigation', hint: BULLY_META[2].hint, totalSteps: 5, currentStep: step, onBack, onComplete: async (s) => { const a = getAchievementForMechanic('investigation'); if (a) await unlockAchievement(a); onComplete(s); } });
  return runner.wrap(
    <InvestigationGame
      rounds={[
        { id: 'rumor1', title: 'Group Chat Rumor', context: 'Someone posted this about a classmate:', segments: [
          { id: 'a1', text: 'I heard ', isSuspicious: false, explanation: '' },
          { id: 'b1', text: 'definitely cheated ', isSuspicious: true, explanation: 'Unverified accusations spread harm.' },
          { id: 'c1', text: 'on the test — ', isSuspicious: false, explanation: '' },
          { id: 'd1', text: 'pass it on!', isSuspicious: true, explanation: 'Asking others to spread rumors is denigration.' },
        ]},
        { id: 'rumor2', title: 'Locker Notes', context: 'A note was shared in the group:', segments: [
          { id: 'a2', text: 'Everyone knows ', isSuspicious: false, explanation: '' },
          { id: 'b2', text: 'they steal stuff ', isSuspicious: true, explanation: 'False labels damage reputations.' },
          { id: 'c2', text: 'from bags. ', isSuspicious: false, explanation: '' },
          { id: 'd2', text: 'Tell the whole class.', isSuspicious: true, explanation: 'Pushing others to spread gossip is denigration.' },
        ]},
        { id: 'rumor3', title: 'Story Reply', context: 'A story reply about a teammate:', segments: [
          { id: 'a3', text: 'Not confirmed, but ', isSuspicious: false, explanation: '' },
          { id: 'b3', text: 'they got kicked for lying ', isSuspicious: true, explanation: 'Rumor details presented as fact hurt people.' },
          { id: 'c3', text: 'lol. ', isSuspicious: false, explanation: '' },
          { id: 'd3', text: 'Repost this.', isSuspicious: true, explanation: 'Asking for reposts spreads denigration.' },
        ]},
        { id: 'rumor4', title: 'Anonymous Post', context: 'An anonymous page posted:', segments: [
          { id: 'a4', text: 'Secret tea: ', isSuspicious: false, explanation: '' },
          { id: 'b4', text: 'Jordan is failing everything ', isSuspicious: true, explanation: 'Sharing supposed “secrets” about grades is harmful.' },
          { id: 'c4', text: 'and parents do not know. ', isSuspicious: false, explanation: '' },
          { id: 'd4', text: 'Keep circulating.', isSuspicious: true, explanation: 'Circulating private accusations is denigration.' },
        ]},
        { id: 'rumor5', title: 'Voice Note Claim', context: 'A classmate’s voice note said:', segments: [
          { id: 'a5', text: 'I am not sure, still ', isSuspicious: false, explanation: '' },
          { id: 'b5', text: 'Mia copied the whole project ', isSuspicious: true, explanation: 'Accusations without proof harm reputations.' },
          { id: 'c5', text: 'so do not trust her. ', isSuspicious: false, explanation: '' },
          { id: 'd5', text: 'Forward to other groups!', isSuspicious: true, explanation: 'Forwarding rumors multiplies the harm.' },
        ]},
      ]}
      onRoundComplete={() => setStep((s) => Math.min(5, s + 1))}
      onAllComplete={runner.finish}
      onCorrect={(m) => runner.showCorrect(m, 20)}
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
  const runner = useLevelRunner({ title: 'Stalker Response', mechanic: 'Threat Response', hint: BULLY_META[4].hint, totalSteps: 5, currentStep: step, onBack, onComplete: async (s) => { const a = getAchievementForMechanic('threat'); if (a) await unlockAchievement(a); onComplete(s); } });
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
        { id: 'st3', title: 'Location hunting', description: 'Someone asks friends which park you go to after school and keeps messaging when you go offline.', timeLimit: 12, actions: [
          { id: 'c1', label: 'Tell friends not to share, lock account, tell an adult', isCorrect: true, explanation: 'Stop the info leak and get adult help quickly.' },
          { id: 'c2', label: 'Post your live location to confront them', isCorrect: false, explanation: 'Live location helps stalkers find you.' },
        ]},
        { id: 'st4', title: 'New accounts after a block', description: 'You blocked one account, but three new ones appeared with the same threats.', timeLimit: 12, actions: [
          { id: 'd1', label: 'Keep arguing with every new account', isCorrect: false, explanation: 'Engaging feeds the stalker.' },
          { id: 'd2', label: 'Save evidence, tighten privacy, report to platform and adult', isCorrect: true, explanation: 'Evidence and reporting stop repeat accounts.' },
        ]},
        { id: 'st5', title: 'School gate wait claim', description: 'A message says: “I will wait by the gate until you come out alone.”', timeLimit: 10, actions: [
          { id: 'e1', label: 'Go alone to see who it is', isCorrect: false, explanation: 'Never meet a threat alone.' },
          { id: 'e2', label: 'Tell parent/teacher immediately and do not go alone', isCorrect: true, explanation: 'Safety first — adults and never isolation.' },
        ]},
      ]}
      onRoundComplete={() => setStep((s) => Math.min(5, s + 1))}
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
