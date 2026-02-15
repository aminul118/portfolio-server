import httpStatus from 'http-status-codes';
import AppError from '../../errorHelpers/AppError';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { blogSearchableField } from './blog.constant';
import { IBlog } from './blog.interface';
import { Blog } from './blog.model';
import { deleteFileFromCloudinary } from '../../config/cloudinary.config';

const createBlog = async (payload: IBlog) => {
  const result = await Blog.create(payload);
  // console.log(result);
  return result;
};

const getAllBlogs = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Blog.find(), query);

  const blogs = await queryBuilder
    .search(blogSearchableField)
    .filter()
    .fields()
    .paginate()
    .sort();

  const [data, meta] = await Promise.all([
    blogs.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const getSingleBlog = async (slug: string) => {
  const data = await Blog.findOne({ slug });
  return data;
};

const updateBlog = async (id: string, payload: Partial<IBlog>) => {
  const isBlogExist = await Blog.findById(id);
  if (!isBlogExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'Blog not found');
  }

  // Handle thumbnail replacement
  if (
    payload.thumbnail !== undefined &&
    isBlogExist.thumbnail &&
    payload.thumbnail !== isBlogExist.thumbnail
  ) {
    await deleteFileFromCloudinary(isBlogExist.thumbnail);
  }

  // Handle photos replacement (delete only removed photos)
  if (payload.photos && Array.isArray(payload.photos)) {
    const photosToDelete = isBlogExist.photos?.filter(
      (oldPhoto) => !payload.photos?.includes(oldPhoto),
    );

    if (photosToDelete && photosToDelete.length > 0) {
      await Promise.all(
        photosToDelete.map((photo) => deleteFileFromCloudinary(photo)),
      );
    }
  }

  const result = await Blog.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteSingleBlog = async (id: string) => {
  // Find blog first
  const blog = await Blog.findById(id);

  if (!blog) {
    throw new AppError(httpStatus.NOT_FOUND, 'Blog not found');
  }

  //  Delete thumbnail
  if (blog.thumbnail) {
    await deleteFileFromCloudinary(blog.thumbnail);
  }

  //  Delete all photos
  if (blog.photos && blog.photos.length > 0) {
    await Promise.all(
      blog.photos.map((photoUrl) => deleteFileFromCloudinary(photoUrl)),
    );
  }

  //  Delete blog from DB
  const res = await Blog.findByIdAndDelete(id);

  return res;
};

export const BlogServices = {
  createBlog,
  getAllBlogs,
  getSingleBlog,
  updateBlog,
  deleteSingleBlog,
};
