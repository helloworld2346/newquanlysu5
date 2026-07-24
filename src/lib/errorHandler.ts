import type { AxiosError } from "axios";

export function getErrorMessage(
  error: unknown,
  fallback = "Có lỗi xảy ra. Vui lòng thử lại.",
): string {
  const axiosError = error as AxiosError<{ message?: string }>;
  const serverMessage = axiosError?.response?.data?.message;
  if (serverMessage) return serverMessage;
  if (axiosError?.response?.status === 400) return "Dữ liệu không hợp lệ";
  if (axiosError?.message) return axiosError.message;
  return fallback;
}
