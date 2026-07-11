/**
 * Maps platform-wide activity entries into admin-dashboard feed items.
 */

import {
  formatNotificationTime,
  type NotificationIcon,
} from './parentNotifications';

export type AdminActivityEntry = {
  type: string;
  module?: string;
  level?: number;
  message: string;
  at: string | Date;
  childId?: string;
  childName?: string;
  parentId?: string;
  parentName?: string;
  source?: 'child' | 'platform';
};

export type AdminActivityItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: NotificationIcon;
  at: Date;
  childName?: string;
  parentName?: string;
  childId?: string;
  parentId?: string;
  source: 'child' | 'platform';
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
    case 'parent_registered':
    case 'child_linked':
      return 'info';
    default:
      return 'info';
  }
}

function categoryForType(type: string, source?: string): string {
  if (source === 'platform') {
    if (type === 'parent_registered') return 'Account';
    if (type === 'child_linked') return 'Enrollment';
    return 'Platform';
  }
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

function titleForEntry(entry: AdminActivityEntry): string {
  switch (entry.type) {
    case 'login':
      return 'Child logged in';
    case 'level_complete':
      return 'Level completed';
    case 'module_complete':
      return 'Module completed';
    case 'module_play':
      return 'Started playing';
    case 'parent_registered':
      return 'New parent account';
    case 'child_linked':
      return 'Learner linked';
    default:
      return 'Platform update';
  }
}

export function mapAdminActivity(entries: AdminActivityEntry[]): AdminActivityItem[] {
  return entries
    .map((entry, index) => ({
      id: `${entry.type}-${toDate(entry.at).getTime()}-${entry.childId || entry.parentId || index}`,
      title: titleForEntry(entry),
      description: entry.message,
      category: categoryForType(entry.type, entry.source),
      icon: iconForType(entry.type),
      at: toDate(entry.at),
      childName: entry.childName,
      parentName: entry.parentName,
      childId: entry.childId,
      parentId: entry.parentId,
      source: entry.source || 'child',
    }))
    .sort((a, b) => b.at.getTime() - a.at.getTime());
}

export { formatNotificationTime };
