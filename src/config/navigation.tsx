/* eslint-disable react-refresh/only-export-components */
import { lazy, type LazyExoticComponent, type ComponentType } from "react";
import {
  LayoutDashboard,
  Flag,
  ClipboardList,
  FileText,
  UsersRound,
  History,
  CalendarPlus,
  UserCog,
  Building2,
  ShieldCheck,
  ScrollText,
  Settings,
  type LucideIcon,
} from "lucide-react";
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

export type NavGroupId =
  | "dashboard"
  | "reports"
  | "duty"
  | "admin"
  | "settings";

export type NavItem = {
  id: NavItemId;
  label: string;
  path: string;
  component: LazyExoticComponent<ComponentType>;
  icon: LucideIcon;
  group: NavGroupId;
  allowedRoles?: string[];
};

// const Placeholder = lazy(
//   () => import("@/features/_placeholder/PagePlaceholder"),
// );

const UnitManagement = lazy(() => import("@/features/units/UnitManagement"));

const AccountManagement = lazy(
  () => import("@/features/accounts/AccountManagement"),
);

const DailyReport = lazy(
  () => import("@/features/reports/DailyReport"),
);

const PoliticalWorkReport = lazy(
  () => import("@/features/report-political-work/PoliticalWorkReport"),
);

const AuditLog = lazy(() => import("@/features/audit-log/AuditLog"));

const SettingsPage = lazy(() => import("@/features/settings/Settings"));

const RoleManagement = lazy(() => import("@/features/roles/RoleManagement"));

const DutyPersonnel = lazy(() => import("@/features/duty/DutyPersonnel"));

const DutyShifts = lazy(() => import("@/features/duty/DutyShifts"));  

const CreateDutyShift = lazy(() => import("@/features/duty/CreateDutyShift"));  

const ExecutiveDashboard = lazy(
  () => import("@/features/executive/ExecutiveDashboard"),
);

const PoliticalDashboard = lazy(
  () => import("@/features/political-dashboard/PoliticalDashboard"),
);

const ALL_REPORT_ROLES = [
  "Quản Trị Viên",
  "Trực ban tác chiến",
  "Trực chỉ huy",
  "Trực ban nội vụ",
];
const ADMIN_ONLY = ["Quản Trị Viên"];
const TAC_CHIEN = ["Quản Trị Viên", "Trực ban tác chiến"];

export const NAV_GROUPS: {
  id: NavGroupId;
  label: string;
  collapsedLabel?: string;
}[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "reports", label: "Cập nhật thống kê", collapsedLabel: "Thống kê" },
  { id: "duty", label: "Ca trực" },
  { id: "admin", label: "Quản trị" },
  { id: "settings", label: "Hệ thống" },
];

export const ALL_NAV_ITEMS: NavItem[] = [
  // --- Dashboard ---
  {
    id: "executive",
    label: "Tổng hợp trong ngày",
    path: "/dashboard",
    component: ExecutiveDashboard,
    icon: LayoutDashboard,
    group: "dashboard",
    allowedRoles: TAC_CHIEN,
  },
  {
    id: "executive-political-work",
    label: "Tổng hợp CTĐ, CTCT",
    path: "/political-dashboard",
    component: PoliticalDashboard,
    icon: Flag,
    group: "dashboard",
    allowedRoles: TAC_CHIEN,
  },
  // --- Cập nhật thống kê / Báo ban ---
  {
    id: "report-troop",
    label: "Thống kê quân số",
    path: "/daily-report",
    component: DailyReport,
    icon: ClipboardList,
    group: "reports",
    allowedRoles: ALL_REPORT_ROLES,
  },
  {
    id: "report-political-work",
    label: "Hoạt động CTĐ, CTCT",
    path: "/political-work-report",
    component: PoliticalWorkReport,
    icon: FileText,
    group: "reports",
    allowedRoles: ALL_REPORT_ROLES,
  },
  // --- Ca trực ---
  {
    id: "duty-personnel",
    label: "Quản lý ca trực",
    path: "/duty/personnel",
    component: DutyPersonnel,
    icon: UsersRound,
    group: "duty",
    allowedRoles: TAC_CHIEN,
  },
  {
    id: "duty-shifts",
    label: "Lịch sử ca trực",
    path: "/duty/shifts",
    component: DutyShifts,
    icon: History,
    group: "duty",
    allowedRoles: TAC_CHIEN,
  },
  {
    id: "duty-create",
    label: "Tạo ca trực",
    path: "/duty/create",
    component: CreateDutyShift,
    icon: CalendarPlus,
    group: "duty",
    allowedRoles: TAC_CHIEN,
  },
  // --- Quản trị ---
  {
    id: "account-management",
    label: "Quản lý tài khoản",
    path: "/account-management",
    component: AccountManagement,
    icon: UserCog,
    group: "admin",
    allowedRoles: ADMIN_ONLY,
  },
  {
    id: "unit-management",
    label: "Quản lý đơn vị",
    path: "/unit-management",
    component: UnitManagement,
    icon: Building2,
    group: "admin",
    allowedRoles: ADMIN_ONLY,
  },
  {
    id: "role-management",
    label: "Quản lý vai trò",
    path: "/role-management",
    component: RoleManagement,
    icon: ShieldCheck,
    group: "admin",
    allowedRoles: ADMIN_ONLY,
  },
  {
    id: "audit-log",
    label: "Nhật ký hệ thống",
    path: "/audit-log",
    component: AuditLog,
    icon: ScrollText,
    group: "admin",
    allowedRoles: ADMIN_ONLY,
  },
  // --- Cài đặt ---
  {
    id: "settings",
    label: "Cài đặt",
    path: "/settings",
    component: SettingsPage,
    icon: Settings,
    group: "settings",
    allowedRoles: ALL_REPORT_ROLES,
  },
];

export function getIdByPath(path: string): NavItemId {
  const exact = ALL_NAV_ITEMS.find((i) => i.path === path);
  if (exact) return exact.id;
  const prefix = ALL_NAV_ITEMS.find((i) => path.startsWith(i.path + "/"));
  return prefix?.id ?? "executive";
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

export function getNavGroupsByRole(
  userRole: string | null,
  capDonVi: string | null = null,
  tenChucnang: string[] | null = null,
): {
  id: NavGroupId;
  label: string;
  collapsedLabel?: string;
  items: NavItem[];
}[] {
  const items = getNavItemsByRole(userRole, capDonVi, tenChucnang);
  return NAV_GROUPS.map((g) => ({
    ...g,
    items: items.filter((i) => i.group === g.id),
  })).filter((g) => g.items.length > 0);
}

export function canAccessNavId(
  id: NavItemId,
  userRole: string | null,
  capDonVi: string | null = null,
  tenChucnang: string[] | null = null,
): boolean {
  if (id === "settings") return true;
  return getNavItemsByRole(userRole, capDonVi, tenChucnang).some(
    (i) => i.id === id,
  );
}

export const CHUC_NANG_OPTIONS: { value: NavItemId; label: string }[] =
  ALL_NAV_ITEMS.map((i) => ({ value: i.id, label: i.label }));