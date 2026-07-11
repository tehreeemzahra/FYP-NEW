import {
  Award,
  Bell,
  LogIn,
  Play,
  Sparkles,
  Trophy,
} from 'lucide-react';
import {
  formatNotificationTime,
  type NotificationIcon,
  type ParentNotification,
} from './game/parentNotifications';

type ParentNotificationsListProps = {
  notifications: ParentNotification[];
  variant: 'sidebar' | 'inbox';
  emptyMessage?: string;
  limit?: number;
};

const iconMap: Record<
  NotificationIcon,
  { Icon: typeof Award; sidebarBg: string; inboxBorder: string; inboxBg: string; inboxColor: string }
> = {
  login: {
    Icon: LogIn,
    sidebarBg: 'bg-sky-400',
    inboxBorder: 'border-sky-200',
    inboxBg: 'bg-sky-50',
    inboxColor: 'text-sky-700',
  },
  level: {
    Icon: Trophy,
    sidebarBg: 'bg-blue-400',
    inboxBorder: 'border-blue-200',
    inboxBg: 'bg-blue-50',
    inboxColor: 'text-blue-700',
  },
  complete: {
    Icon: Award,
    sidebarBg: 'bg-emerald-400',
    inboxBorder: 'border-emerald-200',
    inboxBg: 'bg-emerald-50',
    inboxColor: 'text-emerald-700',
  },
  play: {
    Icon: Play,
    sidebarBg: 'bg-violet-400',
    inboxBorder: 'border-violet-200',
    inboxBg: 'bg-violet-50',
    inboxColor: 'text-violet-700',
  },
  module: {
    Icon: Sparkles,
    sidebarBg: 'bg-yellow-400',
    inboxBorder: 'border-amber-200',
    inboxBg: 'bg-amber-50',
    inboxColor: 'text-amber-800',
  },
  info: {
    Icon: Bell,
    sidebarBg: 'bg-indigo-400',
    inboxBorder: 'border-indigo-200',
    inboxBg: 'bg-indigo-50',
    inboxColor: 'text-indigo-700',
  },
};

export function ParentNotificationsList({
  notifications,
  variant,
  emptyMessage = 'No activity yet. Notifications appear when your child logs in or plays.',
  limit,
}: ParentNotificationsListProps) {
  const items = limit ? notifications.slice(0, limit) : notifications;

  if (items.length === 0) {
    return (
      <p className={variant === 'sidebar' ? 'text-xs text-white/70 leading-relaxed' : 'text-sm text-gray-500 px-5 py-4'}>
        {emptyMessage}
      </p>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className="space-y-3">
        {items.map((item) => {
          const { Icon, sidebarBg } = iconMap[item.icon];
          return (
            <div key={item.id} className="flex items-start gap-3">
              <div className={`w-8 h-8 ${sidebarBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/90 leading-tight">{item.description}</p>
                <p className="text-[10px] text-white/50 mt-0.5">{formatNotificationTime(item.at)}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {items.map((item) => {
        const { Icon, inboxBorder, inboxBg, inboxColor } = iconMap[item.icon];
        return (
          <li
            key={item.id}
            className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4"
          >
            <div className="flex gap-3 min-w-0">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${inboxBorder} ${inboxBg}`}
              >
                <Icon className={`h-5 w-5 ${inboxColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.description}</p>
                <p className="text-[10px] text-gray-400 mt-1">{formatNotificationTime(item.at)}</p>
              </div>
            </div>
            <span className="justify-self-start rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600 sm:justify-self-end">
              {item.category}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** Static parent-account notices shown below live child activity. */
export function ParentSystemNotifications({ variant }: { variant: 'sidebar' | 'inbox' }) {
  const systemItems: ParentNotification[] = [
    {
      id: 'system-access',
      title: 'Child access reminder',
      description: 'Share the learner login code only with your child; rotate if it may have been exposed.',
      category: 'Advisory',
      icon: 'info',
      at: new Date(),
    },
  ];

  if (variant === 'sidebar') {
    return (
      <div className="space-y-3 mt-3 pt-3 border-t border-white/10">
        {systemItems.map((item) => {
          const { Icon, sidebarBg } = iconMap[item.icon];
          return (
            <div key={item.id} className="flex items-start gap-3">
              <div className={`w-8 h-8 ${sidebarBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/90 leading-tight">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 border-t border-gray-100">
      {systemItems.map((item) => (
        <li
          key={item.id}
          className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4"
        >
          <div className="flex gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-amber-50">
              <Bell className="h-5 w-5 text-amber-800" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900">{item.title}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.description}</p>
            </div>
          </div>
          <span className="justify-self-start rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900 sm:justify-self-end">
            {item.category}
          </span>
        </li>
      ))}
    </ul>
  );
}
