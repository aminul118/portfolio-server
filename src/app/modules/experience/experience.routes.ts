import { Router } from 'express';
import { ExperienceControllers } from './experience.controller';

const router = Router();

router.get('', ExperienceControllers.getAllExperience);
router.post('', ExperienceControllers.createExperience);
router.delete('/:id', ExperienceControllers.deleteSingleExperience);

export const ExperienceRouter = router;
