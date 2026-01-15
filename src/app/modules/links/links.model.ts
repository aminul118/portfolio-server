import { Schema, model } from 'mongoose';
import { ILinks } from './links.interface';

const linksSchema = new Schema<ILinks>(
  {
    facebook: { type: String },
    telegram: { type: String },
    whatsapp: { type: String },
    resume: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Links = model<ILinks>('Links', linksSchema);

export { Links };
