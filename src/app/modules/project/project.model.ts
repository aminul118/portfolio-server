import { model, Schema } from 'mongoose';
import generateSlug from '../../middlewares/generateSlug';
import { IProject } from './project.interface';

const projectSchema = new Schema<IProject>(
  {
    title: { type: String, trim: true, required: true },
    slug: { type: String, trim: true, unique: true },
    liveLink: { type: String, trim: true, required: true },
    github: { type: String, trim: true },
    content: { type: String, trim: true, required: true },
    technology: {
      type: [String],
      required: true,
      default: [],
    },
    thumbnail: {
      type: String,
      required: true,
      trim: true,
    },
    photos: {
      type: [String],
      default: [],
    },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

generateSlug<IProject>(projectSchema, 'title', 'slug');

const Project = model<IProject>('Project', projectSchema);

export { Project };
