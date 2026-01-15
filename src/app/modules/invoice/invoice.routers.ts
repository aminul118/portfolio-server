import { Router } from 'express';
import { InvoiceControllers } from './invoice.controller';

const router = Router();

router.get('', InvoiceControllers.getAllInvoice);
router.get('/:id', InvoiceControllers.getSingleInvoice);
router.post('', InvoiceControllers.createInvoice);
router.delete('/:id', InvoiceControllers.deleteSingleInvoice);

export const InvoiceRouter = router;
