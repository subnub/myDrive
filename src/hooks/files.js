import { useInfiniteQuery } from "react-query";
import { useParams } from "react-router-dom";

export const useFiles = async () => {
  const params = useParams();
  const filesReactQuery = useInfiniteQuery({
    queryKey: [
      "files",
      {
        parent: params.id || "/",
        search: "",
        sortBy: undefined,
        limit: undefined,
      },
    ],
    queryFn: getFilesList,
    initialPageParam: {
      startAtDate: undefined,
      startAtName: undefined,
    },
    getNextPageParam: (lastPage, pages) => {
      console.log("last page", lastPage);
      return {
        startAtDate: "test",
        startAtName: "tes2",
      };
    },
  });

  return filesReactQuery;
};
