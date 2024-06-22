import { useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import { getFoldersList } from "../api/foldersAPI";

export const useFolders = () => {
  const params = useParams();
  const foldersReactQuery = useQuery(
    [
      "folders",
      {
        parent: params.id || "/",
        search: "",
        sortBy: undefined,
        limit: undefined,
      },
    ],
    getFoldersList
  );

  const filesReactClientQuery = useQueryClient();

  const invalidateFoldersCache = () => {
    filesReactClientQuery.invalidateQueries({
      queryKey: [
        "folders",
        {
          parent: params.id || "/",
          search: "",
          sortBy: undefined,
          limit: undefined,
        },
      ],
    });
  };

  return { ...foldersReactQuery, invalidateFoldersCache };
};
