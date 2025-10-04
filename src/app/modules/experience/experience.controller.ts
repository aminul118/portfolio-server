import httpStatus from 'http-status-codes';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ExperienceService } from './experience.service';

const createExperience = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const data = await ExperienceService.createExperience(payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Experience created successfully',
    data,
  });
});

const getAllExperience = catchAsync(async (req: Request, res: Response) => {
  const data = await ExperienceService.getAllExperience();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Experience retrieved successfully',
    data,
  });
});

const deleteSingleExperience = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    console.log(id);
    const data = await ExperienceService.deleteSingleExperience(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Experience Delete successfully',
      data,
    });
  },
);

export const ExperienceControllers = {
  createExperience,
  getAllExperience,
  deleteSingleExperience,
};
