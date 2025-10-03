import { model, Schema } from 'mongoose';

import generateSlug from '../../middlewares/generateSlug';
import { IBlog } from './blog.interface';

const blogSchema = new Schema<IBlog>(
  {
    title: { type: String, trim: true, required: true },
    slug: { type: String, trim: true, unique: true },
    content: { type: String, trim: true, required: true },
    thumbnail: { type: String, isRequired: true },
    photos: { type: [String], default: [''] },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

generateSlug<IBlog>(blogSchema, 'title', 'slug');

const Blog = model<IBlog>('Blog', blogSchema);

export { Blog };
