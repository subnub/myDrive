import { UseQueryResult, useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import { getFolderInfoAPI, getFoldersListAPI } from "../api/foldersAPI";
import { useSelector } from "react-redux";
import { useUtils } from "./utils";
import { FolderInterface } from "../types/folders";

export const useFolders = (enabled = true) => {
  const params = useParams();
  const sortBy = useSelector((state: any) => state.filter.sortBy);
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
    { enabled }
  );

  return { ...foldersReactQuery };
};

export const useFoldersClient = () => {
  const params = useParams();
  const sortBy = useSelector((state: any) => state.filter.sortBy);
  const foldersReactClientQuery = useQueryClient();
  const { isTrash } = useUtils();

  const invalidateFoldersCache = () => {
    foldersReactClientQuery.invalidateQueries({
      queryKey: [
        "folders",
        {
          parent: params.id || "/",
          search: params.query || "",
          sortBy,
          limit: undefined,
          trashMode: isTrash,
        },
      ],
    });
  };
  return {
    ...foldersReactClientQuery,
    invalidateFoldersCache,
  };
};

export const useFolder = () => {
  const params = useParams();
  const folderQuery = useQuery(
    [
      "folder",
      {
        id: params.id,
      },
    ],
    getFolderInfoAPI
  );

  return { ...folderQuery };
};
