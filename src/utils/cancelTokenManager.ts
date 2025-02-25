interface MapType {
  [key: string]: {
    token: any;
    cancel: () => {};
  };
}

const cancelTokens: MapType = {};

// TODO: Fix any
export const addFileUploadCancelToken = (id: string, cancelToken: any) => {
  cancelTokens[id] = cancelToken;
};

export const removeFileUploadCancelToken = (id: string) => {
  delete cancelTokens[id];
};

export const getCancelToken = (id: string) => {
  return cancelTokens[id];
};

export const cancelAllFileUploads = () => {
  for (const key in cancelTokens) {
    cancelTokens[key].cancel();
    delete cancelTokens[key];
  }
};
