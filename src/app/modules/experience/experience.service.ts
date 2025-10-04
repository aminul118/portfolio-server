import { IExperience } from './experience.interface';
import { Experience } from './experience.model';

const createExperience = async (payload: IExperience) => {
  const result = await Experience.create(payload);
  return result;
};

const getAllExperience = async () => {
  const result = await Experience.find().sort({ timeline: 1 });
  return result;
};

const deleteSingleExperience = async (id: string) => {
  const result = await Experience.findByIdAndDelete(id);
  return result;
};

export const ExperienceService = {
  createExperience,
  getAllExperience,
  deleteSingleExperience,
};
