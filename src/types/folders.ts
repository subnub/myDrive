export interface FolderInterface {
  name: string;
  parent: string;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
  parentList: string[];
  personalFolder?: boolean;
}
