import { useCallback, useEffect, useState } from 'react';
import { prepareAvatarImage } from './prepareAvatarImage';
import {
  loadProfileAvatar,
  PROFILE_AVATAR_EVENT,
  resolveProfileUserKey,
  saveProfileAvatar,
} from './profileAvatarStore';

export function useProfileAvatar(
  childData: { id?: string | number; name?: string } | null | undefined,
  defaultSrc: string,
) {
  const userKey = resolveProfileUserKey(childData);

  const [avatarSrc, setAvatarSrc] = useState(() => loadProfileAvatar(userKey) ?? defaultSrc);

  useEffect(() => {
    setAvatarSrc(loadProfileAvatar(userKey) ?? defaultSrc);
  }, [userKey, defaultSrc]);

  useEffect(() => {
    const sync = () => setAvatarSrc(loadProfileAvatar(userKey) ?? defaultSrc);

    const onAvatarChange = (event: Event) => {
      const detail = (event as CustomEvent<{ userKey: string; dataUrl: string | null }>).detail;
      if (detail?.userKey === userKey) {
        setAvatarSrc(detail.dataUrl ?? defaultSrc);
      }
    };

    window.addEventListener(PROFILE_AVATAR_EVENT, onAvatarChange);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(PROFILE_AVATAR_EVENT, onAvatarChange);
      window.removeEventListener('storage', sync);
    };
  }, [userKey, defaultSrc]);

  const uploadAvatar = useCallback(
    async (file: File) => {
      const dataUrl = await prepareAvatarImage(file);
      saveProfileAvatar(userKey, dataUrl);
      setAvatarSrc(dataUrl);
      return dataUrl;
    },
    [userKey],
  );

  return {
    avatarSrc,
    uploadAvatar,
    userKey,
    hasCustomAvatar: avatarSrc !== defaultSrc,
  };
}
