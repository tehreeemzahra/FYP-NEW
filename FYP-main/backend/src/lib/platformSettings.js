import { AdminSettings, normalizeAdminSettings } from '../models/AdminSettings.js';
import { MODULE_NAMES } from './activityLog.js';

export async function getPlatformSettings() {
  let doc = await AdminSettings.findOne({ singleton: 'main' }).lean();
  if (!doc) {
    doc = { singleton: 'main' };
  }
  const platform = normalizeAdminSettings(doc);
  return {
    ...platform,
    announcementUpdatedAt: platform.parentAnnouncement?.trim() ? doc.updatedAt || null : null,
  };
}

export function parseLastPlayedModule(lastPlayed) {
  if (!lastPlayed || typeof lastPlayed !== 'string') return null;
  const pipe = lastPlayed.indexOf('|');
  if (pipe > 0) {
    const key = lastPlayed.slice(0, pipe);
    if (MODULE_NAMES[key]) return key;
  }
  return null;
}

/** Strip progress updates for modules the admin has paused. */
export function sanitizeProgressBody(body, existing, platform) {
  const enabled = platform.modulesEnabled;
  const sanitized = {
    completedLevels: Array.isArray(body.completedLevels) ? body.completedLevels : [],
    lastPlayed: typeof body.lastPlayed === 'string' ? body.lastPlayed : '',
    modules: typeof body.modules === 'object' && body.modules ? { ...body.modules } : {},
    inventory: Array.isArray(body.inventory) ? body.inventory : [],
    totalScore: typeof body.totalScore === 'number' ? body.totalScore : 0,
  };

  if (!enabled.passwordCastle && existing) {
    sanitized.completedLevels = existing.completedLevels || [];
  }

  const moduleKeys = ['scamSafari', 'privacyVillage', 'cyberbullyBattle'];
  for (const key of moduleKeys) {
    if (!enabled[key] && existing?.modules?.[key]) {
      sanitized.modules[key] = existing.modules[key];
    }
  }

  const attemptedModule = parseLastPlayedModule(sanitized.lastPlayed);
  if (attemptedModule && !enabled[attemptedModule]) {
    sanitized.lastPlayed = existing?.lastPlayed || '';
  }

  return sanitized;
}

export function publicPlatformPayload(platform) {
  return {
    maintenanceMode: platform.maintenanceMode,
    modulesEnabled: platform.modulesEnabled,
    featuredModule: platform.featuredModule,
    parentAnnouncement: platform.parentAnnouncement || '',
    announcementUpdatedAt: platform.announcementUpdatedAt || null,
  };
}
