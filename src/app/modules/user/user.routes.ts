import { UserControllers } from './user.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { userValidation } from './user.validation';
import { Router } from 'express';
import checkAuth from '../../middlewares/checkAuth';
import { multerUpload } from '../../config/multer.config';
import { Role } from './user.interface';

export const router = Router();

router.post(
  '/register',
  validateRequest(userValidation.createUserZodSchema),
  UserControllers.createUser,
);
router.post(
  '/admin/register',
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(userValidation.createUserZodSchema),
  UserControllers.createUserForAdmin,
);

router.get(
  '/all-users',
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  UserControllers.getAllUsers,
);

router.get('/me', checkAuth(...Object.values(Role)), UserControllers.getMe);

router.patch(
  '/:id',
  checkAuth(...Object.values(Role)),
  multerUpload.single('file'),
  UserControllers.updateUser,
);

router.patch(
  '/:id',
  checkAuth(...Object.values(Role)),
  multerUpload.single('file'),
  UserControllers.updateUser,
);

router.patch(
  '/update-role/:id',
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  UserControllers.updateUserRole,
);

export const UserRoutes = router;
