import { Router } from 'express';
import { getPlatformSettings, publicPlatformPayload } from '../lib/platformSettings.js';

const router = Router();

// GET /api/settings/platform — read-only platform config for child/parent apps
router.get('/platform', async (_req, res) => {
  try {
    const platform = await getPlatformSettings();
    res.json(publicPlatformPayload(platform));
  } catch (e) {
    console.error('GET /settings/platform', e);
    res.status(500).json({ error: 'Failed to load platform settings' });
  }
});

export default router;
