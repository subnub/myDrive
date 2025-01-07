import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  drawOpen: false,
};

const leftSectionSlice = createSlice({
  name: "selected",
  initialState,
  reducers: {
    toggleDrawer: (state) => {
      state.drawOpen = !state.drawOpen;
    },
    closeDrawer: (state) => {
      state.drawOpen = false;
    },
    openDrawer: (state) => {
      state.drawOpen = true;
    },
  },
});

export const { toggleDrawer, closeDrawer, openDrawer } =
  leftSectionSlice.actions;

export default leftSectionSlice.reducer;
