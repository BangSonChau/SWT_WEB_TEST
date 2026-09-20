import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { useAuthStore } from "../../feature/auth/store";
import { toast } from "sonner";

export const meta: MetaFunction = () => {
  return [
    { title: "SWT Demo Tool" },
    { name: "description", content: "Trang chủ của SWT Demo Tool." },
    { property: "og:title", content: "SWT Demo Tool" },
    { property: "og:description", content: "Trang chủ của SWT Demo Tool." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
};

export default function HomePage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const clearToken = useAuthStore((s) => s.clearToken);

  const handleLogout = () => {
    clearToken();
    toast.success("Logout successfully")
  };

  return (
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center px-6 py-16 text-center">
      <div>
        <h1 className="font-display text-[clamp(38px,7vw,76px)] font-semibold leading-tight tracking-tight text-paper text-balance">
          SWT DEMO TOOL
        </h1>
        <p className="mx-auto mt-4 max-w-[520px] text-base text-paper/60 text-pretty">
          Bộ công cụ demo. Đăng nhập để bắt đầu sử dụng.
        </p>

        {accessToken ? (
          <button
            onClick={handleLogout}
            className="mt-8 inline-flex items-center justify-center rounded-[12px] bg-brand px-6 py-3 text-base font-semibold text-paper ring-1 ring-brand/50 transition-shadow hover:shadow-[0_10px_30px_-8px_rgba(255,90,54,0.7)]"
          >
            Đăng xuất
          </button>
        ) : (
          <Link
            to="/login"
            className="mt-8 inline-flex items-center justify-center rounded-[12px] bg-brand px-6 py-3 text-base font-semibold text-paper ring-1 ring-brand/50 transition-shadow hover:shadow-[0_10px_30px_-8px_rgba(255,90,54,0.7)]"
          >
            Đăng nhập
          </Link>
        )}
      </div>
    </div>
  );
}
