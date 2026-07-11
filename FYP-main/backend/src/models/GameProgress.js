import mongoose from 'mongoose';

const gameProgressSchema = new mongoose.Schema({
  childId: { type: mongoose.Schema.Types.ObjectId, ref: 'Child', required: true, unique: true },
  completedLevels: { type: [Number], default: [] },
  lastPlayed: { type: String, default: '' },
  modules: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      scamSafari: {
        completedLevels: [],
        scam_score: 0,
        mistake_patterns: [],
        reaction_time: 0,
        rewards: [],
        difficulty: 1,
      },
      privacyVillage: {
        completedLevels: [],
        privacy_score: 0,
        mistake_patterns: [],
        reaction_time: 0,
        rewards: [],
        difficulty: 1,
      },
      cyberbullyBattle: {
        completedLevels: [],
        behavior_score: 0,
        response_accuracy: 0,
        decision_speed: 0,
        rewards: [],
        difficulty: 1,
      },
    },
  },
  inventory: { type: [String], default: [] },
  totalScore: { type: Number, default: 0 },
  /** Parent-facing activity feed (login, level complete, module play, etc.) */
  activityLog: {
    type: [
      {
        type: { type: String, required: true },
        module: String,
        level: Number,
        message: { type: String, required: true },
        at: { type: Date, default: Date.now },
      },
    ],
    default: [],
  },
}, { timestamps: true });

export const GameProgress = mongoose.model('GameProgress', gameProgressSchema);
