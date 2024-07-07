import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const gridView = window.localStorage.getItem("grid-mode");

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
  listView: !gridView,
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
  },
});

export const { toggleListView, setSortBy } = leftSectionSlice.actions;

export default leftSectionSlice.reducer;
