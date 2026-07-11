const KEY_PREFIX = 'cq_profile_avatar_';

export const PROFILE_AVATAR_EVENT = 'cq-profile-avatar-change';

export function profileAvatarKey(userKey: string) {
  return `${KEY_PREFIX}${userKey}`;
}

export function resolveProfileUserKey(childData?: { id?: string | number; name?: string } | null) {
  if (childData?.id != null) return String(childData.id);
  if (childData?.name) return childData.name.trim().toLowerCase().replace(/\s+/g, '_');
  return 'guest';
}

export function loadProfileAvatar(userKey: string): string | null {
  try {
    return localStorage.getItem(profileAvatarKey(userKey));
  } catch {
    return null;
  }
}

export function saveProfileAvatar(userKey: string, dataUrl: string) {
  localStorage.setItem(profileAvatarKey(userKey), dataUrl);
  window.dispatchEvent(
    new CustomEvent(PROFILE_AVATAR_EVENT, { detail: { userKey, dataUrl } }),
  );
}

export function clearProfileAvatar(userKey: string) {
  localStorage.removeItem(profileAvatarKey(userKey));
  window.dispatchEvent(
    new CustomEvent(PROFILE_AVATAR_EVENT, { detail: { userKey, dataUrl: null } }),
  );
}
