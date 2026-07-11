import {
  LayoutDashboard,
  Users,
  Baby,
  Menu,
  X,
  LogOut,
  Pencil,
  Trash2,
  Settings,
  Activity,
  ChevronDown,
  Loader2,
  Award,
  Zap,
  Eye,
  Megaphone,
  Sparkles,
  Gamepad2,
  Shield,
  Star,
  Check,
  Wrench,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { useAdminDashboardData } from './useAdminDashboardData';
import { AdminActivityList } from './AdminActivityList';
import { summarizeParentProgress, moduleProgressPercent } from './game/parentProgressSummary';

interface ParentUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  children: ChildUser[];
}

interface ChildUser {
  id: string;
  name: string;
  age: number;
  loginCode: string;
  parentId: string;
}

interface AdminDashboardProps {
  onSignOut?: () => void;
}

type AdminNavSection = 'overview' | 'activity' | 'users' | 'children' | 'settings';

type ModuleKey = 'passwordCastle' | 'scamSafari' | 'privacyVillage' | 'cyberbullyBattle';

type AdminSettingsState = {
  maintenanceMode: boolean;
  parentAnnouncement: string;
  featuredModule: ModuleKey;
  modulesEnabled: Record<ModuleKey, boolean>;
};

const DEFAULT_SETTINGS: AdminSettingsState = {
  maintenanceMode: false,
  parentAnnouncement: '',
  featuredModule: 'passwordCastle',
  modulesEnabled: {
    passwordCastle: true,
    scamSafari: true,
    privacyVillage: true,
    cyberbullyBattle: true,
  },
};

const MODULE_CONFIG: {
  key: ModuleKey;
  name: string;
  emoji: string;
  gradient: string;
  tagline: string;
}[] = [
  {
    key: 'passwordCastle',
    name: 'Password Castle',
    emoji: '🏰',
    gradient: 'from-blue-500 to-indigo-600',
    tagline: 'Build strong secret codes',
  },
  {
    key: 'scamSafari',
    name: 'Scam Safari',
    emoji: '🦁',
    gradient: 'from-amber-500 to-orange-600',
    tagline: 'Spot tricks and fake messages',
  },
  {
    key: 'privacyVillage',
    name: 'Privacy Village',
    emoji: '🏡',
    gradient: 'from-emerald-500 to-teal-600',
    tagline: 'Protect personal information',
  },
  {
    key: 'cyberbullyBattle',
    name: 'Cyberbully Battle',
    emoji: '⚔️',
    gradient: 'from-violet-500 to-purple-600',
    tagline: 'Stand up safely online',
  },
];

const adminNavTitles: Record<AdminNavSection, string> = {
  overview: 'Admin Dashboard',
  activity: 'Live Activity',
  users: 'Parent Accounts',
  children: 'Learners',
  settings: 'Mission Control',
};

const adminNavSubtitles: Record<AdminNavSection, string> = {
  overview: 'Platform health, registrations, and real-time learner activity',
  activity: 'Every parent registration, child link, login, and learning milestone',
  users: 'Manage parent accounts and linked families',
  children: 'Monitor learners, login codes, and progress',
  settings: 'Toggle missions and broadcast to parents',
};

const CHART_COLORS = ['#2d5a8a', '#4f46e5', '#10b981', '#f59e0b'];

export function AdminDashboard({ onSignOut }: AdminDashboardProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<AdminNavSection>('overview');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activityFilter, setActivityFilter] = useState<'all' | 'child' | 'platform'>('all');
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [childProgressLoading, setChildProgressLoading] = useState(false);
  const [childProgressData, setChildProgressData] = useState<any>(null);
  const [settingsState, setSettingsState] = useState<AdminSettingsState>(DEFAULT_SETTINGS);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const { parents, children, analytics, activities, loading, error, refresh } = useAdminDashboardData();

  const parentNameById = useMemo(() => {
    const map = new Map<string, string>();
    parents.forEach((p) => map.set(p.id, p.name));
    return map;
  }, [parents]);

  const filteredActivities = useMemo(() => {
    if (activityFilter === 'child') return activities.filter((a) => a.source === 'child');
    if (activityFilter === 'platform') return activities.filter((a) => a.source === 'platform');
    return activities;
  }, [activities, activityFilter]);

  const moduleChartData = useMemo(
    () =>
      MODULE_CONFIG.map((mod) => ({
        key: mod.key,
        name: mod.name,
        value: analytics.moduleCompletions[mod.key],
      })),
    [analytics.moduleCompletions],
  );

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.getAdminSettings();
      setSettingsState({
        maintenanceMode: Boolean(data.maintenanceMode),
        parentAnnouncement: data.parentAnnouncement || '',
        featuredModule: data.featuredModule || 'passwordCastle',
        modulesEnabled: { ...DEFAULT_SETTINGS.modulesEnabled, ...(data.modulesEnabled || {}) },
      });
    } catch {
      // resilient
    }
  };

  const goNav = (section: AdminNavSection) => {
    setActiveSection(section);
    setIsSidebarOpen(false);
  };

  const navButtonClass = (section: AdminNavSection) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-colors text-left ${
      activeSection === section ? 'bg-white/10 text-white hover:bg-white/20' : 'text-white/70 hover:bg-white/10'
    }`;

  const openChildProgress = async (childId: string) => {
    setSelectedChildId(childId);
    setChildProgressLoading(true);
    setChildProgressData(null);
    try {
      const data = await api.getAdminChildProgress(childId);
      setChildProgressData(data);
    } catch {
      setChildProgressData(null);
    } finally {
      setChildProgressLoading(false);
    }
  };

  const editParent = async (parent: ParentUser) => {
    const name = window.prompt('Edit parent name:', parent.name);
    if (name === null) return;
    const email = window.prompt('Edit parent email:', parent.email);
    if (email === null) return;
    try {
      await api.updateAdminParent(parent.id, { name, email });
      await refresh();
    } catch (err: any) {
      alert(err?.message || 'Failed to update parent');
    }
  };

  const deleteParent = async (parent: ParentUser) => {
    if (!window.confirm(`Delete parent "${parent.name}" and all linked children?`)) return;
    try {
      await api.deleteAdminParent(parent.id);
      await refresh();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete parent');
    }
  };

  const editChild = async (child: ChildUser) => {
    const name = window.prompt('Edit child name:', child.name);
    if (name === null) return;
    const ageValue = window.prompt('Edit child age:', String(child.age));
    if (ageValue === null) return;
    const age = Number(ageValue);
    if (!Number.isFinite(age) || age < 1 || age > 18) {
      alert('Age must be between 1 and 18');
      return;
    }
    try {
      await api.updateAdminChild(child.id, { name, age });
      await refresh();
    } catch (err: any) {
      alert(err?.message || 'Failed to update child');
    }
  };

  const deleteChild = async (child: ChildUser) => {
    if (!window.confirm(`Delete child "${child.name}"?`)) return;
    try {
      await api.deleteAdminChild(child.id);
      await refresh();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete child');
    }
  };

  const saveSettings = async () => {
    setSettingsSaving(true);
    setSettingsSaved(false);
    try {
      const data = await api.updateAdminSettings(settingsState);
      setSettingsState({
        maintenanceMode: Boolean(data.maintenanceMode),
        parentAnnouncement: data.parentAnnouncement || '',
        featuredModule: data.featuredModule || 'passwordCastle',
        modulesEnabled: { ...DEFAULT_SETTINGS.modulesEnabled, ...(data.modulesEnabled || {}) },
      });
      setSettingsSaved(true);
      window.setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err: any) {
      alert(err?.message || 'Failed to update settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  const toggleModule = (key: ModuleKey) => {
    setSettingsState((prev) => ({
      ...prev,
      modulesEnabled: { ...prev.modulesEnabled, [key]: !prev.modulesEnabled[key] },
    }));
  };

  const enabledModuleCount = Object.values(settingsState.modulesEnabled).filter(Boolean).length;

  const childSummary = childProgressData
    ? summarizeParentProgress(childProgressData)
    : null;

  const activityCountToday = useMemo(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return activities.filter((a) => a.at >= startOfDay).length;
  }, [activities]);

  return (
    <div className="min-h-screen w-full flex bg-gray-50 overflow-x-hidden">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-[#2d5a8a] to-[#1e3a5f] text-white flex flex-col flex-shrink-0 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="absolute top-4 right-4 lg:hidden p-2 rounded-lg hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-[#2d5a8a] text-lg">🛡️</span>
          </div>
          <span className="text-xl font-bold">CyberQuest Admin</span>
        </div>

        <nav className="flex-1 px-4 pt-4">
          <button type="button" className={navButtonClass('overview')} onClick={() => goNav('overview')}>
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            <span>Overview</span>
          </button>
          <button type="button" className={navButtonClass('activity')} onClick={() => goNav('activity')}>
            <Activity className="w-5 h-5 shrink-0" />
            <span className="flex-1 text-left">Live Activity</span>
            {activityCountToday > 0 && (
              <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-full">
                {activityCountToday}
              </span>
            )}
          </button>
          <button type="button" className={navButtonClass('users')} onClick={() => goNav('users')}>
            <Users className="w-5 h-5 shrink-0" />
            <span>Parents</span>
          </button>
          <button type="button" className={navButtonClass('children')} onClick={() => goNav('children')}>
            <Baby className="w-5 h-5 shrink-0" />
            <span>Learners</span>
          </button>
          <button type="button" className={navButtonClass('settings')} onClick={() => goNav('settings')}>
            <Gamepad2 className="w-5 h-5 shrink-0" />
            <span>Mission Control</span>
          </button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl text-gray-900 font-semibold tracking-tight truncate">
                  {adminNavTitles[activeSection]}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 line-clamp-2 max-w-xl">
                  {adminNavSubtitles[activeSection]}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-3 shrink-0">
              <div className="relative">
                <button
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-[#2d5a8a] to-[#1e3a5f] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">👤</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600 hidden sm:block" />
                </button>
                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                      <button
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors text-red-600"
                        onClick={onSignOut}
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeSection === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Parents', value: parents.length, icon: Users, color: 'bg-[#2d5a8a]' },
                    { label: 'Total Learners', value: children.length, icon: Baby, color: 'bg-indigo-600' },
                    { label: 'Active Today', value: analytics.activeChildren, icon: Zap, color: 'bg-emerald-600' },
                    { label: 'Levels Completed', value: analytics.totalLevelsCompleted, icon: Award, color: 'bg-amber-500' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-9 h-9 ${stat.color} rounded-lg flex items-center justify-center shadow-sm`}>
                          <stat.icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                          {stat.label}
                        </span>
                      </div>
                      <p className="text-3xl text-gray-900 font-semibold tabular-nums">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-blue-200/80 bg-blue-50/60 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 mb-1">Avg Score</p>
                    <p className="text-2xl font-bold text-gray-900 tabular-nums">{analytics.avgScore}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 mb-1">New This Week</p>
                    <p className="text-2xl font-bold text-gray-900 tabular-nums">{analytics.recentRegistrations}</p>
                  </div>
                  <div className="rounded-xl border border-violet-200/80 bg-violet-50/60 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-700 mb-1">Events Today</p>
                    <p className="text-2xl font-bold text-gray-900 tabular-nums">{activityCountToday}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                  <div className="xl:col-span-3 bg-white rounded-2xl border border-gray-200/90 shadow-sm p-5 lg:p-6">
                    <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Live feed</p>
                        <h2 className="text-lg font-semibold text-gray-900 mt-0.5">Recent Platform Activity</h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => goNav('activity')}
                        className="text-sm font-medium text-[#2d5a8a] hover:underline"
                      >
                        View all
                      </button>
                    </div>
                    <AdminActivityList
                      activities={activities}
                      variant="timeline"
                      limit={8}
                      onSelectChild={(id) => {
                        goNav('children');
                        void openChildProgress(id);
                      }}
                    />
                  </div>

                  <div className="xl:col-span-2 space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">
                        Module Completions
                      </p>
                      <div className="space-y-3">
                        {moduleChartData.map((mod, i) => (
                          <div key={mod.name}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-700 font-medium">{mod.name}</span>
                              <span className="text-gray-500 tabular-nums">{mod.value} learners</span>
                            </div>
                            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${children.length ? Math.round((mod.value / children.length) * 100) : 0}%`,
                                  backgroundColor: CHART_COLORS[i],
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">
                        Recent Parents
                      </p>
                      <div className="space-y-2">
                        {parents.slice(0, 4).map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5"
                          >
                            <div className="min-w-0">
                              <p className="text-sm text-gray-900 font-medium truncate">{user.name}</p>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#2d5a8a] bg-blue-50 px-2 py-0.5 rounded-full shrink-0 ml-2">
                              {user.children?.length || 0} kids
                            </span>
                          </div>
                        ))}
                        {parents.length === 0 && (
                          <p className="text-sm text-gray-500">No parent accounts yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'activity' && (
              <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Platform-wide</p>
                    <h2 className="text-lg font-semibold text-gray-900">Activity Feed</h2>
                  </div>
                  <div className="flex gap-2">
                    {(['all', 'child', 'platform'] as const).map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setActivityFilter(filter)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                          activityFilter === filter
                            ? 'bg-[#2d5a8a] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {filter === 'all' ? 'All' : filter === 'child' ? 'Learning' : 'Accounts'}
                      </button>
                    ))}
                  </div>
                </div>
                <AdminActivityList
                  activities={filteredActivities}
                  variant="inbox"
                  onSelectChild={(id) => void openChildProgress(id)}
                />
              </div>
            )}

            {activeSection === 'users' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm text-gray-500">
                    {parents.length} parent accounts
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {parents.map((user) => {
                    const childNames = (user.children || []).map((c: ChildUser) => c.name);
                    return (
                      <div
                        key={user.id}
                        className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-5 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2d5a8a] to-[#1e3a5f] flex items-center justify-center text-white text-base font-semibold shadow-sm">
                              {user.name?.trim()?.charAt(0)?.toUpperCase() || 'P'}
                            </div>
                            <div>
                              <p className="text-gray-900 font-semibold">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue-50 text-[#2d5a8a]">
                            Parent
                          </span>
                        </div>

                        <div className="mb-4 rounded-xl bg-gray-50 border border-gray-100 px-3 py-2.5">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                            Linked learners ({childNames.length})
                          </p>
                          <p className="text-xs text-gray-700">
                            {childNames.length > 0 ? childNames.join(', ') : 'No linked learners'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => editParent(user)}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2d5a8a] py-2.5 text-sm font-medium transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => deleteParent(user)}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 py-2.5 text-sm font-medium transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeSection === 'children' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm text-gray-500">
                    {children.length} learners
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {children.map((child) => {
                    const parentName = parentNameById.get(child.parentId) || '-';
                    const childActivities = activities.filter((a) => a.childId === child.id).length;
                    return (
                      <div
                        key={child.id}
                        className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-5 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2d5a8a] to-[#1e3a5f] flex items-center justify-center text-xl shadow-sm">
                              {child.age <= 10 ? '👧' : '🧒'}
                            </div>
                            <div>
                              <p className="text-gray-900 font-semibold">{child.name}</p>
                              <p className="text-xs text-gray-500">Age {child.age}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            Active
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                            <span className="text-xs text-gray-500">Parent</span>
                            <span className="text-xs text-gray-900 font-medium">{parentName}</span>
                          </div>
                          <div className="flex items-center justify-between bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
                            <span className="text-xs text-gray-500">Login Code</span>
                            <span className="text-sm text-amber-800 font-bold tracking-wider">{child.loginCode}</span>
                          </div>
                          <div className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
                            <span className="text-xs text-gray-500">Activity events</span>
                            <span className="text-xs text-[#2d5a8a] font-semibold">{childActivities}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => void openChildProgress(child.id)}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#2d5a8a] hover:bg-[#244a72] text-white py-2.5 text-sm font-medium transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Progress
                          </button>
                          <button
                            onClick={() => editChild(child)}
                            className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2d5a8a] transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteChild(child)}
                            className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeSection === 'settings' && (
              <div className="space-y-6">
                {/* Platform pulse hero */}
                <div
                  className={`relative overflow-hidden rounded-2xl border shadow-sm ${
                    settingsState.maintenanceMode
                      ? 'border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100'
                      : 'border-[#2d5a8a]/20 bg-gradient-to-br from-[#2d5a8a] to-[#1e3a5f]'
                  }`}
                >
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white" />
                    <div className="absolute right-24 bottom-0 w-24 h-24 rounded-full bg-white" />
                  </div>
                  <div className="relative p-5 lg:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className={`w-5 h-5 ${settingsState.maintenanceMode ? 'text-amber-700' : 'text-white/90'}`} />
                          <p
                            className={`text-[11px] font-semibold uppercase tracking-wider ${
                              settingsState.maintenanceMode ? 'text-amber-800' : 'text-white/70'
                            }`}
                          >
                            Platform status
                          </p>
                        </div>
                        <h2
                          className={`text-2xl font-bold ${settingsState.maintenanceMode ? 'text-amber-950' : 'text-white'}`}
                        >
                          {settingsState.maintenanceMode ? 'Maintenance mode active' : 'All systems operational'}
                        </h2>
                        <p className={`text-sm mt-1 max-w-lg ${settingsState.maintenanceMode ? 'text-amber-900/80' : 'text-white/75'}`}>
                          {settingsState.maintenanceMode
                            ? 'Learners and parents will see a pause notice until you turn this off.'
                            : 'CyberQuest is live — tune missions and parent bulletins below.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setSettingsState((prev) => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))
                        }
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-sm transition-all shrink-0 ${
                          settingsState.maintenanceMode
                            ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-900/20'
                            : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
                        }`}
                      >
                        <Wrench className="w-4 h-4" />
                        {settingsState.maintenanceMode ? 'Resume platform' : 'Maintenance mode'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
                      {[
                        { label: 'Parents', value: parents.length },
                        { label: 'Learners', value: children.length },
                        { label: 'Active', value: analytics.activeChildren },
                        { label: 'Missions on', value: `${enabledModuleCount}/4` },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className={`rounded-xl px-3 py-2.5 ${
                            settingsState.maintenanceMode ? 'bg-white/70 border border-amber-200/80' : 'bg-white/10 border border-white/10'
                          }`}
                        >
                          <p
                            className={`text-[10px] font-semibold uppercase tracking-wider ${
                              settingsState.maintenanceMode ? 'text-amber-800/70' : 'text-white/60'
                            }`}
                          >
                            {stat.label}
                          </p>
                          <p
                            className={`text-xl font-bold tabular-nums ${
                              settingsState.maintenanceMode ? 'text-amber-950' : 'text-white'
                            }`}
                          >
                            {stat.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Learning missions grid */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-[#2d5a8a]" />
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Learning missions</p>
                      <h3 className="text-lg font-semibold text-gray-900">Module mission board</h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {MODULE_CONFIG.map((mod) => {
                      const enabled = settingsState.modulesEnabled[mod.key];
                      const completions = analytics.moduleCompletions[mod.key];
                      const isFeatured = settingsState.featuredModule === mod.key;
                      return (
                        <div
                          key={mod.key}
                          className={`relative rounded-2xl border p-5 transition-all ${
                            enabled
                              ? 'bg-white border-gray-200/90 shadow-sm hover:shadow-md'
                              : 'bg-gray-50 border-gray-200 opacity-75'
                          }`}
                        >
                          {isFeatured && (
                            <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              Featured
                            </span>
                          )}
                          <div className="flex items-start gap-4">
                            <div
                              className={`w-14 h-14 rounded-xl bg-gradient-to-br ${mod.gradient} flex items-center justify-center text-2xl shadow-md shrink-0`}
                            >
                              {mod.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900">{mod.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{mod.tagline}</p>
                              <p className="text-xs text-[#2d5a8a] font-medium mt-2">
                                {completions} learner{completions !== 1 ? 's' : ''} completed
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                            <button
                              type="button"
                              onClick={() => toggleModule(mod.key)}
                              className={`flex-1 rounded-xl py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                                enabled
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
                              }`}
                            >
                              {enabled ? '● Live' : '○ Paused'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setSettingsState((prev) => ({ ...prev, featuredModule: mod.key }))}
                              className={`p-2 rounded-xl border transition-colors ${
                                isFeatured
                                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                                  : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-amber-600 hover:border-amber-200'
                              }`}
                              title="Set as featured mission"
                            >
                              <Star className={`w-4 h-4 ${isFeatured ? 'fill-amber-500' : ''}`} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="max-w-2xl">
                  {/* Parent bulletin */}
                  <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50">
                      <div className="flex items-center gap-2">
                        <Megaphone className="w-5 h-5 text-[#2d5a8a]" />
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Broadcast</p>
                          <h3 className="text-lg font-semibold text-gray-900">Parent bulletin</h3>
                        </div>
                      </div>
                    </div>
                    <div className="p-5 space-y-4">
                      <textarea
                        value={settingsState.parentAnnouncement}
                        onChange={(e) =>
                          setSettingsState((prev) => ({ ...prev, parentAnnouncement: e.target.value }))
                        }
                        rows={4}
                        placeholder="e.g. New Scam Safari levels are live this week — encourage your child to play!"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-[#2d5a8a]/30"
                      />
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                          Preview — how parents will see it
                        </p>
                        <div className="rounded-xl border border-[#2d5a8a]/20 bg-gradient-to-br from-[#2d5a8a]/5 to-indigo-50 p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[#2d5a8a] flex items-center justify-center shrink-0">
                              <Megaphone className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-[#2d5a8a] uppercase tracking-wide mb-1">
                                From CyberQuest Admin
                              </p>
                              <p className="text-sm text-gray-800 leading-relaxed">
                                {settingsState.parentAnnouncement.trim() ||
                                  'No bulletin posted yet. Add a message to keep parents in the loop.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save bar */}
                <div className="sticky bottom-0 -mx-4 lg:-mx-8 px-4 lg:px-8 py-4 bg-gray-50/95 backdrop-blur border-t border-gray-200/80">
                  <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-gray-500">
                      {enabledModuleCount} mission{enabledModuleCount !== 1 ? 's' : ''} live · Featured:{' '}
                      {MODULE_CONFIG.find((m) => m.key === settingsState.featuredModule)?.name}
                    </p>
                    <div className="flex items-center gap-3">
                      {settingsSaved && (
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                          <Check className="w-4 h-4" />
                          Saved
                        </span>
                      )}
                      <button
                        onClick={saveSettings}
                        disabled={settingsSaving}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2d5a8a] to-[#1e3a5f] text-white rounded-xl px-6 py-2.5 disabled:opacity-70 font-semibold hover:opacity-90 transition-opacity shadow-sm"
                      >
                        {settingsSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving…
                          </>
                        ) : (
                          <>
                            <Settings className="w-4 h-4" />
                            Deploy changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {loading && activeSection !== 'overview' && (
              <div className="flex items-center justify-center gap-2 mt-6 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading…
              </div>
            )}
            {!!error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <p>{error}</p>
                {/session expired|token required/i.test(error) && onSignOut && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="mt-2 text-sm font-semibold text-[#2d5a8a] hover:underline"
                  >
                    Return to welcome & sign in again
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {selectedChildId && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedChildId(null)} />
          <div className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-gray-200">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Learner progress</p>
                <h3 className="text-lg font-semibold text-gray-900">
                  {childProgressData?.child?.name || 'Loading…'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedChildId(null)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-5">
              {childProgressLoading && (
                <div className="flex flex-col items-center py-10 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#2d5a8a]" />
                  <p className="text-sm text-gray-500">Loading progress data…</p>
                </div>
              )}

              {!childProgressLoading && childProgressData && childSummary && (
                <div className="space-y-5">
                  {childProgressData.parent && (
                    <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                      <p className="text-xs text-gray-500">Parent account</p>
                      <p className="text-sm font-medium text-gray-900">{childProgressData.parent.name}</p>
                      <p className="text-xs text-gray-500">{childProgressData.parent.email}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Total score</p>
                      <p className="text-xl font-bold text-gray-900 tabular-nums">{childSummary.totalScore}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Accuracy</p>
                      <p className="text-xl font-bold text-gray-900 tabular-nums">{childSummary.accuracy}%</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">
                      Module progress
                    </p>
                    <div className="space-y-3">
                      {childSummary.modules.map((mod) => {
                        const pct = moduleProgressPercent(mod.completedCount, mod.totalLevels);
                        return (
                          <div key={mod.key}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-700 font-medium">{mod.name}</span>
                              <span className="text-gray-500">
                                {mod.completedCount}/{mod.totalLevels}
                                {mod.status === 'completed' && ' ✓'}
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#2d5a8a] transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">
                      Recent activity
                    </p>
                    <AdminActivityList
                      activities={activities.filter((a) => a.childId === selectedChildId)}
                      variant="timeline"
                      limit={6}
                      emptyMessage="No recorded activity for this learner yet."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
