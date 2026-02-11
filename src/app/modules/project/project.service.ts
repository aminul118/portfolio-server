import { deleteFileFromCloudinary } from '../../config/cloudinary.config';
import AppError from '../../errorHelpers/AppError';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { projectSearchableField } from './project.constant';
import { IProject } from './project.interface';
import { Project } from './project.model';

const createProject = async (payload: IProject) => {
  const result = await Project.create(payload);
  return result;
};

const getAllProjects = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Project.find(), query);

  const projects = await queryBuilder
    .search(projectSearchableField)
    .filter()
    .fields()
    .paginate()
    .sort();

  const [data, meta] = await Promise.all([
    projects.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const getSingleProject = async (slug: string) => {
  const data = await Project.findOne({ slug });
  return data;
};
const updateProject = async (id: string, payload: Partial<IProject>) => {
  // Find project first
  const project = await Project.findById(id);

  if (!project) {
    throw new AppError(404, 'Project not found');
  }

  // If a new thumbnail is provided, delete the old one from Cloudinary
  if (payload.thumbnail && project.thumbnail) {
    await deleteFileFromCloudinary(project.thumbnail);
  }

  // If new photos are provided, delete all old photos from Cloudinary
  if (
    payload.photos &&
    payload.photos.length > 0 &&
    project.photos &&
    project.photos.length > 0
  ) {
    await Promise.all(
      project.photos.map((photoUrl) => deleteFileFromCloudinary(photoUrl)),
    );
  }

  const result = await Project.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const deleteSingleProject = async (id: string) => {
  //  Find project first
  const project = await Project.findById(id);

  if (!project) {
    throw new AppError(404, 'Project not found');
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
  const res = await Project.findByIdAndDelete(id);

  return res;
};

export const ProjectServices = {
  createProject,
  getAllProjects,
  getSingleProject,
  updateProject,
  deleteSingleProject,
};
