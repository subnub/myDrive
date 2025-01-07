import { QueryFunctionContext } from "react-query";
import axios from "../axiosInterceptor";
import { getUserToken } from "./userAPI";
import getBackendURL from "../utils/getBackendURL";

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

export const getMoveFolderListAPI = async ({
  queryKey,
}: QueryFunctionContext<
  [
    string,
    {
      parent: string;
      search: string;
      folderIDs?: string[];
      currentParent: string;
    }
  ]
>) => {
  const [_key, { parent, search, folderIDs, currentParent }] = queryKey;
  const response = await axios.get(`/folder-service/move-folder-list`, {
    params: {
      parent,
      search,
      folderIDs,
      currentParent,
    },
  });
  return response.data;
};

export const downloadZIPAPI = async (
  folderIDs: string[],
  fileIDs: string[]
) => {
  await getUserToken();

  let url = `${getBackendURL()}/folder-service/download-zip?`;

  for (const folderID of folderIDs) {
    url += `folderIDs[]=${folderID}&`;
  }

  for (const fileID of fileIDs) {
    url += `fileIDs[]=${fileID}&`;
  }

  const link = document.createElement("a");
  document.body.appendChild(link);
  link.href = url;
  link.setAttribute("type", "hidden");
  link.setAttribute("download", "true");
  link.click();
};

// POST

export const createFolderAPI = async (name: string, parent?: string) => {
  const response = await axios.post("/folder-service/create", {
    name,
    parent,
  });
  return response.data;
};

export const uploadFolderAPI = async (data: FormData, config: any) => {
  const url = "/folder-service/upload";
  const response = await axios.post(url, data, config);
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

export const moveFolderAPI = async (folderID: string, parentID: string) => {
  const response = await axios.patch(`/folder-service/move`, {
    id: folderID,
    parentID,
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
