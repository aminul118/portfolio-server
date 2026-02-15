import httpStatus from 'http-status-codes';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { BlogServices } from './blog.service';
import { IBlog } from './blog.interface';

const createBlog = catchAsync(async (req: Request, res: Response) => {
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

  const data = await BlogServices.createBlog(payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Blog created successfully',
    data,
  });
});

const getAllBlogs = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, string>;
  const { data, meta } = await BlogServices.getAllBlogs(query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Blogs retrieved successfully',
    data,
    meta,
  });
});

const getSingleBlog = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const data = await BlogServices.getSingleBlog(slug);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Blog retrieved successfully',
    data,
  });
});

const updateBlog = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const parsedData = JSON.parse(req.body.data);

  const files = req.files as {
    thumbnail?: Express.Multer.File[];
    photos?: Express.Multer.File[];
  };

  const payload: Partial<IBlog> = { ...parsedData };

  if (files?.thumbnail?.[0]?.path) {
    payload.thumbnail = files.thumbnail[0].path;
  }

  if (files?.photos && files.photos.length > 0) {
    payload.photos = files.photos.map((file) => file.path);
  }

  const data = await BlogServices.updateBlog(id, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Blog updated successfully',
    data,
  });
});

const deleteSingleBlog = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const data = await BlogServices.deleteSingleBlog(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Delete successfully',
    data,
  });
});

export const BlogControllers = {
  createBlog,
  getAllBlogs,
  getSingleBlog,
  updateBlog,
  deleteSingleBlog,
};
