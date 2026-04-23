import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getQRCode, checkPayment } from "../../service/paymentService";

// Lấy mã QR
export const fetchQRCode = createAsyncThunk(
  "payment/fetchQRCode",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getQRCode();
      if (response.status === 200) {
        return response.data;
      } else {
        return rejectWithValue("Lỗi khi lấy mã QR");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi khi lấy mã QR"
      );
    }
  }
);

// Kiểm tra trạng thái thanh toán
export const fetchCheckPayment = createAsyncThunk(
  "payment/fetchCheckPayment",
  async ({ code }, { rejectWithValue }) => {
    try {
      const response = await checkPayment({ code: code });
      if (response.status === 200) {
        return response.data;
      } else {
        return rejectWithValue(response?.data?.message || "Thanh toán thất bại! Vui lòng thử lại");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Thanh toán thất bại! Vui lòng thử lại"
      );
    }
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    loadingQRCode: false,
    loadingPayment: false,
    errorQRCode: null,
    errorPayment: null,
    qrCode: {},
    paymentStatus: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchQRCode
      .addCase(fetchQRCode.pending, (state) => {
        state.loadingQRCode = true;
        state.errorQRCode = null;
      })
      .addCase(fetchQRCode.fulfilled, (state, action) => {
        state.loadingQRCode = false;
        state.qrCode = action.payload;
      })
      .addCase(fetchQRCode.rejected, (state, action) => {
        state.loadingQRCode = false;
        state.errorQRCode = action.payload;
      })

      // fetchCheckPayment
      .addCase(fetchCheckPayment.pending, (state) => {
        state.loadingPayment = true;
        state.errorPayment = null;
      })
      .addCase(fetchCheckPayment.fulfilled, (state, action) => {
        state.loadingPayment = false;
        state.paymentStatus = action.payload;
      })
      .addCase(fetchCheckPayment.rejected, (state, action) => {
        state.loadingPayment = false;
        state.errorPayment = action.payload;
      });
  },
});

export default paymentSlice.reducer;
