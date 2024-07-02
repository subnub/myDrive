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
  },
});

export const { toggleDrawer, closeDrawer } = leftSectionSlice.actions;

export default leftSectionSlice.reducer;
