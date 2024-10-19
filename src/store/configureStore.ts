import { configureStore } from "@reduxjs/toolkit";
import filterReducer from "../reducers/filter";
import selectedReducer from "../reducers/selected";
import leftSectionReducer from "../reducers/leftSection";
import userReducer from "../reducers/user";
import uploaderReducer from "../reducers/uploader";

const store = configureStore({
  reducer: {
    filter: filterReducer,
    selected: selectedReducer,
    leftSection: leftSectionReducer,
    user: userReducer,
    uploader: uploaderReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
