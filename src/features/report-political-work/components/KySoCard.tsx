import { type ReactNode, useRef } from "react";
import {
  PenLine,
  CheckCircle2,
  ImagePlus,
  X,
  User,
  Award,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TrucNguoi } from "@/types/politicalWork";

function SignerRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <span className="flex items-center text-muted-foreground">
        <span className="mr-1.5">{icon}</span>
        {label}
      </span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  );
}

export default function KySoCard({
  chuKySo,
  setChuKySo,
  signer,
}: {
  chuKySo: string;
  setChuKySo: (v: string) => void;
  signer: TrucNguoi | null;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh (PNG/JPG).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ảnh chữ ký tối đa 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setChuKySo(String(reader.result));
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center text-base">
          <PenLine className="mr-2 size-4 text-primary" />
          Ký số báo cáo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={handlePick}
        />
        <div className="-mx-2 flex flex-wrap items-stretch">
          <div className="mb-2 w-full px-2 md:w-2/3">
            {chuKySo ? (
              <div className="flex h-full items-center justify-center rounded-lg border bg-[length:16px_16px] bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%),linear-gradient(-45deg,#f1f5f9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f5f9_75%),linear-gradient(-45deg,transparent_75%,#f1f5f9_75%)] p-4">
                <img
                  src={chuKySo}
                  alt="Chữ ký"
                  className="max-h-40 object-contain"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-full min-h-[180px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-input bg-muted/30 py-8 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <ImagePlus className="mb-2 size-8" />
                Bấm để chọn ảnh chữ ký (PNG/JPG, tối đa 2MB)
              </button>
            )}
          </div>

          <div className="mb-2 w-full px-2 md:w-1/3">
            <div className="flex h-full flex-col justify-between rounded-lg border bg-muted/30 p-4">
              <div>
                {chuKySo ? (
                  <div className="mb-3 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    <CheckCircle2 className="mr-1.5 size-4" />
                    Đã ký số
                  </div>
                ) : (
                  <div className="mb-3 inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
                    <PenLine className="mr-1.5 size-4" />
                    Chưa ký số
                  </div>
                )}
                <p className="mb-3 text-sm text-muted-foreground">
                  Ký số vào báo cáo nháp trước khi bấm "Trình phê duyệt". Ảnh
                  chữ ký định dạng PNG/JPG.
                </p>
                <div className="divide-y rounded-lg border bg-background/70 text-sm">
                  <SignerRow
                    icon={<User className="size-3.5" />}
                    label="Người ký"
                    value={signer?.hoTen}
                  />
                  <SignerRow
                    icon={<Award className="size-3.5" />}
                    label="Cấp bậc"
                    value={signer?.capBac}
                  />
                  <SignerRow
                    icon={<Briefcase className="size-3.5" />}
                    label="Chức vụ"
                    value={signer?.chucVu}
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-col">
                <Button
                  variant="outline"
                  className="mb-2 w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="mr-2 size-4" />
                  {chuKySo ? "Đổi ảnh chữ ký" : "Chọn ảnh chữ ký"}
                </Button>
                {chuKySo && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setChuKySo("")}
                  >
                    <X className="mr-2 size-4" /> Xóa chữ ký
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
