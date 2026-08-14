export function stripMarks(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function isDbOrEbUnit(donVi?: {
  tenDonvi?: string;
  kyhieuDonvi?: string;
}): boolean {
  const name = stripMarks(donVi?.tenDonvi ?? "");
  const symbol = stripMarks(donVi?.kyhieuDonvi ?? "");
  const hay = `${name} ${symbol}`;
  return (
    hay.includes("d bo") ||
    hay.includes("e bo") ||
    hay.includes("dbo") ||
    hay.includes("ebo") ||
    symbol.includes("ch/e") ||
    symbol.includes("ch/d")
  );
}

export function computeHideDraftForCommander(args: {
  isChiHuy: boolean;
  capDonViAcc?: string | null;
  accountDonVi?: { tenDonvi?: string; kyhieuDonvi?: string };
}): boolean {
  const { isChiHuy, capDonViAcc, accountDonVi } = args;
  if (!isChiHuy) return false;
  if (
    capDonViAcc !== "TRUNG_DOAN" &&
    capDonViAcc !== "TIEU_DOAN" &&
    capDonViAcc !== "SU_DOAN"
  )
    return false;
  return !isDbOrEbUnit(accountDonVi);
}
