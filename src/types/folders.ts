export interface FolderInterface {
  _id: string;
  name: string;
  parent: string;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
  parentList: string[];
  personalFolder?: boolean;
  trashed?: boolean;
}
