export type GameLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type LevelCompleteStats = {
  levelScore: number;
  reactionTime: number;
  mistakes: string[];
};

export type LevelMeta = {
  level: GameLevel;
  title: string;
  concept: string;
  summary: string;
  hint: string;
  tips: string[];
  ageGroup: string;
  reward: string;
  mechanic: string;
};

export type FeedbackTone = 'correct' | 'wrong' | 'neutral';
