import httpStatus from 'http-status-codes';
import { userServices } from './user.service';
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { JwtPayload } from 'jsonwebtoken';

const createUser = catchAsync(async (req: Request, res: Response) => {
  const payload = {
    ...req.body,
    picture: req.file?.path,
  };
  const user = await userServices.createUserService(payload);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message:
      'User create successfully. please verify your email. We have sent you OTP in your email',
    data: user,
  });
});

const createUserForAdmin = catchAsync(async (req: Request, res: Response) => {
  const payload = {
    ...req.body,
    picture: req.file?.path,
  };
  const user = await userServices.createUserForAdminService(payload);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'User create successfully.',
    data: user,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const payload = {
    ...req.body,
    picture: req.file?.path,
  };

  const userId = req.params.id;
  const verifiedToken = req.user;

  const user = await userServices.updateUser(
    userId,
    payload,
    verifiedToken as JwtPayload,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'User create successfully',
    data: user,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const { data, meta } = await userServices.getAllUsers(
    query as Record<string, string>,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All users retrieved successfully',
    data,
    meta,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  const users = await userServices.getMe(decodedToken.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Your Profile retrieved successfully',
    data: users,
  });
});

const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const role = req.body.role;

  const payload = {
    id,
    role,
  };
  const { user, message } = await userServices.updateUserRole(payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message,
    data: user,
  });
});

export const UserControllers = {
  createUser,
  createUserForAdmin,
  updateUser,
  getAllUsers,
  getMe,
  updateUserRole,
};
