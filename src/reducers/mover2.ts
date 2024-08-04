import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FileInterface } from "../types/file";
import { FolderInterface } from "../types/folders";

export type SelectedStateType = {
  type: "" | "file" | "folder";
  file: FileInterface | null;
  folder: FolderInterface | null;
};

type MoverStateType = {
  selectedItem: SelectedStateType;
};

const initialState: MoverStateType = {
  selectedItem: {
    type: "",
    file: null,
    folder: null,
  },
};

const moveSlice = createSlice({
  name: "selected",
  initialState,
  reducers: {
    setMoverItem: (state, action: PayloadAction<SelectedStateType>) => {
      state.selectedItem = action.payload;
    },
    resetMoverItem: (state) => {
      state.selectedItem = {
        type: "",
        file: null,
        folder: null,
      };
    },
  },
});

export const {} = moveSlice.actions;

export default moveSlice.reducer;
