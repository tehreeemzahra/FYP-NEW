import { Router } from 'express';
import { authAdmin } from '../middleware/auth.js';
import { Parent } from '../models/Parent.js';
import { Child } from '../models/Child.js';
import { GameProgress } from '../models/GameProgress.js';
import { AdminSettings, normalizeAdminSettings, DEFAULT_MODULES_ENABLED } from '../models/AdminSettings.js';
import { backfillActivityFromProgress, LEVELS_PER_MODULE } from '../lib/activityLog.js';

const router = Router();

const defaultModules = {
  scamSafari: { completedLevels: [] },
  privacyVillage: { completedLevels: [] },
  cyberbullyBattle: { completedLevels: [] },
};

function moduleCompletedCount(progressDocs, moduleKey) {
  if (moduleKey === 'passwordCastle') {
    return progressDocs.filter((d) => (d.completedLevels || []).length >= LEVELS_PER_MODULE).length;
  }
  return progressDocs.filter(
    (d) => (d.modules?.[moduleKey]?.completedLevels || []).length >= LEVELS_PER_MODULE,
  ).length;
}

router.use(authAdmin);

// GET /api/admin/users
router.get('/users', async (_req, res) => {
  try {
    const parents = await Parent.find({}).select('-password').lean();
    const children = await Child.find({}).lean();

    const parentMap = new Map();
    for (const parent of parents) {
      parentMap.set(String(parent._id), {
        ...parent,
        id: String(parent._id),
        children: [],
      });
    }

    const normalizedChildren = children.map((child) => {
      const parentId = String(child.parentId);
      const childObj = {
        ...child,
        id: String(child._id),
        parentId,
      };
      const p = parentMap.get(parentId);
      if (p) p.children.push(childObj);
      return childObj;
    });

    res.json({
      parents: Array.from(parentMap.values()),
      children: normalizedChildren,
    });
  } catch (e) {
    console.error('GET /admin/users', e);
    res.status(500).json({ error: 'Failed to load admin users' });
  }
});

// PUT /api/admin/parent/:parentId
router.put('/parent/:parentId', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = String(name).trim();
    if (email !== undefined) updates.email = String(email).toLowerCase().trim();
    if (phone !== undefined) updates.phone = String(phone).trim();
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const parent = await Parent.findByIdAndUpdate(req.params.parentId, updates, {
      new: true,
      runValidators: true,
    }).select('-password');
    if (!parent) return res.status(404).json({ error: 'Parent not found' });

    const obj = parent.toObject();
    obj.id = String(parent._id);
    res.json({ parent: obj });
  } catch (e) {
    console.error('PUT /admin/parent/:id', e);
    res.status(500).json({ error: 'Failed to update parent' });
  }
});

// PUT /api/admin/child/:childId
router.put('/child/:childId', async (req, res) => {
  try {
    const { name, age, loginCode } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = String(name).trim();
    if (age !== undefined) updates.age = Number(age);
    if (loginCode !== undefined) updates.loginCode = String(loginCode).padStart(2, '0').slice(-2);
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const child = await Child.findByIdAndUpdate(req.params.childId, updates, {
      new: true,
      runValidators: true,
    });
    if (!child) return res.status(404).json({ error: 'Child not found' });

    const obj = child.toObject();
    obj.id = String(child._id);
    obj.parentId = String(child.parentId);
    res.json({ child: obj });
  } catch (e) {
    console.error('PUT /admin/child/:id', e);
    res.status(500).json({ error: 'Failed to update child' });
  }
});

// DELETE /api/admin/parent/:parentId
router.delete('/parent/:parentId', async (req, res) => {
  try {
    const parentId = req.params.parentId;
    const parent = await Parent.findById(parentId);
    if (!parent) return res.status(404).json({ error: 'Parent not found' });

    const children = await Child.find({ parentId }).select('_id').lean();
    const childIds = children.map((c) => c._id);

    await GameProgress.deleteMany({ childId: { $in: childIds } });
    await Child.deleteMany({ parentId });
    await Parent.findByIdAndDelete(parentId);

    res.json({ ok: true });
  } catch (e) {
    console.error('DELETE /admin/parent/:id', e);
    res.status(500).json({ error: 'Failed to delete parent' });
  }
});

// DELETE /api/admin/child/:childId
router.delete('/child/:childId', async (req, res) => {
  try {
    const child = await Child.findById(req.params.childId);
    if (!child) return res.status(404).json({ error: 'Child not found' });

    await GameProgress.deleteMany({ childId: child._id });
    await Child.findByIdAndDelete(child._id);

    res.json({ ok: true });
  } catch (e) {
    console.error('DELETE /admin/child/:id', e);
    res.status(500).json({ error: 'Failed to delete child' });
  }
});

// GET /api/admin/analytics
router.get('/analytics', async (_req, res) => {
  try {
    const [totalParents, totalChildren, progressDocs] = await Promise.all([
      Parent.countDocuments(),
      Child.countDocuments(),
      GameProgress.find({}).lean(),
    ]);

    const totalScores = progressDocs.map((d) => Number(d.totalScore) || 0);
    const avgScore = totalScores.length
      ? Math.round(totalScores.reduce((a, b) => a + b, 0) / totalScores.length)
      : 0;
    const highestScore = totalScores.length ? Math.max(...totalScores) : 0;
    const activeChildren = progressDocs.filter((d) => (d.lastPlayed || '').trim() !== '').length;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [recentParents, recentChildren] = await Promise.all([
      Parent.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Child.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    ]);

    const totalLevelsCompleted = progressDocs.reduce((sum, doc) => {
      let levels = (doc.completedLevels || []).length;
      for (const key of ['scamSafari', 'privacyVillage', 'cyberbullyBattle']) {
        levels += (doc.modules?.[key]?.completedLevels || []).length;
      }
      return sum + levels;
    }, 0);

    res.json({
      totalParents,
      totalChildren,
      activeChildren,
      avgScore,
      highestScore,
      totalLevelsCompleted,
      recentRegistrations: recentParents + recentChildren,
      moduleCompletions: {
        passwordCastle: moduleCompletedCount(progressDocs, 'passwordCastle'),
        scamSafari: moduleCompletedCount(progressDocs, 'scamSafari'),
        privacyVillage: moduleCompletedCount(progressDocs, 'privacyVillage'),
        cyberbullyBattle: moduleCompletedCount(progressDocs, 'cyberbullyBattle'),
      },
    });
  } catch (e) {
    console.error('GET /admin/analytics', e);
    res.status(500).json({ error: 'Failed to load analytics' });
  }
});

// GET /api/admin/activity — platform-wide feed (child progress + parent/child account events)
router.get('/activity', async (_req, res) => {
  try {
    const [parents, children, progressDocs] = await Promise.all([
      Parent.find({}).select('name email createdAt').lean(),
      Child.find({}).lean(),
      GameProgress.find({}).lean(),
    ]);

    const parentMap = new Map(
      parents.map((p) => [String(p._id), { name: p.name, email: p.email, createdAt: p.createdAt }]),
    );
    const childMap = new Map(
      children.map((c) => [
        String(c._id),
        {
          id: String(c._id),
          name: c.name,
          parentId: String(c.parentId),
          createdAt: c.createdAt,
        },
      ]),
    );

    const activities = [];

    for (const parent of parents) {
      activities.push({
        type: 'parent_registered',
        message: `${parent.name} registered a parent account`,
        at: parent.createdAt,
        parentId: String(parent._id),
        parentName: parent.name,
        source: 'platform',
      });
    }

    for (const child of children) {
      const parent = parentMap.get(String(child.parentId));
      activities.push({
        type: 'child_linked',
        message: `${parent?.name || 'A parent'} linked learner ${child.name}`,
        at: child.createdAt,
        childId: String(child._id),
        childName: child.name,
        parentId: String(child.parentId),
        parentName: parent?.name || 'Unknown',
        source: 'platform',
      });
    }

    for (const doc of progressDocs) {
      const childId = String(doc.childId);
      const child = childMap.get(childId);
      if (!child) continue;

      const parent = parentMap.get(child.parentId);
      let log = doc.activityLog || [];
      if (!log.length) {
        log = backfillActivityFromProgress(doc, child.name);
      }

      for (const entry of log) {
        activities.push({
          type: entry.type,
          module: entry.module,
          level: entry.level,
          message: entry.message,
          at: entry.at,
          childId,
          childName: child.name,
          parentId: child.parentId,
          parentName: parent?.name || 'Unknown',
          source: 'child',
        });
      }
    }

    activities.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

    res.json({ activities: activities.slice(0, 100) });
  } catch (e) {
    console.error('GET /admin/activity', e);
    res.status(500).json({ error: 'Failed to load activity feed' });
  }
});

// GET /api/admin/child/:childId/progress — admin drill-down for any child
router.get('/child/:childId/progress', async (req, res) => {
  try {
    const child = await Child.findById(req.params.childId);
    if (!child) return res.status(404).json({ error: 'Child not found' });

    const parent = await Parent.findById(child.parentId).select('name email').lean();
    let doc = await GameProgress.findOne({ childId: child._id });
    if (!doc) {
      doc = {
        completedLevels: [],
        lastPlayed: '',
        modules: defaultModules,
        inventory: [],
        totalScore: 0,
        activityLog: [],
      };
    } else if (!doc.activityLog?.length) {
      const backfill = backfillActivityFromProgress(doc, child.name);
      if (backfill.length > 0) {
        doc.activityLog = backfill;
        await doc.save();
      }
    }

    res.json({
      child: {
        id: String(child._id),
        name: child.name,
        age: child.age,
        loginCode: child.loginCode,
        parentId: String(child.parentId),
      },
      parent: parent
        ? { id: String(parent._id), name: parent.name, email: parent.email }
        : null,
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
    console.error('GET /admin/child/:id/progress', e);
    res.status(500).json({ error: 'Failed to load child progress' });
  }
});

// GET /api/admin/settings
router.get('/settings', async (_req, res) => {
  try {
    let settings = await AdminSettings.findOne({ singleton: 'main' }).lean();
    if (!settings) {
      const created = await AdminSettings.create({ singleton: 'main' });
      settings = created.toObject();
    }
    res.json(normalizeAdminSettings(settings));
  } catch (e) {
    console.error('GET /admin/settings', e);
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

// PUT /api/admin/settings
router.put('/settings', async (req, res) => {
  try {
    const {
      maintenanceMode,
      parentAnnouncement,
      featuredModule,
      difficultyPreset,
      modulesEnabled,
    } = req.body;
    const updates = {};

    if (maintenanceMode !== undefined) updates.maintenanceMode = Boolean(maintenanceMode);
    if (parentAnnouncement !== undefined) updates.parentAnnouncement = String(parentAnnouncement);
    if (featuredModule !== undefined) updates.featuredModule = String(featuredModule);
    if (difficultyPreset !== undefined) updates.difficultyPreset = String(difficultyPreset);
    if (modulesEnabled !== undefined && typeof modulesEnabled === 'object') {
      updates.modulesEnabled = {
        ...DEFAULT_MODULES_ENABLED,
        ...modulesEnabled,
      };
    }

    const settings = await AdminSettings.findOneAndUpdate(
      { singleton: 'main' },
      { $set: updates, $setOnInsert: { singleton: 'main' } },
      { new: true, upsert: true, runValidators: true },
    ).lean();

    res.json(normalizeAdminSettings(settings));
  } catch (e) {
    console.error('PUT /admin/settings', e);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
