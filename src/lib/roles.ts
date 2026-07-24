export function normalizeRoleName(role: string | undefined): string {
  if (!role) return "";
  const r = role.toLowerCase();
  if (r.includes("trực ban tác chiến")) return "Trực ban tác chiến";
  if (r.includes("trực ban nội vụ")) return "Trực ban nội vụ";
  if (r.includes("trực chỉ huy") || r.includes("chỉ huy"))
    return "Trực chỉ huy";
  if (r.includes("quản trị viên") || r.includes("admin"))
    return "Quản Trị Viên";
  return role;
}
