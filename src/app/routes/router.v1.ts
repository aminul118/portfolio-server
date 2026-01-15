import { Router } from 'express';
import { UserRoutes } from '../modules/user/user.routes';
import { AuthRouter } from '../modules/auth/auth.route';
import { OTPRouter } from '../modules/otp/otp.route';
import { IModuleRoutes } from '../types';
import { BlogRouter } from '../modules/blog/blog.routes';
import { ContactRouter } from '../modules/contact/contact.route';
import { ExperienceRouter } from '../modules/experience/experience.routes';
import { ProjectRouter } from '../modules/project/project.routes';
import { LinkRouter } from '../modules/links/links.routes';

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
    path: '/contact',
    element: ContactRouter,
  },
  {
    path: '/blogs',
    element: BlogRouter,
  },
  {
    path: '/projects',
    element: ProjectRouter,
  },

  {
    path: '/experience',
    element: ExperienceRouter,
  },

  {
    path: '/links',
    element: LinkRouter,
  },
];

moduleRoutes.forEach((r) => {
  router.use(r.path, r.element);
});

export const routerV1 = router;
