import { Megaphone } from 'lucide-react';
import { formatNotificationTime } from './game/parentNotifications';

type ParentAdminBulletinProps = {
  message: string;
  updatedAt?: string | null;
  variant?: 'banner' | 'compact';
};

export function ParentAdminBulletin({
  message,
  updatedAt,
  variant = 'banner',
}: ParentAdminBulletinProps) {
  const text = message.trim();
  if (!text) return null;

  const postedAt = updatedAt ? new Date(updatedAt) : new Date();
  const timeLabel = Number.isNaN(postedAt.getTime()) ? 'Just now' : formatNotificationTime(postedAt);

  if (variant === 'compact') {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-[#2d5a8a]/20 bg-gradient-to-br from-[#2d5a8a]/5 to-indigo-50 px-4 py-3">
        <div className="w-9 h-9 rounded-lg bg-[#2d5a8a] flex items-center justify-center shrink-0">
          <Megaphone className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#2d5a8a]">
            From CyberQuest Admin · {timeLabel}
          </p>
          <p className="text-sm text-gray-800 leading-relaxed mt-0.5">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#2d5a8a]/25 bg-gradient-to-br from-indigo-50 via-blue-50 to-[#2d5a8a]/5 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-[#2d5a8a]/10 bg-white/60 flex items-center gap-2">
        <Megaphone className="w-5 h-5 text-[#2d5a8a]" />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#2d5a8a]">Admin broadcast</p>
          <p className="text-sm font-semibold text-gray-900">Parent bulletin</p>
        </div>
        <span className="ml-auto text-[10px] font-medium text-gray-500">{timeLabel}</span>
      </div>
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2d5a8a] flex items-center justify-center shrink-0 shadow-sm">
            <Megaphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#2d5a8a] mb-1">
              From CyberQuest Admin
            </p>
            <p className="text-sm sm:text-base text-gray-800 leading-relaxed">{text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
