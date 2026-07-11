import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { mapAdminActivity, type AdminActivityItem } from './game/adminActivity';

const POLL_MS = 10_000;

export type AdminAnalytics = {
  totalParents: number;
  totalChildren: number;
  activeChildren: number;
  avgScore: number;
  highestScore: number;
  totalLevelsCompleted: number;
  recentRegistrations: number;
  moduleCompletions: {
    passwordCastle: number;
    scamSafari: number;
    privacyVillage: number;
    cyberbullyBattle: number;
  };
};

const emptyAnalytics: AdminAnalytics = {
  totalParents: 0,
  totalChildren: 0,
  activeChildren: 0,
  avgScore: 0,
  highestScore: 0,
  totalLevelsCompleted: 0,
  recentRegistrations: 0,
  moduleCompletions: {
    passwordCastle: 0,
    scamSafari: 0,
    privacyVillage: 0,
    cyberbullyBattle: 0,
  },
};

export function useAdminDashboardData() {
  const [parents, setParents] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics>(emptyAnalytics);
  const [activities, setActivities] = useState<AdminActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadActivity = useCallback(async () => {
    try {
      const data = await api.getAdminActivity();
      setActivities(mapAdminActivity(data.activities || []));
    } catch {
      // keep feed resilient
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [usersData, analyticsData] = await Promise.all([
        api.getAdminUsers(),
        api.getAdminAnalytics(),
      ]);
      setParents(usersData.parents || []);
      setChildren(usersData.children || []);
      setAnalytics({
        totalParents: analyticsData.totalParents || 0,
        totalChildren: analyticsData.totalChildren || 0,
        activeChildren: analyticsData.activeChildren || 0,
        avgScore: analyticsData.avgScore || 0,
        highestScore: analyticsData.highestScore || 0,
        totalLevelsCompleted: analyticsData.totalLevelsCompleted || 0,
        recentRegistrations: analyticsData.recentRegistrations || 0,
        moduleCompletions: analyticsData.moduleCompletions || emptyAnalytics.moduleCompletions,
      });
      await loadActivity();
    } catch (err: any) {
      const msg = err?.message || 'Failed to load admin data';
      if (/token required|invalid or expired token|invalid token/i.test(msg)) {
        setError('Admin session expired or missing. Sign out and log in again as admin.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [loadActivity]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onFocus = () => void loadActivity();
    window.addEventListener('focus', onFocus);
    const interval = window.setInterval(() => void loadActivity(), POLL_MS);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.clearInterval(interval);
    };
  }, [loadActivity]);

  return {
    parents,
    children,
    analytics,
    activities,
    loading,
    error,
    refresh,
    loadActivity,
  };
}
