import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const listView = window.localStorage.getItem("list-mode");

const sortBy = window.localStorage.getItem("name-mode")
  ? window.localStorage.getItem("asc-mode")
    ? "alp_asc"
    : "alp_desc"
  : window.localStorage.getItem("asc-mode")
  ? "date_asc"
  : "date_desc";

const initialState = {
  sortBy: sortBy,
  limit: 50,
  search: "",
  listView: listView === "true",
  mediaFilter: "all",
};

const leftSectionSlice = createSlice({
  name: "selected",
  initialState,
  reducers: {
    toggleListView: (state) => {
      state.listView = !state.listView;
    },
    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },
    setMediaFilter: (state, action: PayloadAction<string>) => {
      state.mediaFilter = action.payload;
    },
  },
});

export const { toggleListView, setSortBy, setMediaFilter } =
  leftSectionSlice.actions;

export default leftSectionSlice.reducer;
