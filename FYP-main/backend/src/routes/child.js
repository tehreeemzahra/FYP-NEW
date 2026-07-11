import { Router } from 'express';
import { Child } from '../models/Child.js';
import { authChild } from '../middleware/auth.js';

const router = Router();

// GET /api/child/parent — child auth, returns parent info for profile
router.get('/parent', authChild, async (req, res) => {
  try {
    const child = await Child.findById(req.child._id).populate('parentId', 'name email phone');
    const p = child?.parentId;
    if (!p) return res.status(404).json({ error: 'Parent not found' });
    res.json({
      parentName: p.name || '',
      parentEmail: p.email || '',
      parentPhone: p.phone || '',
      relationship: 'Parent',
    });
  } catch (e) {
    console.error('GET /child/parent', e);
    res.status(500).json({ error: 'Failed to load parent' });
  }
});

export default router;
