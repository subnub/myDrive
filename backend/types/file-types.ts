export interface FileListQueryType {
  userID: string;
  search: string | undefined;
  parent: string;
  startAtDate: string | undefined;
  startAtName: string | undefined;
  trashMode: boolean;
  mediaMode: boolean;
  sortBy: string;
  mediaFilter: string;
}
