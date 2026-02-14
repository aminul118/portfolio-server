import httpStatus from 'http-status-codes';
import AppError from '../../errorHelpers/AppError';
import { User } from './user.model';
import bcryptjs from 'bcryptjs';
import envVars from '../../config/env';
import { JwtPayload } from 'jsonwebtoken';
import {
  IAuthProvider,
  IUser,
  Role,
  IsActive,
  UpdateRolePayload,
} from './user.interface';
import sendOTP from '../otp/otp.utils';
import { userSearchableField } from './user.constant';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { deleteFileFromCloudinary } from '../../config/cloudinary.config';
import { logger } from '../../utils/logger';

const createUserService = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User already exits');
  }

  const hashedPassword = await bcryptjs.hash(
    password as string,
    envVars.BCRYPT_SALT_ROUND,
  );

  const authProvider: IAuthProvider = {
    provider: 'credentials',
    providerId: email as string,
  };

  const user = await User.create({
    ...rest,
    email,
    password: hashedPassword,
    auths: [authProvider],
  });

  await sendOTP(user.email);

  return user;
};

const createUserForAdminService = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User already exits');
  }

  const hashedPassword = await bcryptjs.hash(
    password as string,
    envVars.BCRYPT_SALT_ROUND,
  );

  const authProvider: IAuthProvider = {
    provider: 'credentials',
    providerId: email as string,
  };

  const user = await User.create({
    ...rest,
    email,
    isVerified: true,
    password: hashedPassword,
    auths: [authProvider],
  });

  return user;
};

export const updateUserRole = async (payload: UpdateRolePayload) => {
  const { id, role } = payload;

  // Find if user exists
  const isUserExist = await User.findById(id);

  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const presentRole = isUserExist.role;

  if (presentRole === role) {
    throw new AppError(httpStatus.BAD_REQUEST, `Role is already ${role}`);
  }

  // Update role and return the new doc
  const updatedUser = await User.findByIdAndUpdate(id, { role }, { new: true });

  return {
    message: `Role updated from ${presentRole} to ${role}`,
    user: updatedUser,
  };
};

const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload,
) => {
  // Check user identity or role
  if (decodedToken.role === Role.USER || decodedToken.role === Role.ADMIN) {
    if (userId !== decodedToken.userId) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
    }
  }

  // Ensure target user exists
  const isUserExist = await User.findById(userId);
  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  //  Admin cannot update Super Admin
  if (
    decodedToken.role === Role.ADMIN &&
    isUserExist.role === Role.SUPER_ADMIN
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
  }

  // Disallow updating email
  if (payload.email) {
    throw new AppError(httpStatus.FORBIDDEN, 'Email cannot be updated');
  }

  //  Handle password hashing if provided
  if (payload.password) {
    payload.password = await bcryptjs.hash(
      payload.password,
      envVars.BCRYPT_SALT_ROUND,
    );
  }

  // Handle restricted fields: role, isDeleted, isActive, isVerified
  if (payload.role) {
    if (decodedToken.role !== Role.SUPER_ADMIN) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Only Super Admin can update role',
      );
    }
  }

  if (payload.isDeleted || payload.isActive || payload.isVerified) {
    if (decodedToken.role === Role.USER) {
      throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized');
    }
  }

  // Delete old profile picture from Cloudinary if a new one is being uploaded
  if (
    payload.picture &&
    isUserExist.picture &&
    payload.picture !== isUserExist.picture
  ) {
    try {
      await deleteFileFromCloudinary(isUserExist.picture);
    } catch (error) {
      // Log the error but don't fail the update if deletion fails
      logger.error('Failed to delete old profile picture:', error);
    }
  }

  // Update user safely
  const updatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true, // ensure mongoose validation runs
  });

  if (!updatedUser) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found after update');
  }

  return updatedUser;
};

const getAllUsers = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find(), query);

  const users = await queryBuilder
    .search(userSearchableField)
    .filter()
    .fields()
    .paginate()
    .sort();

  const [data, meta] = await Promise.all([
    users.build().select('-password'),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const getMe = async (userId: string) => {
  const user = await User.findOne({
    _id: userId,
    isActive: IsActive.ACTIVE,
    isDeleted: false,
  }).select('-password');

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found or inactive');
  }

  return user;
};

export const userServices = {
  updateUserRole,
  createUserService,
  createUserForAdminService,
  updateUser,
  getAllUsers,
  getMe,
};
