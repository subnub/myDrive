export interface FolderListQueryType {
  userID: string;
  search: string | undefined;
  parent: string;
  trashMode: boolean;
}
