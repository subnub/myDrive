import { QueryFunctionContext } from "react-query";
import axios from "../axiosInterceptor";

interface QueryKeyParams {
  parent: string;
  search?: string;
  sortBy?: string;
  limit?: number;
  trashMode?: boolean;
}

// GET

export const getFoldersListAPI = async ({
  queryKey,
}: QueryFunctionContext<[string, QueryKeyParams]>) => {
  const [_key, { parent, search, sortBy, limit, trashMode }] = queryKey;
  const response = await axios.get(`/folder-service/list`, {
    params: {
      parent,
      search,
      sortBy,
      limit,
      trashMode,
    },
  });
  return response.data;
};

export const getFolderInfoAPI = async ({
  queryKey,
}: QueryFunctionContext<[string, { id: string | undefined }]>) => {
  const [_key, { id }] = queryKey;
  if (!id) return undefined;
  const response = await axios.get(`/folder-service/info/${id}`);
  return response.data;
};

// POST

export const createFolderAPI = async (name: string, parent?: string) => {
  const response = await axios.post("/folder-service/create", {
    name,
    parent,
  });
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

export const trashFolderAPI = async (folderID: string) => {
  const response = await axios.patch("/folder-service/trash", {
    id: folderID,
  });
  return response.data;
};

export const restoreFolderAPI = async (folderID: string) => {
  const response = await axios.patch("/folder-service/restore", {
    id: folderID,
  });
  return response.data;
};

// DELETE

export const deleteFolderAPI = async (folderID: string) => {
  const response = await axios.delete("/folder-service/remove", {
    data: {
      id: folderID,
    },
  });
  return response.data;
};
