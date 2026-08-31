import { Link, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ConfirmationModal } from "../ui/confirmation-modal";
import { buttonVariants } from "../ui/button";
import { cn } from "../../lib/utils";
import { useCurrentUser } from "../../features/auth/hooks/use-current-user";
import { logout } from "../../features/auth/services";
import { dashboardNavigation } from "../../constants/navigation";
import { useTheme } from "../theme-provider";

function DashboardShell() {
  const user = useCurrentUser();
  const { theme, toggleTheme } = useTheme();
  const [greeting, setGreeting] = useState("Good morning");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening");
  }, []);

  async function handleLogout() {
    await logout();
    window.location.href = "/login";
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className={cn("fixed inset-y-0 left-0 z-40 flex h-screen w-72 shrink-0 flex-col overflow-y-auto border-r bg-card p-5 transition-transform duration-200 lg:static lg:inset-auto lg:z-auto lg:translate-x-0", mobileOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none lg:pointer-events-auto", collapsed ? "lg:w-[76px] lg:px-2" : "lg:w-72")}>
        <div className={cn("flex items-center gap-3 pb-8", collapsed ? "justify-center" : "justify-between pl-3")}>
          <span className={cn("font-display text-2xl font-bold tracking-tight text-foreground", collapsed && "lg:hidden")}>mailcloud.</span>
          <button className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "size-9 shrink-0 p-0")} type="button" onClick={() => { if (window.innerWidth < 1024) setMobileOpen(false); else setCollapsed((current) => !current); }} aria-label={mobileOpen ? "Close navigation" : collapsed ? "Expand sidebar" : "Collapse sidebar"} title={mobileOpen ? "Close navigation" : collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            <MenuIcon />
          </button>
        </div>
        <nav className="grid gap-1.5" aria-label="Main navigation">
          {dashboardNavigation
            .filter((item) => !("role" in item) || item.role === user?.role)
            .map(({ to, label, icon }) => <NavLink key={to} to={to} label={label} icon={icon} collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />)}
        </nav>
        <div className="mt-auto border-t pt-5">
          <Link to="/dashboard/profile" onClick={() => setMobileOpen(false)} className={cn("flex items-center gap-3 rounded-lg bg-secondary/60 p-3 transition-colors hover:bg-secondary", collapsed ? "lg:justify-center lg:p-2" : "")} aria-label="Open profile">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground" aria-hidden="true">
              {user?.name?.slice(0, 1).toUpperCase() || "A"}
            </div>
            <div className={cn("min-w-0", collapsed ? "lg:hidden" : "")}>
              <p className="truncate text-sm font-semibold text-foreground">{user?.name || "Account"}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email || "Loading profile..."}</p>
            </div>
          </Link>
        </div>
      </aside>
      {mobileOpen && <button type="button" className="fixed inset-0 z-30 bg-black/40 lg:hidden" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <main className="min-w-0 flex-1 overflow-y-auto">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur sm:h-24 sm:px-6 lg:px-12">
          <div className="flex min-w-0 items-center gap-3">
            <button className={cn(buttonVariants({ variant: "outline", size: "sm" }), "size-9 shrink-0 p-0 lg:hidden")} type="button" onClick={() => setMobileOpen(true)} aria-label="Open navigation" title="Open navigation">
              <MenuIcon />
            </button>
            <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.13em] text-muted-foreground">Workspace</p>
            <h1 className="mt-1 truncate font-display text-base font-semibold text-foreground sm:text-lg">{greeting}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className={cn(buttonVariants({ variant: "outline", size: "sm" }), "size-9 p-0")} type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`} title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
              {theme === "light" ? <SunIcon /> : <MoonIcon />}
            </button>
            <button className={cn(buttonVariants({ variant: "destructive", size: "sm" }), "hidden lg:inline-flex")} type="button" onClick={() => setLogoutOpen(true)}>Log out</button>
          </div>
        </header>
        <Outlet />
        <ConfirmationModal
          open={logoutOpen}
          title="Log out?"
          description="Are you sure you want to end this session?"
          confirmLabel="Log out"
          confirmingLabel="Logging out..."
          onClose={() => setLogoutOpen(false)}
          onConfirm={handleLogout}
        />
      </main>
    </div>
  );
}

function NavLink({ to, label, icon, collapsed, onNavigate }: { to: (typeof dashboardNavigation)[number]["to"]; label: string; icon: (typeof dashboardNavigation)[number]["icon"]; collapsed: boolean; onNavigate: () => void }) {
  return <Link to={to} onClick={onNavigate} activeOptions={{ exact: true }} activeProps={{ className: "bg-secondary text-foreground" }} className={cn("flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground", collapsed ? "lg:justify-center lg:px-2" : "")} title={collapsed ? label : undefined}><NavIcon icon={icon} /><span className={cn(collapsed ? "lg:hidden" : "")}>{label}</span></Link>;
}

function NavIcon({ icon }: { icon: (typeof dashboardNavigation)[number]["icon"] }) {
  const common = { className: "size-4 shrink-0", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (icon === "overview") return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
  if (icon === "send") return <svg {...common}><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>;
  if (icon === "history") return <svg {...common}><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5M12 7v5l3 2" /></svg>;
  if (icon === "settings") return <svg {...common}><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" /><circle cx="12" cy="12" r="4" /></svg>;
  if (icon === "approvals") return <svg {...common}><path d="m5 12 4 4L19 6" /><path d="M4 4h16v16H4z" /></svg>;
  return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
}

function MenuIcon() {
  return <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>;
}

function SunIcon() {
  return <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" /></svg>;
}

function MoonIcon() {
  return <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.7 6.7 0 0 0 21 12.8Z" /></svg>;
}

export { DashboardShell };
