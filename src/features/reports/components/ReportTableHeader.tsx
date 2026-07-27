import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

// 1 màu duy nhất cho toàn header: nền slate-700, chữ trắng
const th =
  "border border-white/20 bg-slate-700 text-center align-middle whitespace-nowrap px-2 text-xs font-semibold text-white";
const thV =
  "border border-white/20 bg-slate-700 text-center align-middle px-1 py-2 text-xs font-semibold text-white";

function V({ children }: { children: string }) {
  const words = children.split(" ");
  return (
    <span className="flex flex-col items-center leading-tight">
      {words.map((w, i) => (
        <span key={i}>{w}</span>
      ))}
    </span>
  );
}

export default function ReportTableHeader() {
  return (
    <TableHeader>
      <TableRow className="border-white/20 hover:bg-transparent">
        <TableHead rowSpan={3} className={th}>
          Đơn vị
        </TableHead>
        <TableHead rowSpan={3} className={thV}>
          <V>Tổng quân số</V>
        </TableHead>
        <TableHead rowSpan={3} className={thV}>
          <V>Hiện diện</V>
        </TableHead>
        <TableHead rowSpan={3} className={thV}>
          <V>Tổng vắng</V>
        </TableHead>
        <TableHead colSpan={14} className={th}>
          Quân số vắng
        </TableHead>
        <TableHead rowSpan={3} className={thV}>
          <V>Trạng thái</V>
        </TableHead>
        <TableHead rowSpan={3} className={th}>
          Ghi chú
        </TableHead>
        <TableHead rowSpan={3} className={thV}>
          <V>Thao tác</V>
        </TableHead>
      </TableRow>

      <TableRow className="border-white/20 hover:bg-transparent">
        <TableHead colSpan={2} className={th}>
          Hội thao
        </TableHead>
        <TableHead colSpan={2} className={th}>
          Xây dựng
        </TableHead>
        <TableHead rowSpan={2} className={thV}>
          <V>Chờ hưu</V>
        </TableHead>
        <TableHead rowSpan={2} className={thV}>
          <V>Nghỉ tranh thủ</V>
        </TableHead>
        <TableHead rowSpan={2} className={thV}>
          <V>Phép</V>
        </TableHead>
        <TableHead colSpan={2} className={th}>
          Viện
        </TableHead>
        <TableHead colSpan={2} className={th}>
          Công tác
        </TableHead>
        <TableHead colSpan={2} className={th}>
          Học
        </TableHead>
        <TableHead rowSpan={2} className={thV}>
          <V>Lý do khác</V>
        </TableHead>
      </TableRow>

      <TableRow className="border-white/20 hover:bg-transparent">
        <TableHead className={thV}>
          <V>Ngoài Sư đoàn</V>
        </TableHead>
        <TableHead className={thV}>
          <V>Trung đoàn, Sư đoàn</V>
        </TableHead>
        <TableHead className={thV}>
          <V>Ngoài Sư đoàn</V>
        </TableHead>
        <TableHead className={thV}>
          <V>Trung đoàn, Sư đoàn</V>
        </TableHead>
        <TableHead className={thV}>
          <V>Ngoài Sư đoàn</V>
        </TableHead>
        <TableHead className={thV}>
          <V>Trung đoàn, Sư đoàn</V>
        </TableHead>
        <TableHead className={thV}>
          <V>Ngoài Sư đoàn</V>
        </TableHead>
        <TableHead className={thV}>
          <V>Sư đoàn</V>
        </TableHead>
        <TableHead className={thV}>
          <V>SQ</V>
        </TableHead>
        <TableHead className={thV}>
          <V>CS</V>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
