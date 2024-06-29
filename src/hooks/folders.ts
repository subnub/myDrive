import { useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import { getFolderInfoAPI, getFoldersListAPI } from "../api/foldersAPI";
import { useSelector } from "react-redux";
import { useUtils } from "./utils";

export const useFolders = () => {
  const params = useParams();
  const sortBy = useSelector((state: any) => state.filter.sortBy);
  const { isTrash } = useUtils();
  const foldersReactQuery = useQuery(
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
    getFoldersListAPI
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
