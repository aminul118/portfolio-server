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

  const events = await queryBuilder
    .search(blogSearchableField)
    .filter()
    .fields()
    .paginate()
    .sort();

  const [data, meta] = await Promise.all([
    events.build(),
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

const deleteSingleBlog = async (id: string) => {
  // Find project first
  const project = await Blog.findById(id);

  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }

  //  Delete thumbnail
  if (project.thumbnail) {
    await deleteFileFromCloudinary(project.thumbnail);
  }

  //  Delete all photos (vlogs photos)
  if (project.photos && project.photos.length > 0) {
    await Promise.all(
      project.photos.map((photoUrl) => deleteFileFromCloudinary(photoUrl)),
    );
  }

  //  Delete project from DB
  const res = await Blog.findByIdAndDelete(id);

  return res;
};

export const BlogServices = {
  createBlog,
  getAllBlogs,
  getSingleBlog,
  deleteSingleBlog,
};
