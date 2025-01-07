import { UseQueryResult, useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import {
  getFolderInfoAPI,
  getFoldersListAPI,
  getMoveFolderListAPI,
} from "../api/foldersAPI";
import { useUtils } from "./utils";
import { FolderInterface } from "../types/folders";
import { useAppSelector } from "./store";

export const useFolders = (enabled = true) => {
  const params = useParams();
  const sortBy = useAppSelector((state) => state.filter.sortBy);
  const { isTrash } = useUtils();
  const foldersReactQuery: UseQueryResult<FolderInterface[]> = useQuery(
    [
      "folders",
      {
        parent: params.id || "/",
        search: params.query || "",
        sortBy,
        limit: undefined,
        trashMode: isTrash,
      },
    ],
    getFoldersListAPI,
    { enabled, refetchOnWindowFocus: false, refetchOnReconnect: false }
  );

  return { ...foldersReactQuery };
};

export const useFolder = (enabled = true) => {
  const params = useParams();
  const folderQuery = useQuery(
    [
      "folder",
      {
        id: params.id,
      },
    ],
    getFolderInfoAPI,
    { enabled }
  );

  return { ...folderQuery };
};

export const useMoveFolders = (
  parent: string,
  search: string,
  folderIDs?: string[]
) => {
  const params = useParams();
  const moveFoldersQuery = useQuery(
    [
      "move-folder-list",
      {
        parent,
        search,
        folderIDs,
        currentParent: params.id || "/",
      },
    ],
    getMoveFolderListAPI
  );

  return { ...moveFoldersQuery };
};
