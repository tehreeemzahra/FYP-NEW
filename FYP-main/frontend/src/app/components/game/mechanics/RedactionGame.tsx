import { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, Wifi, WifiOff } from 'lucide-react';
import { playUiClick } from '../../playUiClick';

export type RedactionZone = {
  id: string;
  label: string;
  isPrivate: boolean;
  explanation: string;
};

interface RedactionGameProps {
  imageTitle: string;
  zones: RedactionZone[];
  onAllComplete: () => void;
  onCorrect: (message: string) => void;
  onWrong: (message: string, mistakeId: string) => void;
}

export function RedactionGame({ imageTitle, zones, onAllComplete, onCorrect, onWrong }: RedactionGameProps) {
  const [blurred, setBlurred] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const toggle = (id: string) => {
    if (submitted) return;
    playUiClick(0.25);
    setBlurred((b) => {
      const next = new Set(b);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submit = () => {
    setSubmitted(true);
    const privateIds = new Set(zones.filter((z) => z.isPrivate).map((z) => z.id));
    const correct =
      blurred.size === privateIds.size && [...blurred].every((id) => privateIds.has(id));

    if (correct) {
      onCorrect('You protected all private details before sharing!');
      setTimeout(onAllComplete, 1500);
    } else {
      const missed = zones.find((z) => z.isPrivate && !blurred.has(z.id));
      const over = zones.find((z) => !z.isPrivate && blurred.has(z.id));
      onWrong((missed || over)?.explanation || 'Blur anything that reveals private info.', 'redaction_wrong');
      setTimeout(() => setSubmitted(false), 2200);
    }
  };

  return (
    <div className="cq-game-panel p-5 sm:p-6">
      <p className="text-white/80 text-sm mb-4">
        Tap areas on this post to blur private info before sharing. ({imageTitle})
      </p>

      <div className="relative bg-gradient-to-br from-indigo-900/60 to-purple-900/60 rounded-xl p-6 min-h-[220px] border border-white/10">
        <p className="text-white font-bold mb-4">📸 My day at the park!</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {zones.map((z) => (
            <motion.button
              key={z.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => toggle(z.id)}
              className={`p-3 rounded-lg text-left text-sm flex items-center gap-2 ${
                blurred.has(z.id) ? 'bg-black/60 blur-[2px] text-white/50' : 'bg-white/15 text-white'
              }`}
            >
              {blurred.has(z.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {z.label}
            </motion.button>
          ))}
        </div>
      </div>

      <motion.button whileTap={{ scale: 0.97 }} onClick={submit} className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 font-bold">
        Safe to Post
      </motion.button>
    </div>
  );
}

export type WifiNetwork = {
  id: string;
  name: string;
  secure: boolean;
  signal: number;
  explanation: string;
};

interface NetworkPickerGameProps {
  prompt: string;
  networks: WifiNetwork[];
  onAllComplete: () => void;
  onCorrect: (message: string) => void;
  onWrong: (message: string, mistakeId: string) => void;
}

export function NetworkPickerGame({ prompt, networks, onAllComplete, onCorrect, onWrong }: NetworkPickerGameProps) {
  const [picked, setPicked] = useState<string | null>(null);

  const choose = (net: WifiNetwork) => {
    playUiClick();
    setPicked(net.id);
    if (net.secure) {
      onCorrect(net.explanation);
      setTimeout(onAllComplete, 1500);
    } else {
      onWrong(net.explanation, `wifi_${net.id}`);
      setTimeout(() => setPicked(null), 2000);
    }
  };

  return (
    <div className="cq-game-panel p-5 sm:p-6">
      <p className="text-white mb-4 text-sm">{prompt}</p>
      <div className="space-y-2">
        {networks.map((n) => (
          <motion.button
            key={n.id}
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => choose(n)}
            className={`w-full p-4 rounded-xl flex items-center gap-3 text-left ${
              picked === n.id ? 'ring-2 ring-cyan-400 bg-cyan-500/20' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            {n.secure ? <Wifi className="w-5 h-5 text-green-400" /> : <WifiOff className="w-5 h-5 text-red-400" />}
            <div className="flex-1">
              <p className="font-mono text-sm">{n.name}</p>
              <div className="flex gap-0.5 mt-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i < n.signal ? 'bg-cyan-400' : 'bg-white/20'}`} />
                ))}
              </div>
            </div>
            <span className="text-xs text-white/60">{n.secure ? 'Secured' : 'Open'}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
