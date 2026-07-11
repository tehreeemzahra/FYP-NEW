export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_level', title: 'First Steps', description: 'Complete your first level in any module', icon: '🌟' },
  { id: 'investigator', title: 'Cyber Detective', description: 'Complete an investigation level', icon: '🔍' },
  { id: 'builder', title: 'Password Architect', description: 'Build a fortress-grade password', icon: '🏗️' },
  { id: 'sorter', title: 'Safety Sorter', description: 'Master a drag-and-drop sorting challenge', icon: '📦' },
  { id: 'maze_runner', title: 'Maze Runner', description: 'Navigate a cyber maze without hitting threats', icon: '🗺️' },
  { id: 'memory_master', title: 'Memory Master', description: 'Match all cybersecurity concept pairs', icon: '🧠' },
  { id: 'chat_hero', title: 'Chat Hero', description: 'Make safe choices in a chat simulator', icon: '💬' },
  { id: 'threat_responder', title: 'Threat Responder', description: 'Respond correctly to a timed cyber incident', icon: '⚡' },
  { id: 'boss_slayer', title: 'Cyber City Hero', description: 'Complete a boss rescue mission', icon: '👑' },
  { id: 'module_master', title: 'Module Master', description: 'Complete all 6 levels in one module', icon: '🏆' },
];
