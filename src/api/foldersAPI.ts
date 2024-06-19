import { QueryFunctionContext } from "react-query";
import axios from "../axiosInterceptor";

interface QueryKeyParams {
  parent: string;
  search?: string;
  sortBy?: string;
  limit?: number;
}

export const getFoldersList = async ({
  queryKey,
}: QueryFunctionContext<[string, QueryKeyParams]>) => {
  const [_key, { parent, search, sortBy, limit }] = queryKey;
  const response = await axios.get(`/folder-service/list`, {
    params: {
      parent,
      search,
      sortBy,
      limit,
    },
  });
  return response.data;
};
