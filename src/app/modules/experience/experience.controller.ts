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

const updateSingleExperience = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const { id } = req.params;

    const data = await ExperienceService.updateSingleExperience(payload, id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Experience updated successfully',
      data,
    });
  },
);

const getAllExperience = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, string>;
  const { data, meta } = await ExperienceService.getAllExperience(
    query as Record<string, string>,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Experience retrieved successfully',
    data,
    meta,
  });
});

const deleteSingleExperience = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

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
  updateSingleExperience,
  getAllExperience,
  deleteSingleExperience,
};
