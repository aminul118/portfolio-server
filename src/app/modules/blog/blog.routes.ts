import { Router } from 'express';
import { multerUpload } from '../../config/multer.config';
import { BlogControllers } from './blog.controller';
import checkAuth from '../../middlewares/checkAuth';
import { Role } from '../user/user.interface';

const router = Router();

router.get('/', BlogControllers.getAllBlogs);

router.post(
  '/create',
  multerUpload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'photos', maxCount: 4 },
  ]),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  BlogControllers.createBlog,
);

router.get('/:slug', BlogControllers.getSingleBlog);

router.patch(
  '/:id',
  multerUpload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'photos', maxCount: 4 },
  ]),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  BlogControllers.updateBlog,
);

router.delete(
  '/:id',
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  BlogControllers.deleteSingleBlog,
);

export const BlogRouter = router;
