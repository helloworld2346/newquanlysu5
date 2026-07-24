import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLoginMutation } from "./queries";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/errorHandler";

const schema = z.object({
  userName: z.string().min(1, "Nhập tên đăng nhập"),
  password: z.string().min(1, "Nhập mật khẩu"),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    login.mutate(values, {
      onSuccess: (res) => {
        if (res.success && res.Result?.token) {
          toast.success("Đăng nhập thành công!");
          navigate("/settings", { replace: true });
        } else {
          toast.error(res.message || "Đăng nhập thất bại");
        }
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background text-foreground">
      <div className="w-full max-w-sm rounded-lg border bg-card p-6 text-card-foreground">
        <h1 className="mb-4 text-xl font-semibold">Đăng nhập</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm">Tên đăng nhập</label>
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              {...register("userName")}
            />
            {errors.userName && (
              <p className="text-xs text-destructive">
                {errors.userName.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm">Mật khẩu</label>
            <input
              type="password"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>
      </div>
    </div>
  );
}
