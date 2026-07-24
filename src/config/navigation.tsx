/* eslint-disable react-refresh/only-export-components */
import { lazy, type LazyExoticComponent, type ComponentType } from "react";
import { normalizeRoleName } from "@/lib/roles";

export type NavItemId =
  | "executive"
  | "executive-political-work"
  | "report-troop"
  | "report-political-work"
  | "duty-personnel"
  | "duty-shifts"
  | "duty-create"
  | "account-management"
  | "unit-management"
  | "role-management"
  | "audit-log"
  | "settings";

export type NavItem = {
  id: NavItemId;
  label: string;
  path: string;
  component: LazyExoticComponent<ComponentType>;
  allowedRoles?: string[];
};

const Placeholder = lazy(
  () => import("@/features/_placeholder/PagePlaceholder"),
);

const ALL_REPORT_ROLES = [
  "Quản Trị Viên",
  "Trực ban tác chiến",
  "Trực chỉ huy",
  "Trực ban nội vụ",
];
const ADMIN_ONLY = ["Quản Trị Viên"];
const TAC_CHIEN = ["Quản Trị Viên", "Trực ban tác chiến"];

export const ALL_NAV_ITEMS: NavItem[] = [
  // --- Dashboard ---
  {
    id: "executive",
    label: "Tổng hợp trong ngày",
    path: "/dashboard",
    component: Placeholder,
    allowedRoles: TAC_CHIEN,
  },
  {
    id: "executive-political-work",
    label: "Tổng hợp CTĐ, CTCT",
    path: "/political-dashboard",
    component: Placeholder,
    allowedRoles: TAC_CHIEN,
  },
  // --- Cập nhật thống kê / Báo ban ---
  {
    id: "report-troop",
    label: "Thống kê quân số trong ngày",
    path: "/daily-report",
    component: Placeholder,
    allowedRoles: ALL_REPORT_ROLES,
  },
  {
    id: "report-political-work",
    label: "Hoạt động Công tác Đảng, công tác chính trị",
    path: "/political-work-report",
    component: Placeholder,
    allowedRoles: ALL_REPORT_ROLES,
  },
  // --- Ca trực ---
  {
    id: "duty-personnel",
    label: "Quản lý ca trực",
    path: "/duty/personnel",
    component: Placeholder,
    allowedRoles: TAC_CHIEN,
  },
  {
    id: "duty-shifts",
    label: "Lịch sử ca trực",
    path: "/duty/shifts",
    component: Placeholder,
    allowedRoles: TAC_CHIEN,
  },
  {
    id: "duty-create",
    label: "Tạo ca trực",
    path: "/duty/create",
    component: Placeholder,
    allowedRoles: TAC_CHIEN,
  },
  // --- Quản trị ---
  {
    id: "account-management",
    label: "Quản lý tài khoản",
    path: "/account-management",
    component: Placeholder,
    allowedRoles: ADMIN_ONLY,
  },
  {
    id: "unit-management",
    label: "Quản lý đơn vị",
    path: "/unit-management",
    component: Placeholder,
    allowedRoles: ADMIN_ONLY,
  },
  {
    id: "role-management",
    label: "Quản lý vai trò",
    path: "/role-management",
    component: Placeholder,
    allowedRoles: ADMIN_ONLY,
  },
  {
    id: "audit-log",
    label: "Nhật ký hệ thống",
    path: "/audit-log",
    component: Placeholder,
    allowedRoles: ADMIN_ONLY,
  },
  // --- Cài đặt ---
  {
    id: "settings",
    label: "Cài đặt",
    path: "/settings",
    component: Placeholder,
    allowedRoles: ALL_REPORT_ROLES,
  },
];

export function getIdByPath(path: string): NavItemId {
  return ALL_NAV_ITEMS.find((i) => i.path === path)?.id ?? "executive";
}

export function getPathById(id: NavItemId): string {
  return ALL_NAV_ITEMS.find((i) => i.id === id)?.path ?? "/dashboard";
}

export function canAccessDutyGroup(
  role: string,
  capDonVi?: string | null,
): boolean {
  if (role === "Quản Trị Viên") return true;
  if (role !== "Trực ban tác chiến") return false;
  return capDonVi === "SU_DOAN";
}

export function getNavItemsByRole(
  userRole: string | null,
  capDonVi: string | null = null,
  tenChucnang: string[] | null = null,
): NavItem[] {
  if (!userRole) return [];
  const role = normalizeRoleName(userRole);
  const canDuty = canAccessDutyGroup(role, capDonVi);

  if (role === "Quản Trị Viên") return ALL_NAV_ITEMS;

  if (tenChucnang && tenChucnang.length > 0) {
    return ALL_NAV_ITEMS.filter(
      (i) => i.id === "settings" || tenChucnang.includes(i.id),
    );
  }

  const isCore = (i: NavItem) =>
    i.id.startsWith("report-") || i.id === "settings";
  const isExec = (i: NavItem) =>
    i.id === "executive" || i.id === "executive-political-work";

  if (role === "Trực ban tác chiến") {
    return ALL_NAV_ITEMS.filter((i) =>
      isExec(i)
        ? capDonVi === "SU_DOAN"
        : isCore(i) || (i.id.startsWith("duty-") && canDuty),
    );
  }

  if (role === "Trực chỉ huy" || role === "Trực ban nội vụ") {
    return ALL_NAV_ITEMS.filter(
      (i) => i.id.startsWith("report-") || i.id === "settings",
    );
  }

  return ALL_NAV_ITEMS.filter(
    (i) => !i.allowedRoles || i.allowedRoles.includes(role),
  );
}
