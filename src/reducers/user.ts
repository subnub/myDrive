import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserType } from "../types/user";

interface UserStateType {
  user?: null | UserType;
  loggedIn: boolean;
}

const initialState: UserStateType = {
  user: null,
  loggedIn: false,
};

const userSlice = createSlice({
  name: "selected",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserType>) => {
      state.user = action.payload;
      state.loggedIn = true;
    },
  },
});

export const { setUser } = userSlice.actions;

export default userSlice.reducer;
