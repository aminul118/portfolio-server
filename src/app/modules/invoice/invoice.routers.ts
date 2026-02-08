import { Router } from 'express';
import { InvoiceControllers } from './invoice.controller';

const router = Router();

router.get('/get-all', InvoiceControllers.getAllInvoice);
router.get('/:id', InvoiceControllers.getSingleInvoice);
router.post('/create', InvoiceControllers.createInvoice);
router.put('/:id', InvoiceControllers.updateInvoice);
router.post('/:id/send', InvoiceControllers.sendInvoiceToUser);
router.delete('/:id', InvoiceControllers.deleteSingleInvoice);

export const InvoiceRouter = router;
