import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UploadItemType {
  id: string;
  progress: number;
  name: string;
  completed: boolean;
  canceled: boolean;
  size: number;
  type: "file" | "folder";
}

interface UploaderStateType {
  uploads: UploadItemType[];
}

const initialState: UploaderStateType = {
  uploads: [],
};

const uploaderSlice = createSlice({
  name: "uploader",
  initialState,
  reducers: {
    addUpload(state, action: PayloadAction<UploadItemType>) {
      state.uploads.unshift(action.payload);
    },
    editUpload(
      state,
      action: PayloadAction<{
        id: string;
        updateData: {
          progress?: number;
          completed?: boolean;
          canceled?: boolean;
        };
      }>
    ) {
      const uploads = state.uploads.map((upload) => {
        if (upload.id === action.payload.id) {
          return {
            ...upload,
            ...action.payload.updateData,
          };
        } else {
          return upload;
        }
      });

      state.uploads = uploads;
    },
    resetUploads(state) {
      state.uploads = [];
    },
  },
});

export const { addUpload, editUpload, resetUploads } = uploaderSlice.actions;

export default uploaderSlice.reducer;
