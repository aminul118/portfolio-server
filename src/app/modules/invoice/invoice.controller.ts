import httpStatus from 'http-status-codes';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { InvoiceService } from './invoice.services';

const createInvoice = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const data = await InvoiceService.createInvoice(payload);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Invoice created successfully',
    data,
  });
});

const updateInvoice = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const data = await InvoiceService.updateInvoice(req.params.id, payload);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Invoice updated successfully',
    data,
  });
});

const sendInvoiceToUser = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const { id } = req.params;

  if (!id || typeof id !== 'string') {
    throw new Error('Invalid invoice id');
  }

  if (!email || typeof email !== 'string') {
    throw new Error('Invalid email address');
  }

  const data = await InvoiceService.sendInvoiceToUser(email, id);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Invoice sent successfully',
    data,
  });
});

const getAllInvoice = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, string>;
  const { data, meta } = await InvoiceService.getAllInvoice(query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Invoices retrieved successfully',
    data,
    meta,
  });
});

const getSingleInvoice = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await InvoiceService.getSingleInvoice(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Invoice retrieved successfully',
    data,
  });
});

const deleteSingleInvoice = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await InvoiceService.deleteSingleInvoice(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Invoice deleted successfully',
    data,
  });
});

export const InvoiceControllers = {
  createInvoice,
  getAllInvoice,
  getSingleInvoice,
  deleteSingleInvoice,
  sendInvoiceToUser,
  updateInvoice,
};
