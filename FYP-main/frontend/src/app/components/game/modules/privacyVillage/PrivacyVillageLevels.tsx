import { useState, type ComponentType } from 'react';
import { SequencePuzzleGame } from '../../mechanics/SequencePuzzleGame';
import { PermissionToggleGame } from '../../mechanics/PermissionToggleGame';
import { WebsiteCompareGame } from '../../mechanics/WebsiteCompareGame';
import { PasswordBuilderGame } from '../../mechanics/PasswordBuilderGame';
import { RedactionGame } from '../../mechanics/RedactionGame';
import { NetworkPickerGame } from '../../mechanics/RedactionGame';
import { useLevelRunner } from '../../shell/useLevelRunner';
import { unlockAchievement, getAchievementForMechanic } from '../../achievementService';
import type { GameLevel, LevelCompleteStats, LevelMeta } from '../../types';

type LevelProps = { onBack: () => void; onComplete: (stats: LevelCompleteStats) => void };

export const PRIVACY_REWARDS = ['Data Defender', 'Tracker Blocker', 'Identity Shield', 'Password Guardian', 'Safe Sharer Medal', 'Secure WiFi Crown'];

export const PRIVACY_META: LevelMeta[] = [
  { level: 1, title: 'Data Breach', concept: 'When data leaks, act fast to secure accounts and get adult help.', summary: 'After a breach: alert adults, change passwords, and never share leaked credentials.', hint: 'Order matters in a breach response.', tips: ['Put response steps in the right order', 'Start with alerting a trusted adult', 'Change compromised passwords quickly'], ageGroup: '7-9', reward: PRIVACY_REWARDS[0], mechanic: 'Breach Response Timeline' },
  { level: 2, title: 'Tracking & Surveillance', concept: 'Apps may track you — only grant permissions they truly need.', summary: 'Review app permissions and disable unnecessary tracking.', hint: 'Puzzle games should not need your camera and contacts.', tips: ['Toggle each permission on or off', 'Keep only what the app needs', 'Approve when settings look safe'], ageGroup: '8-10', reward: PRIVACY_REWARDS[1], mechanic: 'Permission Control' },
  { level: 3, title: 'Identity Theft', concept: 'Fake accounts copy photos and names to impersonate you.', summary: 'Report fake accounts and warn trusted adults when someone copies your identity.', hint: 'Compare profiles carefully for impersonation signs.', tips: ['Study both profile previews', 'Spot the fake impersonator', 'Report suspicious accounts'], ageGroup: '8-10', reward: PRIVACY_REWARDS[2], mechanic: 'Profile Detective' },
  { level: 4, title: 'Weak Passwords', concept: 'Reused simple passwords are easy for attackers to guess.', summary: 'Build long unique passwords with mixed character types.', hint: 'Meet all five password rules to lock in.', tips: ['Tap tiles to build your password', 'Include upper, lower, number, symbol', 'Make it at least 8 characters'], ageGroup: '8-10', reward: PRIVACY_REWARDS[3], mechanic: 'Password Construction' },
  { level: 5, title: 'Oversharing Online', concept: 'Too much personal detail in posts helps strangers find and target you.', summary: 'Blur private details like phone numbers and addresses before sharing.', hint: 'Tap to blur anything that reveals private info.', tips: ['Find private details in the post', 'Blur them before sharing', 'Submit when all private info is hidden'], ageGroup: '9-11', reward: PRIVACY_REWARDS[4], mechanic: 'Photo Redaction' },
  { level: 6, title: 'Unsecured Public WiFi', concept: 'Open WiFi networks can let others spy on your data.', summary: 'Use trusted networks for sensitive logins and avoid fake hotspot names.', hint: 'Open networks with odd names are risky.', tips: ['Compare available networks', 'Pick the safest connection', 'Avoid logging into banks on open WiFi'], ageGroup: '9-11', reward: PRIVACY_REWARDS[5], mechanic: 'Network Picker' },
];

export function PrivacyLevel1({ onBack, onComplete }: LevelProps) {
  const runner = useLevelRunner({ title: 'Breach Response', mechanic: 'Breach Response Timeline', hint: PRIVACY_META[0].hint, totalSteps: 1, currentStep: 1, onBack, onComplete });
  return runner.wrap(
    <SequencePuzzleGame
      title="What should you do after a data breach?"
      steps={[
        { id: 's1', label: 'Tell a trusted parent or teacher', order: 1 },
        { id: 's2', label: 'Change passwords on affected accounts', order: 2 },
        { id: 's3', label: 'Check for suspicious login alerts', order: 3 },
        { id: 's4', label: 'Never share leaked passwords with anyone', order: 4 },
      ]}
      onAllComplete={runner.finish}
      onCorrect={(m) => runner.showCorrect(m, 25)}
      onWrong={(m, id) => runner.showWrong(m, id)}
    />,
  );
}

export function PrivacyLevel2({ onBack, onComplete }: LevelProps) {
  const runner = useLevelRunner({ title: 'App Permissions', mechanic: 'Permission Control', hint: PRIVACY_META[1].hint, totalSteps: 1, currentStep: 1, onBack, onComplete: async (s) => { await unlockAchievement('sorter'); onComplete(s); } });
  return runner.wrap(
    <PermissionToggleGame
      appName="Puzzle Quest Lite"
      permissions={[
        { id: 'loc', name: 'Location (always)', description: 'Tracks where you go', needed: false, explanation: 'A puzzle game does not need constant location tracking.' },
        { id: 'cam', name: 'Camera', description: 'Access your camera', needed: false, explanation: 'Camera access is unnecessary for a simple puzzle game.' },
        { id: 'stor', name: 'Storage', description: 'Save game progress', needed: true, explanation: 'Saving progress is a reasonable permission for games.' },
        { id: 'cont', name: 'Contacts', description: 'Read your contacts', needed: false, explanation: 'Contacts access is a major privacy risk for puzzle games.' },
      ]}
      onAllComplete={runner.finish}
      onCorrect={(m) => runner.showCorrect(m, 25)}
      onWrong={(m, id) => runner.showWrong(m, id)}
    />,
  );
}

export function PrivacyLevel3({ onBack, onComplete }: LevelProps) {
  const [step, setStep] = useState(1);
  const runner = useLevelRunner({ title: 'Fake Profile Spotter', mechanic: 'Profile Detective', hint: PRIVACY_META[2].hint, totalSteps: 1, currentStep: step, onBack, onComplete });
  return runner.wrap(
    <WebsiteCompareGame
      rounds={[{
        id: 'profile',
        prompt: 'Which profile is likely the real account vs an impersonator?',
        left: { id: 'fake', url: 'social.app/@aisha_official_free', title: '@aisha_official_free', details: ['Created yesterday', 'Asks friends for money', 'Copied profile photo'], isLegit: false, explanation: 'New accounts asking for money while copying photos are impersonators.' },
        right: { id: 'real', url: 'social.app/@aisha_k', title: '@aisha_k', details: ['Years of normal posts', 'Friends you recognize', 'No money requests'], isLegit: true, explanation: 'Long history with known friends indicates the real account.' },
      }]}
      onRoundComplete={() => setStep(2)}
      onAllComplete={runner.finish}
      onCorrect={(m) => runner.showCorrect(m, 25)}
      onWrong={(m, id) => runner.showWrong(m, id)}
    />,
  );
}

export function PrivacyLevel4({ onBack, onComplete }: LevelProps) {
  const runner = useLevelRunner({ title: 'Password Guardian', mechanic: 'Password Construction', hint: PRIVACY_META[3].hint, totalSteps: 1, currentStep: 1, onBack, onComplete: async (s) => { const a = getAchievementForMechanic('builder'); if (a) await unlockAchievement(a); onComplete(s); } });
  return runner.wrap(
    <PasswordBuilderGame rounds={2} onRoundComplete={() => {}} onAllComplete={runner.finish} onCorrect={(m) => runner.showCorrect(m, 20)} onWrong={(m, id) => runner.showWrong(m, id)} />,
  );
}

export function PrivacyLevel5({ onBack, onComplete }: LevelProps) {
  const runner = useLevelRunner({ title: 'Safe Sharing', mechanic: 'Photo Redaction', hint: PRIVACY_META[4].hint, totalSteps: 1, currentStep: 1, onBack, onComplete });
  return runner.wrap(
    <RedactionGame
      imageTitle="Park selfie"
      zones={[
        { id: 'z1', label: 'House number in background', isPrivate: true, explanation: 'Addresses should be blurred before posting.' },
        { id: 'z2', label: 'Your hobby (drawing)', isPrivate: false, explanation: 'Sharing hobbies without private details is fine.' },
        { id: 'z3', label: 'Phone number on screen', isPrivate: true, explanation: 'Phone numbers must never be public.' },
        { id: 'z4', label: 'School name tag', isPrivate: true, explanation: 'School identifiers help strangers find you.' },
      ]}
      onAllComplete={runner.finish}
      onCorrect={(m) => runner.showCorrect(m, 25)}
      onWrong={(m, id) => runner.showWrong(m, id)}
    />,
  );
}

export function PrivacyLevel6({ onBack, onComplete }: LevelProps) {
  const runner = useLevelRunner({ title: 'WiFi Safety', mechanic: 'Network Picker', hint: PRIVACY_META[5].hint, totalSteps: 1, currentStep: 1, onBack, onComplete });
  return runner.wrap(
    <NetworkPickerGame
      prompt="You need to check homework online at a café. Which network is safest?"
      networks={[
        { id: 'n1', name: 'Free_WiFi_NoPassword', secure: false, signal: 4, explanation: 'Open WiFi with no password lets others spy on your data.' },
        { id: 'n2', name: 'Cafe_Official_Guest', secure: true, signal: 3, explanation: 'Official guest networks with passwords are safer than random open networks.' },
        { id: 'n3', name: 'Cafe_Free_WiFi-2', secure: false, signal: 4, explanation: 'Similar-looking fake hotspot names are a common trick.' },
      ]}
      onAllComplete={runner.finish}
      onCorrect={(m) => runner.showCorrect(m, 25)}
      onWrong={(m, id) => runner.showWrong(m, id)}
    />,
  );
}

export const PRIVACY_LEVELS: Record<GameLevel, ComponentType<LevelProps>> = { 1: PrivacyLevel1, 2: PrivacyLevel2, 3: PrivacyLevel3, 4: PrivacyLevel4, 5: PrivacyLevel5, 6: PrivacyLevel6 };
