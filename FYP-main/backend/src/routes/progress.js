import { Router } from 'express';
import { GameProgress } from '../models/GameProgress.js';
import { authChild } from '../middleware/auth.js';
import { eventsFromProgressDiff, mergeActivityLog } from '../lib/activityLog.js';
import {
  getPlatformSettings,
  publicPlatformPayload,
  sanitizeProgressBody,
} from '../lib/platformSettings.js';

const router = Router();
const defaultModules = {
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
};

// GET /api/progress — child auth
router.get('/', authChild, async (req, res) => {
  try {
    let doc = await GameProgress.findOne({ childId: req.child._id });
    if (!doc) {
      doc = await GameProgress.create({
        childId: req.child._id,
        completedLevels: [],
        lastPlayed: new Date().toISOString(),
        modules: defaultModules,
        inventory: [],
        totalScore: 0,
      });
    }
    const platform = await getPlatformSettings();
    res.json({
      completedLevels: doc.completedLevels || [],
      lastPlayed: doc.lastPlayed || '',
      modules: { ...defaultModules, ...(doc.modules || {}) },
      inventory: doc.inventory || [],
      totalScore: doc.totalScore || 0,
      activityLog: doc.activityLog || [],
      platform: publicPlatformPayload(platform),
    });
  } catch (e) {
    console.error('GET /progress', e);
    res.status(500).json({ error: 'Failed to load progress' });
  }
});

// PUT /api/progress — child auth
router.put('/', authChild, async (req, res) => {
  try {
    const platform = await getPlatformSettings();
    if (platform.maintenanceMode) {
      return res.status(503).json({ error: 'CyberQuest is under maintenance. Try again later!' });
    }

    const existing = await GameProgress.findOne({ childId: req.child._id });
    const sanitized = sanitizeProgressBody(req.body, existing, platform);
    const newEvents = eventsFromProgressDiff(existing, sanitized, req.child.name);
    const activityLog = mergeActivityLog(existing?.activityLog, newEvents);

    const doc = await GameProgress.findOneAndUpdate(
      { childId: req.child._id },
      {
        completedLevels: sanitized.completedLevels,
        lastPlayed: sanitized.lastPlayed,
        modules:
          typeof sanitized.modules === 'object' && sanitized.modules
            ? { ...defaultModules, ...sanitized.modules }
            : defaultModules,
        inventory: sanitized.inventory,
        totalScore: sanitized.totalScore,
        activityLog,
      },
      { new: true, upsert: true }
    );
    res.json({
      completedLevels: doc.completedLevels || [],
      lastPlayed: doc.lastPlayed || '',
      modules: { ...defaultModules, ...(doc.modules || {}) },
      inventory: doc.inventory || [],
      totalScore: doc.totalScore || 0,
      activityLog: doc.activityLog || [],
      platform: publicPlatformPayload(platform),
    });
  } catch (e) {
    console.error('PUT /progress', e);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

export default router;
