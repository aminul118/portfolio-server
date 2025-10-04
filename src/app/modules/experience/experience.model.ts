import { Schema, model } from 'mongoose';
import { IExperience } from './experience.interface';

const experienceSchema = new Schema<IExperience>(
  {
    position: { type: String, required: true },
    companyName: { type: String, required: true },
    timeline: { type: String, required: true },
    description: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Experience = model<IExperience>('Experience', experienceSchema);

export { Experience };
