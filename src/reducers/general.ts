import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  listView: false,
  loadThumbnailsDisabled: false,
  singleClickFolders: false,
};

const generalSlice = createSlice({
  name: "general",
  initialState,
  reducers: {
    toggleListView: (state) => {
      state.listView = !state.listView;
    },
    setListView: (state, action: PayloadAction<boolean>) => {
      state.listView = action.payload;
    },
    setLoadThumbnailsDisabled: (state, action: PayloadAction<boolean>) => {
      state.loadThumbnailsDisabled = action.payload;
    },
    setSingleClickFolders: (state, action: PayloadAction<boolean>) => {
      state.singleClickFolders = action.payload;
    },
  },
});

export const {
  toggleListView,
  setListView,
  setLoadThumbnailsDisabled,
  setSingleClickFolders,
} = generalSlice.actions;

export default generalSlice.reducer;
