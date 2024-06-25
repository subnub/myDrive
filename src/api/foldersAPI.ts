import { QueryFunctionContext } from "react-query";
import axios from "../axiosInterceptor";

interface QueryKeyParams {
  parent: string;
  search?: string;
  sortBy?: string;
  limit?: number;
}

// GET

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

export const getFolderInfo = async ({
  queryKey,
}: QueryFunctionContext<[string, { id: string | undefined }]>) => {
  const [_key, { id }] = queryKey;
  if (!id) return undefined;
  const response = await axios.get(`/folder-service/info/${id}`);
  return response.data;
};

// PATCH

export const renameFolder = async (folderID: string, name: string) => {
  const response = await axios.patch("/folder-service/rename", {
    id: folderID,
    title: name,
  });
  return response.data;
};

// DELETE

export const deleteFolder = async (folderID: string, parentList: string[]) => {
  const response = await axios.delete("/folder-service/remove", {
    data: {
      id: folderID,
      parentList,
    },
  });
  return response.data;
};
