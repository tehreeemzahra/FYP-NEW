import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
  emptyParentProgressSummary,
  summarizeParentProgress,
  type ParentProgressSummary,
} from './game/parentProgressSummary';
import {
  resolveParentNotifications,
  type ActivityEntry,
  type ParentNotification,
} from './game/parentNotifications';

type LoadStatus = 'loading' | 'ready' | 'empty' | 'error';

const POLL_MS = 10_000;

/**
 * Loads all linked children + live progress for the selected child on the parent dashboard.
 */
export function useParentChildProgress(parentId: string | undefined) {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [summary, setSummary] = useState<ParentProgressSummary>(emptyParentProgressSummary);
  const [notifications, setNotifications] = useState<ParentNotification[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');

  const selectedChild =
    children.find((child) => child.id === selectedChildId) ?? children[0] ?? null;

  const syncProgress = useCallback(async (childId: string, childName: string) => {
    const progress = await api.getChildProgress(childId);
    const nextSummary = summarizeParentProgress(progress);
    const activityLog = (progress.activityLog || []) as ActivityEntry[];
    setSummary(nextSummary);
    setNotifications(resolveParentNotifications(activityLog, nextSummary, childName));
  }, []);

  const refresh = useCallback(async () => {
    if (!parentId) return;
    try {
      const list = await api.getParentChildren();
      setChildren(list);
      if (!list?.length) {
        setSelectedChildId(null);
        setSummary(emptyParentProgressSummary());
        setNotifications([]);
        setStatus('empty');
        return;
      }

      const nextId =
        selectedChildId && list.some((child: { id: string }) => child.id === selectedChildId)
          ? selectedChildId
          : list[0].id;

      setSelectedChildId(nextId);
      const child = list.find((item: { id: string }) => item.id === nextId) ?? list[0];
      await syncProgress(child.id, child.name);
      setStatus('ready');
    } catch {
      setChildren([]);
      setSelectedChildId(null);
      setSummary(emptyParentProgressSummary());
      setNotifications([]);
      setStatus('error');
    }
  }, [parentId, selectedChildId, syncProgress]);

  const selectChild = useCallback(
    async (childId: string) => {
      const child = children.find((item) => item.id === childId);
      if (!child) return;
      setSelectedChildId(childId);
      setStatus('loading');
      try {
        await syncProgress(child.id, child.name);
        setStatus('ready');
      } catch {
        setStatus('error');
      }
    },
    [children, syncProgress],
  );

  useEffect(() => {
    if (!parentId) return;
    setStatus('loading');
    void refresh();
  }, [parentId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedChild?.id || status !== 'ready') return;

    const tick = () => {
      void syncProgress(selectedChild.id, selectedChild.name).catch(() => {});
    };

    const interval = window.setInterval(tick, POLL_MS);
    const onFocus = () => tick();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') tick();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [selectedChild?.id, selectedChild?.name, status, syncProgress]);

  return {
    children,
    childData: selectedChild,
    selectedChildId,
    selectChild,
    summary,
    notifications,
    status,
    refresh,
  };
}
