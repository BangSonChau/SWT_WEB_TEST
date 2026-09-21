import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginShemaZob, type loginSchemaZobType } from "../rule";
import useLogin from "../hooks/useLogin";

const LoginPage = () => {
  const handleLogin = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<loginSchemaZobType>({
    resolver: zodResolver(loginShemaZob),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: loginSchemaZobType) => {
    handleLogin.mutate(data);
  };

  // Lấy trạng thái loading từ mutation của useLogin (hoặc isSubmitting của form)
  const isPending = handleLogin.isPending || isSubmitting;

  return (
    <>
      <Helmet>
        <title>Đăng nhập · SWT Demo Tool</title>
        <meta
          name="description"
          content="Đăng nhập vào SWT Demo Tool để tiếp tục."
        />
        <meta property="og:title" content="Đăng nhập · SWT Demo Tool" />
        <meta
          property="og:description"
          content="Đăng nhập vào SWT Demo Tool để tiếp tục."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="relative flex min-h-[calc(100vh-72px)] items-center justify-center px-5 py-12">
        <div className="glass-card w-full max-w-[420px] rounded-[24px] ring-1 ring-white/25 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.7)]">
          {/* Logo header */}
          <div className="flex items-center gap-2.5 px-7 pt-8">
            <div className="grid size-9 place-items-center rounded-[10px] bg-ink text-paper ring-1 ring-white/20">
              <span className="font-display text-lg font-semibold leading-none">
                S
              </span>
            </div>
            <span className="font-display text-lg font-medium tracking-tight text-ink">
              SWT
            </span>
            <span className="ml-auto rounded-full bg-white/40 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-subtle ring-1 ring-white/30">
              Login
            </span>
          </div>

          {/* Title */}
          <div className="px-7 pt-8">
            <h1 className="font-display text-[34px] font-semibold leading-tight tracking-tight text-ink text-balance">
              Chào mừng trở lại
            </h1>
            <p className="mt-2 text-base text-subtle text-pretty">
              Đăng nhập để tiếp tục hành trình của bạn.
            </p>
          </div>

          {/* Form */}
          <form
            className="px-7 pt-7"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-ink"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="ban@vidu.vn"
                  className={`w-full rounded-[12px] bg-white/55 px-4 py-3 text-base text-ink placeholder:text-subtle/60 ring-1 outline-none transition-shadow focus:bg-white/80 ${
                    errors.email
                      ? "ring-red-400 focus:ring-2 focus:ring-red-500 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.12)]"
                      : "ring-white/40 focus:ring-2 focus:ring-brand/60 focus:shadow-[0_0_0_4px_rgba(255,90,54,0.12)]"
                  }`}
                  {...register("email")}
                />
                {errors.email && (
                  <p id="error-email" className="mt-1.5 text-xs text-red-500 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-ink"
                  >
                    Mật khẩu
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-ink/70 underline-offset-4 hover:text-ink hover:underline"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`w-full rounded-[12px] bg-white/55 px-4 py-3 text-base text-ink placeholder:text-subtle/60 ring-1 outline-none transition-shadow focus:bg-white/80 ${
                    errors.password
                      ? "ring-red-400 focus:ring-2 focus:ring-red-500 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.12)]"
                      : "ring-white/40 focus:ring-2 focus:ring-brand/60 focus:shadow-[0_0_0_4px_rgba(255,90,54,0.12)]"
                  }`}
                  {...register("password")}
                />
                {errors.password && (
                  <p id="error-password" className="mt-1.5 text-xs text-red-500 font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {/* Error banner từ Server/Mutation (nếu có lỗi API) */}
            {/* {handleLogin.isError && (
              <div className="mt-4 flex items-start gap-2 rounded-[12px] bg-brand/[0.08] px-3.5 py-2.5 ring-1 ring-brand/25">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-brand" />
                <p className="text-sm leading-snug text-ink/80 text-pretty">
                  {handleLogin.error?.message ||
                    "Đã có lỗi xảy ra. Vui lòng thử lại sau."}
                </p>
              </div>
            )} */}

            {/* Submit button */}
            <button
              id="btn-login"
              type="submit"
              disabled={isPending}
              className="mt-5 w-full rounded-[12px] bg-brand px-4 py-3 text-base font-semibold text-paper ring-1 ring-brand/50 outline-none transition-all hover:shadow-[0_10px_30px_-8px_rgba(255,90,54,0.7)] focus-visible:ring-2 focus-visible:ring-brand focus-visible:shadow-[0_0_0_4px_rgba(255,90,54,0.25)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            {/* Divider */}
            <div className="mt-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-white/40" />
              <span className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">
                hoặc
              </span>
              <span className="h-px flex-1 bg-white/40" />
            </div>

            <p className="mt-5 text-center text-sm text-subtle text-pretty">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="font-semibold text-ink underline-offset-4 hover:underline"
              >
                Đăng ký ngay
              </Link>
            </p>
          </form>

          {/* Footer note */}
          <div className="px-7 pb-7 pt-6">
            <p className="text-center text-xs text-subtle/80">
              Bằng cách tiếp tục, bạn đồng ý với Điều khoản &amp; Chính sách của
              SWT.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
