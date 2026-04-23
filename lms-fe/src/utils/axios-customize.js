import axios from "axios";
import { logout } from "../redux/slice/authSlice";
import { clearUserInfo } from "../redux/slice/userSlice";
import { getStore } from "../redux/storeAccessor";
import { toast } from "react-toastify";
import { checkRefreshToken } from "../service/authService";
const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

// Excluded endpoints
const excludedEndpoints = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh-token",
  "/auth/forgot-password",
];

// Interceptor cho request
instance.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem("access_token");
    if (config.url && !excludedEndpoints.includes(config.url) && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Interceptor cho response
instance.interceptors.response.use(
  function (response) {
    if (response.data && response.data.data) return response.data;
    return response;
  },
  async function (error) {
    const originalRequest = error.config;
    const status = error.response?.status;
    const message = String(error.response?.data?.message || "").toLowerCase();
    const isTokenExpired403 = status === 403 && message.includes("token expired");

    // Kiểm tra lỗi 401 hoặc 403 do token hết hạn
    if (status === 401 || isTokenExpired403) {
      // Thử làm mới token nếu request chưa được retry
      if (originalRequest && !originalRequest._retry) {
        originalRequest._retry = true; // Đánh dấu request đã thử làm mới
        try {
          const refreshToken = localStorage.getItem("refresh_token");
          if (!refreshToken) {
            throw new Error("No refresh token available");
          }

          // Gọi checkRefreshToken để làm mới token
          const response = await checkRefreshToken({ refreshToken });

          // Lưu access_token mới (giả sử API trả về accessToken trong response.data)
          const newAccessToken = response.data.accessToken;
          localStorage.setItem("access_token", newAccessToken);

          // Cập nhật header cho originalRequest
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Thử gọi lại request ban đầu
          return instance(originalRequest);
        } catch (refreshError) {
          // Nếu làm mới token thất bại (refresh token hết hạn hoặc lỗi khác)
          if (
            refreshError.response?.data?.message &&
            refreshError.response.data.message.includes("refresh token")
          ) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            try {
              const store = getStore();
              store.dispatch(logout());
              store.dispatch(clearUserInfo());
            } catch (storeError) {
              console.error("Failed to access Redux store:", storeError.message);
            }
            window.location.href = "/login";
            toast.info("Phiên đăng nhập đã hết hạn! Vui lòng đăng nhập lại.");
          }
          return Promise.reject(refreshError);
        }
      }
    }

    if (status === 403) {
      if (window.location.pathname !== "/forbidden") {
        window.location.href = "/forbidden";
      }
      return Promise.reject(error);
    }

    if (error.response && error.response.data) {
      return error.response.data;
    }

    return Promise.reject(error);
  }
);

export default instance;