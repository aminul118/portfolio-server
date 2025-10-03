export interface IBlog {
  _id?: string;
  title: string;
  slug?: string;
  content: string;
  thumbnail: string;
  photos?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  isFeatured?: boolean;
}
