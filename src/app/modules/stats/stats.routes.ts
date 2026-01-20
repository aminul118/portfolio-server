import { Router } from 'express';
import { StatsControllers } from './stats.controller';

const router = Router();

router.get('/', StatsControllers.getAdminStats);

export const StatsRouter = router;
