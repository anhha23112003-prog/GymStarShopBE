import axios from "axios";
import {
  getLocalStorage,
  setLocalStorage,
  removeLocalStorage,
} from "../utils/utils";
import { authService } from "./auth.service";

// Cấu hình baseURL dựa trên môi trường
const baseURL = "https://shopquanao-f7yd.onrender.com";

export const http = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true, // Gửi cookie (refreshToken)
});

// Interceptor cho request
http.interceptors.request.use(
  (config) => {
    const accessToken = getLocalStorage("accessToken");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho response
http.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      console.log("Access token expired, attempting to refresh...");

      try {
        const response = await http.post("/LamMoiToken");
        const newAccessToken = response.data.accessToken;

        console.log("Refresh token success, new access token:", newAccessToken);

        setLocalStorage("accessToken", newAccessToken);
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        return http(originalRequest);
      } catch (refreshError) {
        console.error(
          "Refresh token error:",
          refreshError.response?.data || refreshError.message
        );
        console.log("Attempting to logout...");

        await authService.logout().catch((logoutError) => {
          console.error("Logout error:", logoutError.message);
        });

        removeLocalStorage("user");
        removeLocalStorage("accessToken");

        console.log("Redirecting to login page...");
        window.location.href = "/log-in";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
