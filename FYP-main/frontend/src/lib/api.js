import { getNativeApiBase } from './native';

// Web dev: Vite proxy (empty base). Native app: host machine URL or VITE_API_URL.
const BASE = getNativeApiBase();

const TOKEN_PARENT = 'cyberquest_parent_token';
const TOKEN_CHILD = 'cyberquest_child_token';
const TOKEN_ADMIN = 'cyberquest_admin_token';

export function getParentToken() {
  return typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_PARENT) : null;
}
export function getChildToken() {
  return typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_CHILD) : null;
}
export function setParentToken(t) {
  if (typeof localStorage === 'undefined') return;
  if (t) localStorage.setItem(TOKEN_PARENT, t);
  else localStorage.removeItem(TOKEN_PARENT);
  localStorage.removeItem(TOKEN_CHILD);
  localStorage.removeItem(TOKEN_ADMIN);
}
export function setChildToken(t) {
  if (typeof localStorage === 'undefined') return;
  if (t) localStorage.setItem(TOKEN_CHILD, t);
  else localStorage.removeItem(TOKEN_CHILD);
  localStorage.removeItem(TOKEN_PARENT);
  localStorage.removeItem(TOKEN_ADMIN);
}
export function getAdminToken() {
  return typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_ADMIN) : null;
}
export function setAdminToken(t) {
  if (typeof localStorage === 'undefined') return;
  if (t) localStorage.setItem(TOKEN_ADMIN, t);
  else localStorage.removeItem(TOKEN_ADMIN);
  localStorage.removeItem(TOKEN_PARENT);
  localStorage.removeItem(TOKEN_CHILD);
}
export function clearAuth() {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(TOKEN_PARENT);
  localStorage.removeItem(TOKEN_CHILD);
  localStorage.removeItem(TOKEN_ADMIN);
}

async function request(path, opts = {}, token) {
  const url = `${BASE}${path}`;
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  let res;
  try {
    res = await fetch(url, { ...opts, headers });
  } catch (err) {
    throw new Error('Cannot connect to backend. Please start backend server and try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

// Auth
export const api = {
  async parentRegister(body) {
    const d = await request('/api/auth/parent/register', { method: 'POST', body: JSON.stringify(body) });
    setParentToken(d.token);
    return d;
  },
  async parentLogin(body) {
    const d = await request('/api/auth/parent/login', { method: 'POST', body: JSON.stringify(body) });
    setParentToken(d.token);
    return d;
  },
  /** Unauthenticated: reset by email (demo; no email verification). */
  async parentResetPassword(body) {
    return request('/api/auth/parent/reset-password', { method: 'POST', body: JSON.stringify(body) });
  },
  /** Authenticated parent: change password. */
  async updateParentPassword(body) {
    return request('/api/parent/password', { method: 'PUT', body: JSON.stringify(body) }, getParentToken());
  },
  async childLogin(body) {
    const d = await request('/api/auth/child/login', { method: 'POST', body: JSON.stringify(body) });
    setChildToken(d.token);
    return d;
  },
  async adminLogin(body) {
    const d = await request('/api/auth/admin/login', { method: 'POST', body: JSON.stringify(body) });
    setAdminToken(d.token);
    return d;
  },
  async adminRegister(body) {
    const d = await request('/api/auth/admin/register', { method: 'POST', body: JSON.stringify(body) });
    setAdminToken(d.token);
    return d;
  },
  /** Unauthenticated: reset by email or username for DB-registered admins (demo; no email verification). Body: { account, newPassword } or { email | username, newPassword }. */
  async adminResetPassword(body) {
    return request('/api/auth/admin/reset-password', { method: 'POST', body: JSON.stringify(body) });
  },

  // Progress (child token)
  async getProgress() {
    return request('/api/progress', {}, getChildToken());
  },
  async saveProgress(payload) {
    return request('/api/progress', { method: 'PUT', body: JSON.stringify(payload) }, getChildToken());
  },

  // Parent
  async getParentChildren() {
    return request('/api/parent/children', {}, getParentToken());
  },
  async createParentChild(body) {
    return request('/api/parent/children', { method: 'POST', body: JSON.stringify(body) }, getParentToken());
  },
  async getChildProgress(childId) {
    return request(`/api/parent/child/${childId}/progress`, {}, getParentToken());
  },

  // Child
  async getChildParent() {
    return request('/api/child/parent', {}, getChildToken());
  },
  async getPlatformSettings() {
    return request('/api/settings/platform');
  },

  // Admin
  async getAdminUsers() {
    return request('/api/admin/users', {}, getAdminToken());
  },
  async updateAdminParent(parentId, body) {
    return request(`/api/admin/parent/${parentId}`, { method: 'PUT', body: JSON.stringify(body) }, getAdminToken());
  },
  async updateAdminChild(childId, body) {
    return request(`/api/admin/child/${childId}`, { method: 'PUT', body: JSON.stringify(body) }, getAdminToken());
  },
  async deleteAdminParent(parentId) {
    return request(`/api/admin/parent/${parentId}`, { method: 'DELETE' }, getAdminToken());
  },
  async deleteAdminChild(childId) {
    return request(`/api/admin/child/${childId}`, { method: 'DELETE' }, getAdminToken());
  },
  async getAdminAnalytics() {
    return request('/api/admin/analytics', {}, getAdminToken());
  },
  async getAdminActivity() {
    return request('/api/admin/activity', {}, getAdminToken());
  },
  async getAdminChildProgress(childId) {
    return request(`/api/admin/child/${childId}/progress`, {}, getAdminToken());
  },
  async getAdminSettings() {
    return request('/api/admin/settings', {}, getAdminToken());
  },
  async updateAdminSettings(body) {
    return request('/api/admin/settings', { method: 'PUT', body: JSON.stringify(body) }, getAdminToken());
  },
};
