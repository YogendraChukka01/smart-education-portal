import { Router, Response } from 'express';
import { authenticateJwt, AuthRequest, requireRoles } from '../middleware/auth.middleware';
import { ROLES } from '@ayush-portal/shared';
import { buildIndustryIntelligence } from '../services/industry.intelligence';

const router = Router();

router.get('/overview', authenticateJwt, requireRoles(
  ROLES.STUDENT,
  ROLES.ACADEMICIAN,
  ROLES.INDUSTRY,
  ROLES.INSTITUTION_ADMIN,
), async (_req: AuthRequest, res: Response) => {
  try {
    res.json(await buildIndustryIntelligence());
  } catch (error) {
    console.error('Industry intelligence error:', error);
    res.status(500).json({ error: 'Failed to build industry intelligence' });
  }
});

export default router;
