import {
  Award,
  Bell,
  LogIn,
  Play,
  Sparkles,
  Trophy,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  formatNotificationTime,
  type AdminActivityItem,
} from './game/adminActivity';
import type { NotificationIcon } from './game/parentNotifications';

type AdminActivityListProps = {
  activities: AdminActivityItem[];
  variant: 'sidebar' | 'inbox' | 'timeline';
  emptyMessage?: string;
  limit?: number;
  onSelectChild?: (childId: string) => void;
};

const iconMap: Record<
  NotificationIcon | 'account',
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
    sidebarBg: 'bg-slate-400',
    inboxBorder: 'border-slate-200',
    inboxBg: 'bg-slate-50',
    inboxColor: 'text-slate-700',
  },
  account: {
    Icon: UserPlus,
    sidebarBg: 'bg-indigo-400',
    inboxBorder: 'border-indigo-200',
    inboxBg: 'bg-indigo-50',
    inboxColor: 'text-indigo-700',
  },
};

function resolveIcon(item: AdminActivityItem) {
  if (item.source === 'platform' && item.category === 'Account') {
    return iconMap.account;
  }
  if (item.source === 'platform' && item.category === 'Enrollment') {
    return { ...iconMap.account, Icon: Users };
  }
  return iconMap[item.icon];
}

export function AdminActivityList({
  activities,
  variant,
  emptyMessage = 'No platform activity yet. Events appear when parents register, link learners, or children play.',
  limit,
  onSelectChild,
}: AdminActivityListProps) {
  const items = limit ? activities.slice(0, limit) : activities;

  if (items.length === 0) {
    return (
      <p
        className={
          variant === 'sidebar'
            ? 'text-xs text-white/70 leading-relaxed'
            : 'text-sm text-gray-500 px-5 py-4'
        }
      >
        {emptyMessage}
      </p>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className="space-y-3">
        {items.map((item) => {
          const { Icon, sidebarBg } = resolveIcon(item);
          return (
            <div key={item.id} className="flex items-start gap-3">
              <div
                className={`w-8 h-8 ${sidebarBg} rounded-lg flex items-center justify-center flex-shrink-0`}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/90 leading-tight">{item.description}</p>
                <p className="text-[10px] text-white/50 mt-0.5">
                  {formatNotificationTime(item.at)}
                  {item.parentName ? ` · ${item.parentName}` : ''}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (variant === 'timeline') {
    return (
      <div className="relative space-y-0">
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gray-200" aria-hidden />
        {items.map((item) => {
          const { Icon, inboxBorder, inboxBg, inboxColor } = resolveIcon(item);
          return (
            <div
              key={item.id}
              className="relative flex gap-4 pb-5 last:pb-0"
            >
              <div
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${inboxBorder} ${inboxBg} shadow-sm`}
              >
                <Icon className={`h-5 w-5 ${inboxColor}`} />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                    {item.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">
                  <span>{formatNotificationTime(item.at)}</span>
                  {item.parentName && (
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#2d5a8a]" />
                      {item.parentName}
                    </span>
                  )}
                  {item.childName && onSelectChild && item.childId ? (
                    <button
                      type="button"
                      onClick={() => onSelectChild(item.childId!)}
                      className="inline-flex items-center gap-1 text-[#2d5a8a] font-medium hover:underline"
                    >
                      {item.childName}
                    </button>
                  ) : item.childName ? (
                    <span>{item.childName}</span>
                  ) : null}
                </div>
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
        const { Icon, inboxBorder, inboxBg, inboxColor } = resolveIcon(item);
        return (
          <li
            key={item.id}
            className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4 hover:bg-gray-50/80 transition-colors"
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
                <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1 text-[10px] text-gray-400">
                  <span>{formatNotificationTime(item.at)}</span>
                  {item.parentName && <span>· Parent: {item.parentName}</span>}
                  {item.childName && <span>· Learner: {item.childName}</span>}
                </div>
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
