import { Router } from 'express';
import { multerUpload } from '../../config/multer.config';
import { ProjectControllers } from './project.controller';

const router = Router();

router.get('/', ProjectControllers.getAllProjects);
router.post(
  '',
  multerUpload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'photos', maxCount: 10 },
  ]),
  ProjectControllers.createProject,
);

router.get('/:slug', ProjectControllers.getSingleProject);
router.put(
  '/:id',
  multerUpload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'photos', maxCount: 10 },
  ]),
  ProjectControllers.updateProject,
);
router.delete('/:id', ProjectControllers.deleteSingleProject);

export const ProjectRouter = router;
