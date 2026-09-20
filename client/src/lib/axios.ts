import axios from "axios";
import { env } from "./env";
import { useAuthStore } from "../feature/auth/store";
import { toast } from "sonner";

export const api = axios.create({
  baseURL: env.API_URL,
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 15_000,
  withCredentials: false //cookie
})

api.interceptors.request.use(
  (config) => {
    //cấu hình accesstoken từ localstorge
    const accessToken = useAuthStore.getState().accessToken;

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];
let isRefreshing = false;

// Hàm xử lý hàng đợi sau khi refresh token thành công hoặc thất bại
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (token) p.resolve(token);
    else p.reject(error);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => {
    return response.data?.data !== undefined ? response.data.data : response.data;
  },

  async (error) => {
    const originalRequest = error.config;
    //sửa api
    const notAuthReqs = !originalRequest.url?.includes("/login");
    const is401 = error.response?.status === 401;
    const notRetriedYet = !originalRequest._retry;

    if (is401 && notAuthReqs && notRetriedYet) {
      originalRequest._retry = true;
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;
      originalRequest._retry = true;

      try {
        // 2 dòng này chỉ xử lý khi nó ở local
        const reposnse = await axios.post(
          //sửa chỗ này
          `${import.meta.env.VITE_API_URL}/refresh`,
          {}, // Empty body vì refesh token ở cookies
          {
            withCredentials: true,
          }
        );

        //Api chỉ trả về accessToken mới, nên phải lấy refreshToken từ state cũ
        const newToken: string =
          reposnse.data?.data?.accessToken ?? reposnse.data?.accessToken;

        // Cập nhật accessToken mới vào store
        useAuthStore.getState().setToken(
          newToken,
          useAuthStore.getState().role,
        );

        processQueue(null, newToken);

        // Cập nhật header Authorization của request gốc với accessToken mới
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        // Gọi lại API gốc với accessToken mới
        return api(originalRequest);

      } catch (refreshError) {

        processQueue(refreshError, null);
        useAuthStore.getState().clearToken();
        // muốn app hoàn toàn đc reset về trạng thái chưa login, thì phải reload lại trang
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/login"; // Chuyển hướng về trang login nếu refresh token cũng bị lỗi (ví dụ: hết hạn)
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const message = error.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.";

    const isLogoutEndpoint = originalRequest.url?.includes("/auth/logout");

    if (!isLogoutEndpoint) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
)
