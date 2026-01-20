import httpStatus from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { Request, Response } from 'express';
import { statsServices } from './stats.services';

const getAdminStats = catchAsync(async (req: Request, res: Response) => {
  const data = await statsServices.getAdminStats();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin stats fetched successfully',
    data,
  });
});

export const StatsControllers = {
  getAdminStats,
};
