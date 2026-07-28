import { useLocation } from "react-router-dom";
import { ALL_NAV_ITEMS, NAV_GROUPS } from "@/config/navigation";
import {
  Breadcrumb as BreadcrumbRoot,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function getSubPageLabel(pathname: string): string | null {
  if (pathname.includes("/daily-report/create")) return "Thêm báo cáo";
  if (pathname.includes("/daily-report/edit/")) return "Chỉnh sửa báo cáo";
  if (pathname.includes("/daily-report/detail/")) return "Xem chi tiết báo cáo";
  return null;
}

export default function Breadcrumb() {
  const { pathname } = useLocation();

  const current =
    ALL_NAV_ITEMS.find((i) => i.path === pathname) ??
    ALL_NAV_ITEMS.find((i) => pathname.startsWith(i.path + "/"));

  const group = current
    ? NAV_GROUPS.find((g) => g.id === current.group)
    : undefined;

  const groupLabel = group?.label;
  const pageLabel = current?.label ?? "Trang";
  const subPageLabel = getSubPageLabel(pathname);

  return (
    <BreadcrumbRoot className="min-w-0">
      <BreadcrumbList>
        {groupLabel && (
          <>
            <BreadcrumbItem>
              <span className="text-muted-foreground">{groupLabel}</span>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}
        <BreadcrumbItem>
          {subPageLabel ? (
            <span className="text-muted-foreground truncate">{pageLabel}</span>
          ) : (
            <BreadcrumbPage className="truncate">{pageLabel}</BreadcrumbPage>
          )}
        </BreadcrumbItem>
        {subPageLabel && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="truncate">
                {subPageLabel}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </BreadcrumbRoot>
  );
}
