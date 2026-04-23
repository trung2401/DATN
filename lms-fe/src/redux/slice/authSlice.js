import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  loading: true,
  role: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action) {
      state.isAuthenticated = true;
      state.loading = false;
      state.role = action.payload?.role || null; 
    },
    logout(state) {
      state.isAuthenticated = false;
      state.loading = false;
      state.role = null;
    },
    finishLoading(state) {
      state.loading = false;
    },
  },
});

export const { loginSuccess, logout, finishLoading } = authSlice.actions;
export default authSlice.reducer;