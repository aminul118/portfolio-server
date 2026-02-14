export interface IProject {
  _id: string;
  title: string;
  slug?: string;
  liveLink: string;
  github?: string;
  content: string;
  technology: string[];
  thumbnail: string;
  photos?: string[];
  createdAt: Date;
  updatedAt: Date;
  isFeatured?: boolean;
}
