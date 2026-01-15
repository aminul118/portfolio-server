import { Router } from 'express';
import { LinkControllers } from './links.controller';

const router = Router();

router.get('', LinkControllers.getAllLinks);
router.post('', LinkControllers.createLinks);
router.put('/:id', LinkControllers.updateLink);
router.delete('/:id', LinkControllers.deleteSingleLink);

export const LinkRouter = router;
