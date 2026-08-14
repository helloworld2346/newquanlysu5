import { useQuery } from "@tanstack/react-query";
import { executiveApi } from "./api";

export function useThongKe(ngay: string) {
  return useQuery({
    queryKey: ["thong-ke", ngay],
    queryFn: () => executiveApi.getThongKe(ngay),
    enabled: !!ngay,
  });
}
