import { Router } from 'express';
import { Child } from '../models/Child.js';
import { GameProgress } from '../models/GameProgress.js';
import { Parent } from '../models/Parent.js';
import { authParent } from '../middleware/auth.js';
import { backfillActivityFromProgress } from '../lib/activityLog.js';
import { makeUniqueLoginCode, MAX_CHILDREN_PER_PARENT, validateChildDrafts } from '../lib/loginCode.js';

const router = Router();

// PUT /api/parent/password — change password while logged in
router.put('/password', authParent, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    const parent = await Parent.findById(req.parent._id).select('+password');
    if (!parent) return res.status(404).json({ error: 'Parent not found' });
    const ok = await parent.comparePassword(currentPassword);
    if (!ok) return res.status(401).json({ error: 'Current password is incorrect' });
    parent.password = newPassword;
    await parent.save();
    res.json({ ok: true, message: 'Password updated successfully.' });
  } catch (e) {
    console.error('PUT /parent/password', e);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

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

// GET /api/parent/children — parent auth
router.get('/children', authParent, async (req, res) => {
  try {
    const list = await Child.find({ parentId: req.parent._id }).lean();
    const arr = list.map((c) => ({
      ...c,
      id: c._id.toString(),
      parentId: c.parentId?.toString?.() || c.parentId,
    }));
    res.json(arr);
  } catch (e) {
    console.error('GET /parent/children', e);
    res.status(500).json({ error: 'Failed to load children' });
  }
});

// POST /api/parent/children — add another child (max 5 per parent)
router.post('/children', authParent, async (req, res) => {
  try {
    const { name, age } = req.body;
    const childError = validateChildDrafts([{ name, age }]);
    if (childError) return res.status(400).json({ error: childError });

    const count = await Child.countDocuments({ parentId: req.parent._id });
    if (count >= MAX_CHILDREN_PER_PARENT) {
      return res.status(400).json({
        error: `You can link up to ${MAX_CHILDREN_PER_PARENT} children on one parent account`,
      });
    }

    const trimmedName = String(name).trim();
    const duplicate = await Child.findOne({
      parentId: req.parent._id,
      name: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
    });
    if (duplicate) {
      return res.status(400).json({ error: 'You already have a child with this name' });
    }

    const loginCode = await makeUniqueLoginCode();
    const child = await Child.create({
      name: trimmedName,
      age: parseInt(age, 10),
      loginCode,
      parentId: req.parent._id,
    });

    res.status(201).json({
      child: {
        ...child.toObject(),
        id: child._id.toString(),
        parentId: req.parent._id.toString(),
      },
      loginCode,
    });
  } catch (e) {
    console.error('POST /parent/children', e);
    res.status(500).json({ error: e.message === 'No login codes available' ? e.message : 'Failed to add child' });
  }
});

// GET /api/parent/child/:childId/progress — parent auth (only their children)
router.get('/child/:childId/progress', authParent, async (req, res) => {
  try {
    const child = await Child.findOne({
      _id: req.params.childId,
      parentId: req.parent._id,
    });
    if (!child) return res.status(404).json({ error: 'Child not found' });
    let doc = await GameProgress.findOne({ childId: child._id });
    if (!doc) {
      doc = { completedLevels: [], lastPlayed: '', modules: defaultModules, inventory: [], totalScore: 0, activityLog: [] };
    } else if (!doc.activityLog?.length) {
      const backfill = backfillActivityFromProgress(doc, child.name);
      if (backfill.length > 0) {
        doc.activityLog = backfill;
        await doc.save();
      }
    }
    res.json({
      completedLevels: doc.completedLevels || [],
      lastPlayed: doc.lastPlayed || '',
      modules: { ...defaultModules, ...(doc.modules || {}) },
      inventory: doc.inventory || [],
      totalScore: doc.totalScore || 0,
      activityLog: (doc.activityLog || []).map((entry) => ({
        type: entry.type,
        module: entry.module,
        level: entry.level,
        message: entry.message,
        at: entry.at,
      })),
    });
  } catch (e) {
    console.error('GET /parent/child/:id/progress', e);
    res.status(500).json({ error: 'Failed to load progress' });
  }
});

export default router;
