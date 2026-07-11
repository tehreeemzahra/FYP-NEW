import { useCallback, useState } from 'react';
import { motion } from 'motion/react';
import { Flag, Shield, Skull } from 'lucide-react';
import { playUiClick } from '../../playUiClick';

type Cell = 'empty' | 'wall' | 'threat' | 'goal' | 'start';

export type MazeLayout = {
  grid: Cell[][];
  start: { x: number; y: number };
  goal: { x: number; y: number };
};

interface MazeGameProps {
  mazes: MazeLayout[];
  threatLabel?: string;
  onRoundComplete: () => void;
  onAllComplete: () => void;
  onCorrect: (message: string) => void;
  onWrong: (message: string, mistakeId: string) => void;
}

export function MazeGame({
  mazes,
  threatLabel = 'Threat',
  onRoundComplete,
  onAllComplete,
  onCorrect,
  onWrong,
}: MazeGameProps) {
  const [mazeIndex, setMazeIndex] = useState(0);
  const maze = mazes[mazeIndex];
  const [pos, setPos] = useState(maze.start);
  const [moves, setMoves] = useState(0);

  const resetMaze = useCallback(
    (index: number) => {
      setPos(mazes[index].start);
      setMoves(0);
    },
    [mazes],
  );

  const move = (dx: number, dy: number) => {
    const nx = pos.x + dx;
    const ny = pos.y + dy;
    if (ny < 0 || ny >= maze.grid.length || nx < 0 || nx >= maze.grid[0].length) return;
    const cell = maze.grid[ny][nx];
    if (cell === 'wall') return;

    playUiClick(0.25);
    setMoves((m) => m + 1);
    setPos({ x: nx, y: ny });

    if (cell === 'threat') {
      onWrong(`${threatLabel} blocked your path! Find a safer route.`, `maze_${mazeIndex}_threat`);
      setTimeout(() => resetMaze(mazeIndex), 1200);
      return;
    }

    if (cell === 'goal') {
      onCorrect('You navigated safely through the danger zone!');
      setTimeout(() => {
        onRoundComplete();
        if (mazeIndex >= mazes.length - 1) onAllComplete();
        else {
          setMazeIndex((i) => i + 1);
          resetMaze(mazeIndex + 1);
        }
      }, 1400);
    }
  };

  const cellIcon = (cell: Cell, isPlayer: boolean) => {
    if (isPlayer) return <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300" />;
    if (cell === 'threat') return <Skull className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />;
    if (cell === 'goal') return <Flag className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />;
    return null;
  };

  return (
    <div className="cq-game-panel p-5 sm:p-6">
      <p className="text-white/80 text-sm mb-4">
        Maze {mazeIndex + 1} of {mazes.length} — reach the flag without hitting threats. Moves: {moves}
      </p>

      <div className="inline-grid gap-1 mx-auto mb-5" style={{ gridTemplateColumns: `repeat(${maze.grid[0].length}, minmax(0, 1fr))` }}>
        {maze.grid.map((row, y) =>
          row.map((cell, x) => {
            const isPlayer = pos.x === x && pos.y === y;
            return (
              <div
                key={`${x}-${y}`}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center ${
                  cell === 'wall'
                    ? 'bg-slate-800'
                    : cell === 'threat'
                    ? 'bg-red-900/50'
                    : cell === 'goal'
                    ? 'bg-green-900/50'
                    : 'bg-white/10'
                } ${isPlayer ? 'ring-2 ring-cyan-400' : ''}`}
              >
                {cellIcon(cell, isPlayer)}
              </div>
            );
          }),
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 w-full max-w-[min(100%,12rem)] sm:max-w-[14rem] mx-auto">
        <div />
        <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={() => move(0, -1)} className="cq-touch-target py-3 rounded-lg bg-white/15 font-bold">↑</motion.button>
        <div />
        <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={() => move(-1, 0)} className="py-3 rounded-lg bg-white/15 font-bold">←</motion.button>
        <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={() => move(0, 1)} className="py-3 rounded-lg bg-white/15 font-bold">↓</motion.button>
        <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={() => move(1, 0)} className="py-3 rounded-lg bg-white/15 font-bold">→</motion.button>
      </div>
    </div>
  );
}
