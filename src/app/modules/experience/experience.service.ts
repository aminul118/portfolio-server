import httpStatus from 'http-status-codes';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { experienceSearchableField } from './experience.constant';
import { IExperience } from './experience.interface';
import { Experience } from './experience.model';
import AppError from '../../errorHelpers/AppError';

const createExperience = async (payload: IExperience) => {
  const result = await Experience.create(payload);
  return result;
};

const updateSingleExperience = async (payload: IExperience, id: string) => {
  const exitsExperience = await Experience.findById(id);

  if (!exitsExperience) {
    throw new AppError(httpStatus.NOT_FOUND, 'Experience not found');
  }
  const result = await Experience.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const getAllExperience = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Experience.find(), query);

  const events = await queryBuilder
    .search(experienceSearchableField)
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

const deleteSingleExperience = async (id: string) => {
  const result = await Experience.findByIdAndDelete(id);
  return result;
};

export const ExperienceService = {
  createExperience,
  getAllExperience,
  deleteSingleExperience,
  updateSingleExperience,
};
