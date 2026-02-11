import httpStatus from 'http-status-codes';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ProjectServices } from './project.service';

const createProject = catchAsync(async (req: Request, res: Response) => {
  const parsedData = JSON.parse(req.body.data);

  const files = req.files as {
    thumbnail?: Express.Multer.File[];
    photos?: Express.Multer.File[];
  };

  const payload = {
    ...parsedData,
    thumbnail: files?.thumbnail?.[0]?.path || '',
    photos: files?.photos?.map((file) => file.path) || [],
  };

  const data = await ProjectServices.createProject(payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Data created successfully',
    data,
  });
});

const getAllProjects = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, string>;
  const { data, meta } = await ProjectServices.getAllProjects(query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Data retrieved successfully',
    data,
    meta,
  });
});

const getSingleProject = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const data = await ProjectServices.getSingleProject(slug);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Data retrieved successfully',
    data,
  });
});

const updateProject = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const parsedData = JSON.parse(req.body.data);

  const files = req.files as {
    thumbnail?: Express.Multer.File[];
    photos?: Express.Multer.File[];
  };

  const payload: Record<string, unknown> = { ...parsedData };

  // Only include files in payload if new ones are uploaded
  if (files?.thumbnail?.[0]?.path) {
    payload.thumbnail = files.thumbnail[0].path;
  }
  if (files?.photos && files.photos.length > 0) {
    payload.photos = files.photos.map((file) => file.path);
  }

  const data = await ProjectServices.updateProject(id, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Project updated successfully',
    data,
  });
});

const deleteSingleProject = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const data = await ProjectServices.deleteSingleProject(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Delete successfully',
    data,
  });
});

export const ProjectControllers = {
  createProject,
  getAllProjects,
  getSingleProject,
  updateProject,
  deleteSingleProject,
};
