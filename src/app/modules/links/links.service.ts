import { ILinks } from './links.interface';
import { Links } from './links.model';

const createLinks = async (payload: ILinks) => {
  const data = await Links.create(payload);
  return data;
};

const updateLinks = async (payload: Partial<ILinks>, id: string) => {
  const data = await Links.findByIdAndUpdate(id, payload, { new: true });
  return data;
};

const getLinks = async () => {
  const data = await Links.findOne();
  return data;
};
const deleteLinkById = async (id: string) => {
  const data = await Links.findByIdAndDelete(id);
  return data;
};

export const LinkServices = {
  createLinks,
  updateLinks,
  getLinks,
  deleteLinkById,
};
