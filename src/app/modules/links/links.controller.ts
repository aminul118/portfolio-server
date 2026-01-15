import httpStatus from 'http-status-codes';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { LinkServices } from './links.service';

const createLinks = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const data = await LinkServices.createLinks(payload);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Links created successfully',
    data,
  });
});
const updateLink = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const { id } = req.params;
  const data = await LinkServices.updateLinks(payload, id);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Links updated successfully',
    data,
  });
});

const getAllLinks = catchAsync(async (req: Request, res: Response) => {
  const data = await LinkServices.getLinks();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Experience retrieved successfully',
    data,
  });
});

const deleteSingleLink = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await LinkServices.deleteLinkById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Delete successfully',
    data,
  });
});

export const LinkControllers = {
  updateLink,
  createLinks,
  getAllLinks,
  deleteSingleLink,
};
