export const EDITABLE = [
  "Nháp",
  "Tu_Choi",
  "Từ_Chối",
  "Từ chối",
  "Cần_Cập_Nhật",
  "Cần cập nhật",
  "Can_Cap_Nhat",
  "Trả_Về",
  "Trả về",
  "Tra_Ve",
];

const DRAFT = ["Nháp", "Nhap", "DRAFT"];
export const isDraft = (s: string) => DRAFT.includes(s);

const REFUSED = ["Từ_Chối", "Từ chối", "Tu_Choi"];
export const isRefused = (s: string) => REFUSED.includes(s);

const NEED_UPDATE = [
  "Cần_Cập_Nhật",
  "Cần cập nhật",
  "Can_Cap_Nhat",
  "Trả_Về",
  "Trả về",
  "Tra_Ve",
];
export const isNeedUpdate = (s: string) => NEED_UPDATE.includes(s);

const RETURNED = ["Trả_Về", "Trả về", "Tra_Ve"];
export const isReturned = (s: string) => RETURNED.includes(s);

export const STATUS_FILTERS = [
  { value: "Chua_Nop", label: "Chưa nộp" },
  { value: "Đã_Duyệt", label: "Đã duyệt" },
];

export function normalizeStatus(s: string): string {
  if (["Chờ_Duyệt", "Chờ duyệt"].includes(s)) return "Chờ_Duyệt";
  if (["Đã_Duyệt", "Đã duyệt", "Da_Duyet"].includes(s)) return "Đã_Duyệt";
  return s;
}
