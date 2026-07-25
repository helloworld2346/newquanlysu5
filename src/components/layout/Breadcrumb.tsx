import { useLocation } from "react-router-dom";
import { ALL_NAV_ITEMS, NAV_GROUPS } from "@/config/navigation";
import {
  Breadcrumb as BreadcrumbRoot,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function Breadcrumb() {
  const { pathname } = useLocation();
  const current = ALL_NAV_ITEMS.find((i) => i.path === pathname);
  const group = current
    ? NAV_GROUPS.find((g) => g.id === current.group)
    : undefined;

  const groupLabel = group?.label;
  const pageLabel = current?.label ?? "Trang";

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
          <BreadcrumbPage className="truncate">{pageLabel}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </BreadcrumbRoot>
  );
}
