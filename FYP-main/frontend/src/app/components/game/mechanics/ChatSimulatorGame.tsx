import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Phone } from 'lucide-react';
import { playUiClick } from '../../playUiClick';

export type ChatMessage = {
  id: string;
  from: 'them' | 'you' | 'system';
  text: string;
};

export type ChatChoice = {
  id: string;
  text: string;
  isSafe: boolean;
  reply?: string;
  explanation: string;
};

export type ChatNode = {
  id: string;
  messages: ChatMessage[];
  choices: ChatChoice[];
};

interface ChatSimulatorGameProps {
  nodes: ChatNode[];
  mode?: 'chat' | 'phone';
  onNodeComplete: () => void;
  onAllComplete: () => void;
  onCorrect: (message: string) => void;
  onWrong: (message: string, mistakeId: string) => void;
}

export function ChatSimulatorGame({
  nodes,
  mode = 'chat',
  onNodeComplete,
  onAllComplete,
  onCorrect,
  onWrong,
}: ChatSimulatorGameProps) {
  const [nodeIndex, setNodeIndex] = useState(0);
  const [extraMessages, setExtraMessages] = useState<ChatMessage[]>([]);
  const [waiting, setWaiting] = useState(false);

  const node = nodes[nodeIndex];
  const Icon = mode === 'phone' ? Phone : MessageCircle;
  const history = [...node.messages, ...extraMessages];

  const pick = (choice: ChatChoice) => {
    if (waiting) return;
    playUiClick();
    setWaiting(true);
    setExtraMessages((h) => [...h, { id: `you-${choice.id}`, from: 'you', text: choice.text }]);

    if (choice.isSafe) {
      onCorrect(choice.explanation);
      if (choice.reply) {
        setTimeout(() => {
          setExtraMessages((h) => [...h, { id: `reply-${choice.id}`, from: 'them', text: choice.reply! }]);
        }, 500);
      }
      setTimeout(() => {
        onNodeComplete();
        if (nodeIndex >= nodes.length - 1) onAllComplete();
        else {
          setNodeIndex((i) => i + 1);
          setExtraMessages([]);
          setWaiting(false);
        }
      }, 2000);
    } else {
      onWrong(choice.explanation, `chat_${node.id}_${choice.id}`);
      setTimeout(() => {
        setExtraMessages([]);
        setWaiting(false);
      }, 2200);
    }
  };

  return (
    <div className="cq-game-panel p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4 text-cyan-200 flex-wrap">
        <Icon className="w-5 h-5 shrink-0" />
        <span className="font-semibold text-sm sm:text-base">
          {mode === 'phone' ? 'Incoming Call' : 'Live Chat'} — Scene {nodeIndex + 1}/{nodes.length}
        </span>
      </div>

      <div className="cq-chat-box bg-slate-900/50 rounded-xl p-3 sm:p-4 min-h-[160px] max-h-[40vh] sm:max-h-[320px] overflow-y-auto space-y-3 mb-4">
        <AnimatePresence>
          {history.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.from === 'you' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${
                  msg.from === 'you'
                    ? 'bg-cyan-600 text-white rounded-br-sm'
                    : msg.from === 'system'
                    ? 'bg-amber-500/20 text-amber-100 text-center w-full'
                    : 'bg-white/15 text-white rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="grid gap-2">
        {node.choices.map((c) => (
          <motion.button
            key={c.id}
            type="button"
            whileTap={{ scale: 0.98 }}
            disabled={waiting}
            onClick={() => pick(c)}
            className="p-3 rounded-xl bg-white/15 hover:bg-white/25 text-left text-sm font-medium disabled:opacity-50"
          >
            {c.text}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
