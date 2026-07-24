import axios from "axios";
import { toast } from "sonner";
import { storage } from "@/lib/storage";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipErrorToast?: boolean;
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401 && storage.getToken()) {
      storage.removeToken();
      storage.clearNavState();
      window.location.href = "/login";
    }
    if (status !== 401 && status !== 404 && !error.config?.skipErrorToast) {
      toast.error(
        error.response?.data?.message || error.message || "Có lỗi xảy ra",
      );
    }
    return Promise.reject(error);
  },
);

export default api;
