// src/features/auth/LoginPage.tsx
import { useState, useEffect, type FormEvent, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/errorHandler";
import { storage } from "@/lib/storage";
import { useLoginMutation } from "./queries";

import logo from "@/assets/images/logo-su5.png";
import loginBg from "@/assets/images/login-bg-dongson.png";

const GRADIENT_OVERLAY =
  "radial-gradient(700px 420px at 20% 18%, rgba(34,197,94,0.22), rgba(34,197,94,0) 60%)," +
  "radial-gradient(640px 420px at 82% 22%, rgba(14,165,233,0.16), rgba(14,165,233,0) 58%)," +
  "radial-gradient(760px 520px at 76% 88%, rgba(244,211,94,0.14), rgba(244,211,94,0) 62%)," +
  "radial-gradient(circle at 50% 45%, rgba(0,0,0,0) 28%, rgba(0,0,0,0.42) 100%)";

const APP_VERSION = "v1.0.0 beta";

// lỗi gắn theo field: "username" | "password"
type FieldError = { field: "username" | "password"; message: string } | null;

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [fieldError, setFieldError] = useState<FieldError>(null);
  const [capsOn, setCapsOn] = useState(false);
  const login = useLoginMutation();
  const loading = login.isPending;

  useEffect(() => {
    document.title = "Đăng nhập | Phần mềm thống kê Sư đoàn 5";
    if (storage.getToken()) navigate("/settings", { replace: true });
  }, [navigate]);

  function checkCaps(e: KeyboardEvent<HTMLInputElement>) {
    setCapsOn(e.getModifierState("CapsLock"));
  }

  // xóa lỗi của field khi người dùng gõ lại đúng field đó
  function clearFieldError(field: "username" | "password") {
    setFieldError((prev) => (prev?.field === field ? null : prev));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldError(null);
    if (!username.trim())
      return setFieldError({
        field: "username",
        message: "Vui lòng nhập tên đăng nhập",
      });
    if (!password.trim())
      return setFieldError({
        field: "password",
        message: "Vui lòng nhập mật khẩu",
      });

    try {
      const res = await login.mutateAsync({ userName: username, password });
      if (res.success && res.Result?.token) {
        toast.success("Đăng nhập thành công!");
        navigate("/settings", { replace: true });
      } else {
        // lỗi đăng nhập chung -> gắn dưới ô tên đăng nhập (giống ảnh mẫu)
        setFieldError({
          field: "username",
          message: res.message || "Đăng nhập thất bại",
        });
      }
    } catch (err) {
      setFieldError({ field: "username", message: getErrorMessage(err) });
    }
  }

  const usernameHasError = fieldError?.field === "username";
  const passwordHasError = fieldError?.field === "password";

  return (
    <main className="relative grid h-screen place-items-center overflow-hidden bg-primary p-4 sm:p-6">
      <div
        className="pointer-events-none fixed inset-0 opacity-50"
        style={{
          backgroundImage: `url(${loginBg})`,
          backgroundSize: "60% auto",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div
        className="pointer-events-none fixed inset-0"
        style={{ background: GRADIENT_OVERLAY }}
      />

      <div className="relative z-10 w-full max-w-[460px]">
        <section
          aria-labelledby="login-title"
          className="w-full rounded-2xl border border-white/80 border-t-4 border-t-primary bg-card/95 px-6 pb-6 pt-8 shadow-2xl dark:bg-[rgba(28,40,34,0.97)] sm:px-9 sm:pb-9 sm:pt-10"
        >
          <div className="relative mx-auto mb-4 h-28 w-28 select-none sm:mb-5 sm:h-32 sm:w-32">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(244,211,94,0.35), rgba(244,211,94,0) 70%)",
              }}
            />
            <img
              src={logo}
              alt="Logo Sư đoàn 5"
              className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-md sm:h-28 sm:w-28"
              draggable={false}
            />
          </div>
          <div className="select-none text-center">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[hsl(var(--login-text-muted))] sm:text-[11px]">
              Quân đội nhân dân Việt Nam
            </p>

            <div className="mb-2 flex items-center justify-center">
              <span className="mr-3 inline-block h-px w-6 bg-gold align-middle sm:w-8" />
              <span className="text-[26px] font-extrabold uppercase leading-none tracking-wide text-primary-text drop-shadow-sm sm:text-[32px]">
                Sư đoàn 5
              </span>
              <span className="ml-3 inline-block h-px w-6 bg-gold align-middle sm:w-8" />
            </div>

            <p className="text-base font-semibold leading-relaxed tracking-wide text-[hsl(var(--login-text-muted))] sm:text-lg">
              THỐNG KÊ QUÂN SỐ,
              <br />
              HOẠT ĐỘNG CTĐ, CTCT
            </p>
          </div>

          <div
            className="mx-auto mb-5 mt-4 h-[3px] w-16 rounded bg-gold sm:mb-6 sm:mt-5"
            role="presentation"
          />

          <h1
            id="login-title"
            className="mb-5 text-center text-2xl font-bold tracking-wide text-[hsl(var(--login-text))] sm:mb-7 sm:text-3xl"
          >
            Đăng nhập
          </h1>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4 sm:mb-5">
              <label
                htmlFor="username"
                className="mb-2 block text-[14px] font-medium text-[hsl(var(--login-text))]"
              >
                Tên đăng nhập
              </label>
              <input
                id="username"
                type="text"
                autoFocus
                autoComplete="username"
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  clearFieldError("username");
                }}
                disabled={loading}
                aria-invalid={usernameHasError}
                aria-describedby={
                  usernameHasError ? "username-error" : undefined
                }
                className={cn(
                  "h-12 w-full rounded-[10px] border bg-background px-4 text-[15px]",
                  "focus:outline-none focus:ring-2 disabled:opacity-50",
                  usernameHasError
                    ? "border-destructive focus:ring-destructive"
                    : "border-input focus:ring-ring",
                )}
              />
              {usernameHasError && (
                <p
                  id="username-error"
                  role="alert"
                  aria-live="assertive"
                  className="mt-1.5 text-sm font-medium text-destructive"
                >
                  {fieldError?.message}
                </p>
              )}
            </div>

            <div className="mb-5 sm:mb-6">
              <label
                htmlFor="password"
                className="mb-2 block text-[14px] font-medium text-[hsl(var(--login-text))]"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError("password");
                  }}
                  onKeyUp={checkCaps}
                  onKeyDown={checkCaps}
                  disabled={loading}
                  aria-invalid={passwordHasError}
                  aria-describedby={
                    passwordHasError ? "password-error" : undefined
                  }
                  className={cn(
                    "h-12 w-full rounded-[10px] border bg-background pl-4 pr-11 text-[15px]",
                    "focus:outline-none focus:ring-2 disabled:opacity-50",
                    passwordHasError
                      ? "border-destructive focus:ring-destructive"
                      : "border-input focus:ring-ring",
                  )}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground outline-none"
                >
                  {showPw ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
              {passwordHasError && (
                <p
                  id="password-error"
                  role="alert"
                  aria-live="assertive"
                  className="mt-1.5 text-sm font-medium text-destructive"
                >
                  {fieldError?.message}
                </p>
              )}
              {capsOn && !passwordHasError && (
                <p
                  role="alert"
                  className="mt-2 text-sm font-medium text-amber-600 dark:text-amber-400"
                >
                  Đang bật Caps Lock
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-[10px] text-base"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
        </section>
        <p className="mt-4 select-none text-center text-sm text-white/70">
          {APP_VERSION}
        </p>
      </div>
    </main>
  );
}
