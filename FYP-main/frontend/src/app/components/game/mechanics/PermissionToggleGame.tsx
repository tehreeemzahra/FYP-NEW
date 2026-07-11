import { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, ToggleLeft, ToggleRight } from 'lucide-react';
import { playUiClick } from '../../playUiClick';

export type Permission = {
  id: string;
  name: string;
  description: string;
  needed: boolean;
  explanation: string;
};

interface PermissionToggleGameProps {
  appName: string;
  permissions: Permission[];
  onAllComplete: () => void;
  onCorrect: (message: string) => void;
  onWrong: (message: string, mistakeId: string) => void;
}

export function PermissionToggleGame({
  appName,
  permissions,
  onAllComplete,
  onCorrect,
  onWrong,
}: PermissionToggleGameProps) {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(permissions.map((p) => [p.id, true])),
  );

  const toggle = (id: string) => {
    playUiClick(0.25);
    setEnabled((e) => ({ ...e, [id]: !e[id] }));
  };

  const submit = () => {
    const wrong = permissions.find((p) => enabled[p.id] !== p.needed);
    if (wrong) {
      onWrong(wrong.explanation, `perm_${wrong.id}`);
      return;
    }
    onCorrect('Smart permissions! You only allowed what the app truly needs.');
    setTimeout(onAllComplete, 1500);
  };

  return (
    <div className="cq-game-panel p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-12 h-12 rounded-xl bg-violet-500/30 flex items-center justify-center text-2xl">📱</div>
        <div>
          <p className="font-bold">{appName}</p>
          <p className="text-xs text-white/60">Review permissions before installing</p>
        </div>
      </div>

      <div className="space-y-3 mb-5">
        {permissions.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => toggle(p.id)}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/15 text-left"
          >
            {enabled[p.id] ? (
              <ToggleRight className="w-8 h-8 text-green-400 shrink-0" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-white/40 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{p.name}</p>
              <p className="text-xs text-white/60">{p.description}</p>
            </div>
          </button>
        ))}
      </div>

      <motion.button whileTap={{ scale: 0.97 }} onClick={submit} className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 font-bold flex items-center justify-center gap-2">
        <Shield className="w-5 h-5" />
        Approve Safe Settings
      </motion.button>
    </div>
  );
}
