import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { AlertOctagon, Clock } from 'lucide-react';
import { playUiClick } from '../../playUiClick';

export type ThreatAction = {
  id: string;
  label: string;
  isCorrect: boolean;
  explanation: string;
};

export type ThreatIncident = {
  id: string;
  title: string;
  description: string;
  actions: ThreatAction[];
  timeLimit?: number;
};

interface ThreatResponseGameProps {
  incidents: ThreatIncident[];
  onRoundComplete: () => void;
  onAllComplete: () => void;
  onCorrect: (message: string) => void;
  onWrong: (message: string, mistakeId: string) => void;
}

export function ThreatResponseGame({
  incidents,
  onRoundComplete,
  onAllComplete,
  onCorrect,
  onWrong,
}: ThreatResponseGameProps) {
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(incidents[0].timeLimit ?? 15);
  const [locked, setLocked] = useState(false);
  const incident = incidents[index];
  const onWrongRef = useRef(onWrong);
  onWrongRef.current = onWrong;

  useEffect(() => {
    if (locked) return;
    const limit = incident.timeLimit ?? 15;
    setTimeLeft(limit);
    let timedOut = false;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (!timedOut) {
            timedOut = true;
            onWrongRef.current(
              'Time ran out! Quick, calm responses matter in cyber incidents.',
              `${incident.id}_timeout`,
            );
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [index, locked, incident.id, incident.timeLimit]);

  const act = (action: ThreatAction) => {
    if (locked) return;
    playUiClick();
    setLocked(true);

    if (action.isCorrect) {
      onCorrect(action.explanation);
      setTimeout(() => {
        onRoundComplete();
        if (index >= incidents.length - 1) onAllComplete();
        else {
          setIndex((i) => i + 1);
          setLocked(false);
        }
      }, 1800);
    } else {
      onWrong(action.explanation, `${incident.id}_${action.id}`);
      setTimeout(() => setLocked(false), 2000);
    }
  };

  return (
    <div className="cq-game-panel p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-red-300">
          <AlertOctagon className="w-5 h-5" />
          <span className="font-semibold text-sm">Incident {index + 1}/{incidents.length}</span>
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold ${timeLeft <= 5 ? 'text-red-400' : 'text-amber-300'}`}>
          <Clock className="w-4 h-4" /> {timeLeft}s
        </div>
      </div>

      <h3 className="text-lg font-bold text-white mb-2">{incident.title}</h3>
      <p className="text-white/85 text-sm mb-5">{incident.description}</p>

      <div className="grid gap-2 sm:grid-cols-2">
        {incident.actions.map((a) => (
          <motion.button
            key={a.id}
            type="button"
            whileTap={{ scale: 0.97 }}
            disabled={locked}
            onClick={() => act(a)}
            className="p-4 rounded-xl bg-white/15 hover:bg-white/25 text-left text-sm font-semibold disabled:opacity-50"
          >
            {a.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
