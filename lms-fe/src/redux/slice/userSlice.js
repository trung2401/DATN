import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getUser } from "../../service/userService";

// Lấy thông tin người dùng
export const fetchUserInfo = createAsyncThunk(
  "user/fetchUserInfo",
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem("access_token");
      if (!accessToken) {
        return rejectWithValue("Không tìm thấy access token");
      }
      const response = await getUser();
      if (response.status === 200) {
        return response.data;
      } else if (response.status === 403) {
        return rejectWithValue(String(response.status));
      } else {
        rejectWithValue("Lỗi khi lấy thông tin người dùng");
      }
    } catch (error) {
      return rejectWithValue(
        error.message || "Lỗi khi lấy thông tin người dùng"
      );
    }
  }
);

const initialState = {
  userInfo: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserInfo: (state) => {
      state.userInfo = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchUserInfo
      .addCase(fetchUserInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        state.error = null;
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserInfo, clearError } = userSlice.actions;
export default userSlice.reducer;
