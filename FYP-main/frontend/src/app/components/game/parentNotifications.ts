/**
 * Maps backend activityLog entries into parent-dashboard notifications.
 * Falls back to progress summary when no activity log exists yet (legacy accounts).
 */

import type { ParentProgressSummary } from './parentProgressSummary';
import { MODULE_DISPLAY_NAMES } from './lastPlayed';

export type ActivityEntry = {
  type: string;
  module?: string;
  level?: number;
  message: string;
  at: string | Date;
};

export type NotificationIcon = 'login' | 'level' | 'module' | 'complete' | 'play' | 'info';

export type ParentNotification = {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: NotificationIcon;
  at: Date;
};

function toDate(value: string | Date): Date {
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function iconForType(type: string): NotificationIcon {
  switch (type) {
    case 'login':
      return 'login';
    case 'level_complete':
      return 'level';
    case 'module_complete':
      return 'complete';
    case 'module_play':
      return 'play';
    default:
      return 'info';
  }
}

function categoryForType(type: string): string {
  switch (type) {
    case 'login':
      return 'Session';
    case 'level_complete':
      return 'Learning';
    case 'module_complete':
      return 'Milestone';
    case 'module_play':
      return 'Activity';
    default:
      return 'Update';
  }
}

function titleForEntry(entry: ActivityEntry): string {
  switch (entry.type) {
    case 'login':
      return 'Child logged in';
    case 'level_complete':
      return 'Level completed';
    case 'module_complete':
      return 'Module completed';
    case 'module_play':
      return 'Started playing';
    default:
      return 'Activity update';
  }
}

export function mapActivityToNotifications(entries: ActivityEntry[]): ParentNotification[] {
  return entries
    .map((entry, index) => ({
      id: `${entry.type}-${toDate(entry.at).getTime()}-${index}`,
      title: titleForEntry(entry),
      description: entry.message,
      category: categoryForType(entry.type),
      icon: iconForType(entry.type),
      at: toDate(entry.at),
    }))
    .sort((a, b) => b.at.getTime() - a.at.getTime());
}

/** Build notifications from progress when activityLog is empty (existing learners). */
export function fallbackNotificationsFromProgress(
  summary: ParentProgressSummary,
  childName: string,
): ParentNotification[] {
  const items: ParentNotification[] = [];
  const at = summary.lastPlayedAt ?? new Date();

  if (summary.totalLevelsCompletedAllModules > 0) {
    items.push({
      id: 'fallback-recent-play',
      title: 'Recent activity',
      description: `${childName} played ${summary.activeModuleName} (level ${summary.activeModuleCurrentLevel} of ${summary.activeModuleTotal})`,
      category: 'Activity',
      icon: 'play',
      at,
    });
  }

  for (const mod of summary.modules) {
    for (const level of mod.completedLevels) {
      items.push({
        id: `fallback-${mod.key}-${level}`,
        title: 'Level completed',
        description: `${childName} completed ${mod.name} — Level ${level}`,
        category: 'Learning',
        icon: 'level',
        at,
      });
    }
    if (mod.status === 'completed') {
      items.push({
        id: `fallback-complete-${mod.key}`,
        title: 'Module completed',
        description: `${childName} finished all levels in ${mod.name}!`,
        category: 'Milestone',
        icon: 'complete',
        at,
      });
    }
  }

  if (items.length === 0) {
    items.push({
      id: 'fallback-enrolled',
      title: 'Learner ready',
      description: `${childName} is enrolled and ready to start ${MODULE_DISPLAY_NAMES.passwordCastle}.`,
      category: 'Learning',
      icon: 'info',
      at: new Date(),
    });
  }

  return items.sort((a, b) => b.at.getTime() - a.at.getTime());
}

export function resolveParentNotifications(
  activityLog: ActivityEntry[] | undefined,
  summary: ParentProgressSummary,
  childName: string,
): ParentNotification[] {
  if (activityLog && activityLog.length > 0) {
    return mapActivityToNotifications(activityLog);
  }
  return fallbackNotificationsFromProgress(summary, childName);
}

/** Admin broadcast from Mission Control → parent dashboard. */
export function adminBulletinToNotification(
  message: string,
  updatedAt?: string | Date | null,
): ParentNotification | null {
  const text = message.trim();
  if (!text) return null;

  let at = new Date();
  if (updatedAt) {
    const parsed = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
    if (!Number.isNaN(parsed.getTime())) at = parsed;
  }

  return {
    id: 'admin-bulletin',
    title: 'Message from CyberQuest Admin',
    description: text,
    category: 'Broadcast',
    icon: 'info',
    at,
  };
}

export function mergeWithAdminBulletin(
  notifications: ParentNotification[],
  message: string,
  updatedAt?: string | Date | null,
): ParentNotification[] {
  const bulletin = adminBulletinToNotification(message, updatedAt);
  if (!bulletin) return notifications;
  return [bulletin, ...notifications.filter((n) => n.id !== 'admin-bulletin')];
}

export function formatNotificationTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleString();
}
