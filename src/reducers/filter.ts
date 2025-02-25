import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  sortBy: "date_desc",
  limit: 50,
  search: "",
  mediaFilter: "all",
};

const filterSlice = createSlice({
  name: "selected",
  initialState,
  reducers: {
    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },
    setMediaFilter: (state, action: PayloadAction<string>) => {
      state.mediaFilter = action.payload;
    },
  },
});

export const { setSortBy, setMediaFilter } = filterSlice.actions;

export default filterSlice.reducer;
