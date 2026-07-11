/** Activity log helpers — records child events parents see as notifications. */

export const LEVELS_PER_MODULE = 6;

export const MODULE_NAMES = {
  passwordCastle: 'Password Castle',
  scamSafari: 'Scam Safari',
  privacyVillage: 'Privacy Village',
  cyberbullyBattle: 'Cyberbully Battle',
};

const MAX_LOG = 50;

function parseLastPlayedModule(lastPlayed) {
  if (!lastPlayed || typeof lastPlayed !== 'string') return null;
  const pipe = lastPlayed.indexOf('|');
  if (pipe > 0) {
    const key = lastPlayed.slice(0, pipe);
    if (MODULE_NAMES[key]) return key;
  }
  return null;
}

function diffCompletedLevels(oldArr, newArr) {
  const oldSet = new Set(oldArr || []);
  return (newArr || []).filter((level) => !oldSet.has(level));
}

/** Compare saved vs incoming progress and build notification events. */
export function eventsFromProgressDiff(existing, body, childName) {
  const events = [];
  const name = childName || 'Learner';

  const newPasswordLevels = diffCompletedLevels(existing?.completedLevels, body.completedLevels);
  for (const level of newPasswordLevels) {
    events.push({
      type: 'level_complete',
      module: 'passwordCastle',
      level,
      message: `${name} completed ${MODULE_NAMES.passwordCastle} — Level ${level}`,
    });
  }

  const passwordCount = (body.completedLevels || []).length;
  const oldPasswordCount = (existing?.completedLevels || []).length;
  if (passwordCount >= LEVELS_PER_MODULE && oldPasswordCount < LEVELS_PER_MODULE) {
    events.push({
      type: 'module_complete',
      module: 'passwordCastle',
      message: `${name} finished all levels in ${MODULE_NAMES.passwordCastle}!`,
    });
  }

  for (const key of ['scamSafari', 'privacyVillage', 'cyberbullyBattle']) {
    const oldLevels = existing?.modules?.[key]?.completedLevels || [];
    const newLevels = body.modules?.[key]?.completedLevels || [];
    const added = diffCompletedLevels(oldLevels, newLevels);

    for (const level of added) {
      events.push({
        type: 'level_complete',
        module: key,
        level,
        message: `${name} completed ${MODULE_NAMES[key]} — Level ${level}`,
      });
    }

    if (newLevels.length >= LEVELS_PER_MODULE && oldLevels.length < LEVELS_PER_MODULE) {
      events.push({
        type: 'module_complete',
        module: key,
        message: `${name} finished all levels in ${MODULE_NAMES[key]}!`,
      });
    }
  }

  const oldModule = parseLastPlayedModule(existing?.lastPlayed);
  const newModule = parseLastPlayedModule(body.lastPlayed);
  if (newModule && newModule !== oldModule) {
    events.push({
      type: 'module_play',
      module: newModule,
      message: `${name} started playing ${MODULE_NAMES[newModule]}`,
    });
  }

  return events;
}

export function mergeActivityLog(existingLog, newEvents) {
  const stamped = newEvents.map((event) => ({ ...event, at: new Date() }));
  return [...stamped, ...(existingLog || [])].slice(0, MAX_LOG);
}

export function loginActivity(childName) {
  return {
    type: 'login',
    message: `${childName || 'Learner'} logged in`,
  };
}

/** Seed activityLog from saved progress for learners who played before logging existed. */
export function backfillActivityFromProgress(doc, childName) {
  if (!doc || (doc.activityLog && doc.activityLog.length > 0)) {
    return doc?.activityLog || [];
  }

  const name = childName || 'Learner';
  const at = doc.updatedAt || doc.createdAt || new Date();
  const events = [];

  for (const level of doc.completedLevels || []) {
    events.push({
      type: 'level_complete',
      module: 'passwordCastle',
      level,
      message: `${name} completed ${MODULE_NAMES.passwordCastle} — Level ${level}`,
      at,
    });
  }

  for (const key of ['scamSafari', 'privacyVillage', 'cyberbullyBattle']) {
    const levels = doc.modules?.[key]?.completedLevels || [];
    for (const level of levels) {
      events.push({
        type: 'level_complete',
        module: key,
        level,
        message: `${name} completed ${MODULE_NAMES[key]} — Level ${level}`,
        at,
      });
    }
  }

  const module = parseLastPlayedModule(doc.lastPlayed);
  if (module) {
    events.push({
      type: 'module_play',
      module,
      message: `${name} played ${MODULE_NAMES[module]}`,
      at,
    });
  }

  if (events.length === 0) return [];

  return mergeActivityLog(
    [],
    events.sort((a, b) => (a.level || 0) - (b.level || 0)),
  ).map((e) => ({ ...e, at }));
}
