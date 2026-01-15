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

const deleteSingleProject = async (id: string) => {
  const data = await Project.findByIdAndDelete(id);
  return data;
};

export const ProjectServices = {
  createProject,
  getAllProjects,
  getSingleProject,
  deleteSingleProject,
};
