/* eslint-disable @typescript-eslint/no-explicit-any */
import { v2 as cloudinary } from 'cloudinary';
import envVars from './env';
import AppError from '../errorHelpers/AppError';

cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUDINARY_NAME,
  api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
});

export const cloudinaryUploads = cloudinary;

export const deleteImageFromCLoudinary = async (url: string) => {
  try {
    const regex = /\/v\d+\/(.*?)\.(pdf|jpg|jpeg|png)$/i;
    const match = url.match(regex);

    if (match?.[1]) {
      await cloudinary.uploader.destroy(match[1], {
        resource_type: 'image',
        type: 'upload',
      });
    }
  } catch (error: any) {
    throw new AppError(401, 'Cloudinary deletion failed', error.message);
  }
};
