import { stripMarks } from "@/shared/report/visibility";

type UnitLike = {
  maDonVi?: string;
  kyhieuDonvi?: string;
  tenDonvi?: string;
  capDonVi?: string | null;
};

export function isPctUnit(u?: UnitLike): boolean {
  const ky = (u?.kyhieuDonvi ?? "").toLowerCase();
  const ten = stripMarks(u?.tenDonvi ?? "");
  return ky.includes("pct") || ten.includes("chinh tri");
}

export function isBctUnit(u?: UnitLike): boolean {
  const ky = (u?.kyhieuDonvi ?? "").toLowerCase();
  const ten = stripMarks(u?.tenDonvi ?? "");
  return ky.includes("bct") || ten.includes("ban chinh tri");
}

export function accountIsPoliticalOffice(
  tenDangNhap?: string,
  donVi?: UnitLike,
): boolean {
  const login = (tenDangNhap ?? "").toLowerCase().replace(/^@+/, "");
  return login.startsWith("pct_") || isPctUnit(donVi);
}

export function accountIsBanChinhTri(donVi?: UnitLike): boolean {
  return (
    !accountIsPoliticalOffice(undefined, donVi) &&
    donVi?.capDonVi === "BAN" &&
    isBctUnit(donVi)
  );
}

export function parentMaDonVi(ma?: string): string | undefined {
  if (!ma) return undefined;
  return ma.split(".").slice(0, -1).join(".") || undefined;
}
