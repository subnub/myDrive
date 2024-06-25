import { FileInterface } from "../types/file";
import { createSlice, configureStore, PayloadAction } from "@reduxjs/toolkit";
import { FolderInterface } from "../types/folders";

interface MainSecionType {
  type: "" | "quick-item" | "file" | "folder";
  id: string;
  file: FileInterface | null;
  folder: FolderInterface | null;
}

export interface SelectedStateType {
  mainSection: MainSecionType;
  popupModal: FileInterface | null;
}

const initialState: SelectedStateType = {
  mainSection: {
    type: "",
    id: "",
    file: null,
    folder: null,
  },
  popupModal: null,
};

const selectedSlice = createSlice({
  name: "selected",
  initialState,
  reducers: {
    setMainSelect: (state, action: PayloadAction<MainSecionType>) => {
      state.mainSection = action.payload;
    },
    resetSelected: () => initialState,
  },
});

export const { setMainSelect, resetSelected } = selectedSlice.actions;

export default selectedSlice.reducer;
