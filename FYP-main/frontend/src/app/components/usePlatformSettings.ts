import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { LastPlayedModule } from './game/lastPlayed';

export type PlatformSettings = {
  maintenanceMode: boolean;
  modulesEnabled: Record<LastPlayedModule, boolean>;
  featuredModule: LastPlayedModule;
  parentAnnouncement: string;
  announcementUpdatedAt: string | null;
};

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  maintenanceMode: false,
  modulesEnabled: {
    passwordCastle: true,
    scamSafari: true,
    privacyVillage: true,
    cyberbullyBattle: true,
  },
  featuredModule: 'passwordCastle',
  parentAnnouncement: '',
  announcementUpdatedAt: null,
};

const POLL_MS = 10_000;

export function usePlatformSettings() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api.getPlatformSettings();
      setSettings({
        maintenanceMode: Boolean(data.maintenanceMode),
        modulesEnabled: {
          ...DEFAULT_PLATFORM_SETTINGS.modulesEnabled,
          ...(data.modulesEnabled || {}),
        },
        featuredModule: data.featuredModule || 'passwordCastle',
        parentAnnouncement: data.parentAnnouncement || '',
        announcementUpdatedAt: data.announcementUpdatedAt || null,
      });
    } catch {
      // keep last known settings
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onFocus = () => void refresh();
    window.addEventListener('focus', onFocus);
    const interval = window.setInterval(() => void refresh(), POLL_MS);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.clearInterval(interval);
    };
  }, [refresh]);

  const isModuleEnabled = useCallback(
    (module: LastPlayedModule) => settings.modulesEnabled[module] !== false,
    [settings.modulesEnabled],
  );

  return { settings, loading, refresh, isModuleEnabled };
}
