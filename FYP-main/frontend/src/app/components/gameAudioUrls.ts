/** Public-folder BGM filenames (must match files in `frontend/public/audio/`). */
function audioUrl(filename: string) {
  return `/audio/${encodeURIComponent(filename)}`;
}

/** Child dashboard home, Rewards, and Profile (not during full-screen games). */
export const MAIN_DASHBOARD_BGM = audioUrl('main background page.mp3.mp3');
export const CLICK_SOUND = audioUrl('click .mp3.wav');

export const GAME_BGM = {
  passwordCastle: audioUrl('password castle.mp3.mp3'),
  scamSafari: audioUrl('scam safari.mp3.mp3'),
  privacyVillage: audioUrl('privacy village .mp3.mp3'),
  cyberbullyBattle: audioUrl('cyber bully battle.mp3.mp3'),
} as const;
