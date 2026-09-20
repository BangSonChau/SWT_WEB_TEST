import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuthStore } from "../../feature/auth/store";

export function UserLayout() {
  const accessToken = useAuthStore((s) => s.accessToken);

  const linkBase =
    "rounded-full px-4 py-2 text-sm font-medium text-paper/70 transition-colors hover:text-paper";
  const activeCls = "bg-white/10 text-paper ring-1 ring-white/20";

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-ink font-body">
      <div className="pointer-events-none absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full bg-[#3b6ea5]/30 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-44 right-[-120px] h-[560px] w-[560px] rounded-full bg-[#1f3a5f]/50 blur-[130px]" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-[360px] w-[360px] rounded-full bg-brand/20 blur-[120px]" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="panel-a absolute left-[8%] top-[-12%] h-[140%] w-[230px] rounded-[28px] bg-white/[0.06] ring-1 ring-white/10"
          style={{ transform: "rotate(9deg)" }}
        />
        <div
          className="panel-b absolute right-[14%] top-[-10%] h-[150%] w-[300px] rounded-[28px] bg-white/[0.05] ring-1 ring-white/10"
          style={{ transform: "rotate(-11deg)" }}
        />
        <div
          className="panel-a absolute left-[42%] top-[-20%] h-[160%] w-[120px] rounded-[28px] bg-white/[0.04] ring-1 ring-white/10"
          style={{ transform: "rotate(6deg)" }}
        />
      </div>

      <div className="relative z-10">
        <header className="flex h-[72px] items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-[10px] bg-paper text-ink ring-1 ring-white/20">
              <span className="font-display text-lg font-semibold leading-none">
                S
              </span>
            </span>
            <span className="font-display text-lg font-medium tracking-tight text-paper">
              SWT
            </span>
          </Link>
          <nav className="flex items-center gap-1 rounded-full bg-white/[0.06] p-1 ring-1 ring-white/10">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? `${linkBase} ${activeCls}` : linkBase
              }
            >
              Home
            </NavLink>

            {!accessToken && (
              <NavLink
                to="/login"
                end
                className={({ isActive }) =>
                  isActive ? `${linkBase} ${activeCls}` : linkBase
                }
              >
                Login
              </NavLink>
            )}
          </nav>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
