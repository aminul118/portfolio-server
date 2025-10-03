import { Router } from 'express';
import { UserRoutes } from '../modules/user/user.routes';
import { AuthRouter } from '../modules/auth/auth.route';
import { OTPRouter } from '../modules/otp/otp.route';
import { IModuleRoutes } from '../types';
import { BlogRouter } from '../modules/blog/blog.routes';
import { ContactRouter } from '../modules/contact/contact.route';

const router = Router();

const moduleRoutes: IModuleRoutes[] = [
  {
    path: '/user',
    element: UserRoutes,
  },
  {
    path: '/auth',
    element: AuthRouter,
  },
  {
    path: '/otp',
    element: OTPRouter,
  },
  {
    path: '/blogs',
    element: BlogRouter,
  },
  {
    path: '/contact',
    element: ContactRouter,
  },
];

moduleRoutes.forEach((r) => {
  router.use(r.path, r.element);
});

export const routerV1 = router;
