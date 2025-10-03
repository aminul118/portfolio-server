import { Router } from 'express';
import { multerUpload } from '../../config/multer.config';
import { BlogControllers } from './blog.controller';

const router = Router();

router.get('/', BlogControllers.getAllBlogs);
router.post(
  '/create',
  multerUpload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'photos', maxCount: 10 },
  ]),
  BlogControllers.createBlog,
);

router.get('/:slug', BlogControllers.getSingleBlog);
router.delete('/:id', BlogControllers.deleteSingleBlog);

export const BlogRouter = router;
