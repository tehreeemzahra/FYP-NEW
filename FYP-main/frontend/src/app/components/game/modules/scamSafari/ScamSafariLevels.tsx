import { useState, type ComponentType } from 'react';
import { InvestigationGame } from '../../mechanics/InvestigationGame';
import { ChatSimulatorGame } from '../../mechanics/ChatSimulatorGame';
import { DragSortGame } from '../../mechanics/DragSortGame';
import { MemoryMatchGame } from '../../mechanics/MemoryMatchGame';
import { WebsiteCompareGame } from '../../mechanics/WebsiteCompareGame';
import { useLevelRunner } from '../../shell/useLevelRunner';
import { unlockAchievement, getAchievementForMechanic } from '../../achievementService';
import type { GameLevel, LevelCompleteStats, LevelMeta } from '../../types';

type LevelProps = {
  onBack: () => void;
  onComplete: (stats: LevelCompleteStats) => void;
};

export const SCAM_REWARDS = [
  'Jungle Alert Badge',
  'Name Trick Defender',
  'Authority Check Medal',
  'Text Shield Charm',
  'Call Guard Lantern',
  'Scam Safari Master Crown',
];

export const SCAM_META: LevelMeta[] = [
  {
    level: 1,
    title: 'Message Scam',
    concept: 'Fake mass messages use urgency and fake prizes to trick many people at once.',
    summary: 'Mass scam messages often promise prizes and demand quick clicks from unknown senders.',
    hint: 'Free gifts with urgent deadlines are classic scam signs.',
    tips: ['Tap suspicious words in each message', 'Look for urgency and unknown senders', 'Submit when all red flags are found'],
    ageGroup: '6-8',
    reward: SCAM_REWARDS[0],
    mechanic: 'Cyber Investigation',
  },
  {
    level: 2,
    title: 'Personal Trick Scam',
    concept: 'Scammers use your name to seem trustworthy — but personalization does not mean safe.',
    summary: 'Even messages with your name can be scams if they ask for secrets or use pressure.',
    hint: 'Your name in a message does not prove it is real.',
    tips: ['Read the full conversation', 'Choose responses that protect your data', 'Never share OTP or passwords'],
    ageGroup: '7-9',
    reward: SCAM_REWARDS[1],
    mechanic: 'Chat Safety Simulator',
  },
  {
    level: 3,
    title: 'Important Person Scam',
    concept: 'Fake authority figures like principals or officers are used to create fear and obedience.',
    summary: 'Verify urgent requests from "important people" through trusted official channels.',
    hint: 'Real officials do not demand secrets in random messages.',
    tips: ['Sort each action into safe or unsafe', 'Fear and urgency are manipulation tools', 'Report fake authority messages'],
    ageGroup: '8-10',
    reward: SCAM_REWARDS[2],
    mechanic: 'Security Sorting',
  },
  {
    level: 4,
    title: 'Text Message Scam',
    concept: 'SMS scams hide dangerous links and payment traps in short messages.',
    summary: 'Unknown short links and PIN requests in texts are major warning signs.',
    hint: 'Match each scam sign to what it means.',
    tips: ['Flip cards to find matching pairs', 'Remember what makes SMS messages unsafe', 'Complete all matches to finish'],
    ageGroup: '8-10',
    reward: SCAM_REWARDS[3],
    mechanic: 'Memory Match',
  },
  {
    level: 5,
    title: 'Phone Call Scam',
    concept: 'Real companies never ask for OTP, PIN, or passwords over the phone.',
    summary: 'Hang up on callers who demand secret codes or immediate payments.',
    hint: 'Threats plus secret code requests = scam call.',
    tips: ['Listen to each caller scenario', 'Choose the safest response', 'Verify with a trusted adult'],
    ageGroup: '9-11',
    reward: SCAM_REWARDS[4],
    mechanic: 'Phone Call Simulator',
  },
  {
    level: 6,
    title: 'Fake Website Scam',
    concept: 'Typosquatting and look-alike URLs trick users into entering secrets on fake sites.',
    summary: 'Check URLs carefully — misspelled domains and scare pop-ups are fake site traps.',
    hint: 'Compare URLs character by character.',
    tips: ['Study both website previews', 'Pick the legitimate site', 'Watch for misspelled URLs'],
    ageGroup: '9-11',
    reward: SCAM_REWARDS[5],
    mechanic: 'Website Detective',
  },
];

export function ScamLevel1({ onBack, onComplete }: LevelProps) {
  const [step, setStep] = useState(1);
  const runner = useLevelRunner({
    title: 'Message Scam Investigation',
    mechanic: 'Cyber Investigation',
    hint: SCAM_META[0].hint,
    totalSteps: 2,
    currentStep: step,
    onBack,
    onComplete: async (stats) => {
      const ach = getAchievementForMechanic('investigation');
      if (ach) await unlockAchievement(ach);
      onComplete(stats);
    },
  });

  return runner.wrap(
    <InvestigationGame
      rounds={[
        {
          id: 'r1',
          title: 'Inbox Message #1',
          context: 'An unknown number sent this to your whole class group:',
          segments: [
            { id: 'a', text: 'CONGRATS! ', isSuspicious: false, explanation: '' },
            { id: 'b', text: 'You won a giant toy box! ', isSuspicious: true, explanation: 'Unrealistic prizes from strangers are scam bait.' },
            { id: 'c', text: 'Click now in ', isSuspicious: true, explanation: 'Urgency pressures you to act without thinking.' },
            { id: 'd', text: '1 minute!', isSuspicious: true, explanation: 'Extreme deadlines are a classic scam trick.' },
          ],
        },
        {
          id: 'r2',
          title: 'Inbox Message #2',
          context: 'Another message just arrived:',
          segments: [
            { id: 'a', text: 'Claim ', isSuspicious: false, explanation: '' },
            { id: 'b', text: '1000 coins ', isSuspicious: true, explanation: 'Free currency from strangers is unrealistic.' },
            { id: 'c', text: 'from ', isSuspicious: false, explanation: '' },
            { id: 'd', text: 'unknown sender', isSuspicious: true, explanation: 'Unknown senders cannot be trusted with rewards.' },
            { id: 'e', text: ' now.', isSuspicious: true, explanation: 'Pressure to act immediately is a red flag.' },
          ],
        },
      ]}
      onRoundComplete={() => setStep((s) => s + 1)}
      onAllComplete={runner.finish}
      onCorrect={(m) => runner.showCorrect(m, 20)}
      onWrong={(m, id) => runner.showWrong(m, id)}
    />,
  );
}

export function ScamLevel2({ onBack, onComplete }: LevelProps) {
  const [step, setStep] = useState(1);
  const runner = useLevelRunner({
    title: 'Personal Trick Chat',
    mechanic: 'Chat Safety Simulator',
    hint: SCAM_META[1].hint,
    totalSteps: 2,
    currentStep: step,
    onBack,
    onComplete: async (stats) => {
      const ach = getAchievementForMechanic('chat');
      if (ach) await unlockAchievement(ach);
      onComplete(stats);
    },
  });

  return runner.wrap(
    <ChatSimulatorGame
      nodes={[
        {
          id: 'n1',
          messages: [{ id: 'm1', from: 'them', text: 'Hi Aisha! We know your class. Open this secret exam file now before it expires.' }],
          choices: [
            { id: 'c1', text: 'Sure, here is my password too!', isSafe: false, explanation: 'Never share passwords — personal details do not make a message safe.' },
            { id: 'c2', text: 'I will ask my teacher in the official school app first.', isSafe: true, reply: 'Okay, but hurry!', explanation: 'Verifying through trusted channels is the right move.' },
          ],
        },
        {
          id: 'n2',
          messages: [{ id: 'm2', from: 'them', text: 'Aisha, friend in trouble! Send OTP now to help me log in.' }],
          choices: [
            { id: 'c3', text: 'Sending OTP right now!', isSafe: false, explanation: 'OTP codes must never be shared — even familiar names can be faked.' },
            { id: 'c4', text: 'I will call you on your saved number to verify.', isSafe: true, reply: 'Never mind then...', explanation: 'Verifying identity offline stops many impersonation scams.' },
          ],
        },
      ]}
      onNodeComplete={() => setStep((s) => s + 1)}
      onAllComplete={runner.finish}
      onCorrect={(m) => runner.showCorrect(m, 20)}
      onWrong={(m, id) => runner.showWrong(m, id)}
    />,
  );
}

export function ScamLevel3({ onBack, onComplete }: LevelProps) {
  const runner = useLevelRunner({
    title: 'Authority Impersonation Sort',
    mechanic: 'Security Sorting',
    hint: SCAM_META[2].hint,
    totalSteps: 1,
    currentStep: 1,
    onBack,
    onComplete: async (stats) => {
      const ach = getAchievementForMechanic('sort');
      if (ach) await unlockAchievement(ach);
      onComplete(stats);
    },
  });

  return runner.wrap(
    <DragSortGame
      safeLabel="Safe Action"
      unsafeLabel="Scam / Report"
      items={[
        { id: '1', label: 'Principal asks for student IDs via unknown email', bucket: 'unsafe', explanation: 'Urgent data requests from unknown channels are fake authority scams.' },
        { id: '2', label: 'Teacher posts homework in official class portal', bucket: 'safe', explanation: 'Expected updates in trusted school portals are normal.' },
        { id: '3', label: 'Officer demands immediate fine payment by message', bucket: 'unsafe', explanation: 'Fear and payment pressure indicate impersonation.' },
        { id: '4', label: 'School admin sends field trip form in verified app', bucket: 'safe', explanation: 'Verified school apps are trusted communication channels.' },
        { id: '5', label: 'Fake exam board asks students to pay for marks', bucket: 'unsafe', explanation: 'Real boards never demand urgent direct payments in chats.' },
        { id: '6', label: 'Coach shares schedule in official team group', bucket: 'safe', explanation: 'Known coaches in official groups send expected updates.' },
      ]}
      onAllComplete={runner.finish}
      onCorrect={(m) => runner.showCorrect(m, 25)}
      onWrong={(m, id) => runner.showWrong(m, id)}
    />,
  );
}

export function ScamLevel4({ onBack, onComplete }: LevelProps) {
  const runner = useLevelRunner({
    title: 'SMS Scam Memory',
    mechanic: 'Memory Match',
    hint: SCAM_META[3].hint,
    totalSteps: 1,
    currentStep: 1,
    onBack,
    onComplete: async (stats) => {
      const ach = getAchievementForMechanic('memory');
      if (ach) await unlockAchievement(ach);
      onComplete(stats);
    },
  });

  return runner.wrap(
    <MemoryMatchGame
      pairs={[
        { id: 'p1', term: 'Short suspicious link', definition: 'Unknown URLs in texts can steal data' },
        { id: 'p2', term: 'PIN request in SMS', definition: 'Legitimate services never ask for PINs by text' },
        { id: 'p3', term: 'Parcel fee trap', definition: 'Fake delivery fees trick people into paying' },
        { id: 'p4', term: 'Known family message', definition: 'Simple messages from saved contacts can be safer' },
      ]}
      onAllComplete={runner.finish}
      onCorrect={(m) => runner.showCorrect(m, 15)}
      onWrong={(m, id) => runner.showWrong(m, id)}
    />,
  );
}

export function ScamLevel5({ onBack, onComplete }: LevelProps) {
  const [step, setStep] = useState(1);
  const runner = useLevelRunner({
    title: 'Phone Call Simulator',
    mechanic: 'Phone Call Simulator',
    hint: SCAM_META[4].hint,
    totalSteps: 2,
    currentStep: step,
    onBack,
    onComplete: async (stats) => {
      const ach = getAchievementForMechanic('chat');
      if (ach) await unlockAchievement(ach);
      onComplete(stats);
    },
  });

  return runner.wrap(
    <ChatSimulatorGame
      mode="phone"
      nodes={[
        {
          id: 'call1',
          messages: [{ id: 'c1', from: 'system', text: '📞 Incoming: Unknown number — "Bank Security"' }, { id: 'c2', from: 'them', text: 'This is your bank. Tell me your OTP right now or we freeze your account.' }],
          choices: [
            { id: 'hang', text: 'Hang up and tell a trusted adult', isSafe: true, explanation: 'Banks never ask for OTP on unsolicited calls.' },
            { id: 'share', text: 'Share OTP to fix account', isSafe: false, explanation: 'OTP codes must never be shared on phone calls.' },
          ],
        },
        {
          id: 'call2',
          messages: [{ id: 'c3', from: 'system', text: '📞 Incoming: Unknown number' }, { id: 'c4', from: 'them', text: 'Pay quickly to keep your game account active or lose everything!' }],
          choices: [
            { id: 'pay', text: 'Pay immediately', isSafe: false, explanation: 'Money pressure through unknown calls is a scam tactic.' },
            { id: 'block', text: 'Hang up and block the number', isSafe: true, explanation: 'Blocking scam callers protects you from repeat attempts.' },
          ],
        },
      ]}
      onNodeComplete={() => setStep((s) => s + 1)}
      onAllComplete={runner.finish}
      onCorrect={(m) => runner.showCorrect(m, 20)}
      onWrong={(m, id) => runner.showWrong(m, id)}
    />,
  );
}

export function ScamLevel6({ onBack, onComplete }: LevelProps) {
  const [step, setStep] = useState(1);
  const runner = useLevelRunner({
    title: 'Fake Website Detective',
    mechanic: 'Website Detective',
    hint: SCAM_META[5].hint,
    totalSteps: 2,
    currentStep: step,
    onBack,
    onComplete: onComplete,
  });

  return runner.wrap(
    <WebsiteCompareGame
      rounds={[
        {
          id: 'w1',
          prompt: 'Which game store website is safe to use?',
          left: {
            id: 'fake',
            url: 'game-st0re-prize.net',
            title: 'MEGA PRIZES!!!',
            details: ['Misspelled URL', 'Urgent verify popup', 'Asks full password instantly'],
            isLegit: false,
            explanation: 'Misspelled URLs and instant password demands are fake site traps.',
          },
          right: {
            id: 'real',
            url: 'store.officialgames.com',
            title: 'Official Game Store',
            details: ['Correct domain', 'Padlock HTTPS', 'Normal login flow'],
            isLegit: true,
            explanation: 'Trusted URLs from official sources with HTTPS are safer.',
          },
        },
        {
          id: 'w2',
          prompt: 'Which site should you leave immediately?',
          left: {
            id: 'scare',
            url: 'virus-alert-now.xyz',
            title: 'VIRUS DETECTED!',
            details: ['Scare pop-up', 'Demands card for cleaning', 'Not your antivirus app'],
            isLegit: false,
            explanation: 'Scare pop-ups asking for payment are scam websites.',
          },
          right: {
            id: 'library',
            url: 'library.school.edu',
            title: 'School Library Portal',
            details: ['Bookmarked URL', 'Known school domain', 'Normal book search'],
            isLegit: true,
            explanation: 'Bookmarked trusted school sites help avoid fake copies.',
          },
        },
      ]}
      onRoundComplete={() => setStep((s) => s + 1)}
      onAllComplete={runner.finish}
      onCorrect={(m) => runner.showCorrect(m, 20)}
      onWrong={(m, id) => runner.showWrong(m, id)}
    />,
  );
}

export const SCAM_LEVELS: Record<GameLevel, ComponentType<LevelProps>> = {
  1: ScamLevel1,
  2: ScamLevel2,
  3: ScamLevel3,
  4: ScamLevel4,
  5: ScamLevel5,
  6: ScamLevel6,
};
