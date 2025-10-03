import { QueryBuilder } from '../../utils/QueryBuilder';
import { blogSearchableField } from './blog.constant';
import { IBlog } from './blog.interface';
import { Blog } from './blog.model';

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
  const data = await Blog.findByIdAndDelete(id);
  return data;
};

export const BlogServices = {
  createBlog,
  getAllBlogs,
  getSingleBlog,
  deleteSingleBlog,
};
