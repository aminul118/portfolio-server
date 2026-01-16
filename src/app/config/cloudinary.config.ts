/* eslint-disable @typescript-eslint/no-explicit-any */
import { v2 as cloudinary } from 'cloudinary';
import envVars from './env';
import AppError from '../errorHelpers/AppError';

cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUDINARY_NAME,
  api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
});

const cloudinaryUploads = cloudinary;

const deleteFileFromCloudinary = async (url: string) => {
  try {
    const regex = /\/v\d+\/(.+)\.(pdf|jpg|jpeg|png)$/i;
    const match = url.match(regex);

    if (!match) return;

    const publicId = match[1];
    const extension = match[2].toLowerCase();

    const resourceType = extension === 'pdf' ? 'raw' : 'image';

    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error: any) {
    throw new AppError(401, 'Cloudinary deletion failed', error.message);
  }
};

export { deleteFileFromCloudinary, cloudinaryUploads };
