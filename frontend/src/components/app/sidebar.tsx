import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, ListChecks, FolderKanban, Users, Building2, TicketCheck,
  HardDrive, Network, BookOpen, BarChart3, Bell, ScrollText, Settings, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { isManager } from "@/lib/permissions";
import { Logo } from "./logo";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, managerOnly: false },
  { to: "/tasks", label: "Tasks", icon: ListChecks, managerOnly: false },
  { to: "/projects", label: "Projects", icon: FolderKanban, managerOnly: true },
  { to: "/users", label: "Users", icon: Users, managerOnly: true },
  { to: "/roles", label: "Roles", icon: ShieldCheck, managerOnly: true },
  { to: "/departments", label: "Departments", icon: Building2, managerOnly: true },
  { to: "/tickets", label: "Tickets", icon: TicketCheck, managerOnly: false },
  { to: "/assets", label: "Assets", icon: HardDrive, managerOnly: true },
  { to: "/infrastructure", label: "Infrastructure", icon: Network, managerOnly: true },
  { to: "/knowledge-base", label: "Knowledge Base", icon: BookOpen, managerOnly: true },
  { to: "/reports", label: "Reports", icon: BarChart3, managerOnly: true },
  { to: "/notifications", label: "Notifications", icon: Bell, managerOnly: false },
  { to: "/audit-logs", label: "Audit Logs", icon: ScrollText, managerOnly: true },
  { to: "/settings", label: "Settings", icon: Settings, managerOnly: false },
] as const;

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const manager = isManager(user?.role);
  const items = nav.filter((item) => manager || !item.managerOnly);

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <Logo />
      </div>
        <div>
          <p className="text-sm font-semibold leading-none">ITOMS</p>
          <p className="text-[11px] text-sidebar-foreground/60">IT Operations</p>
        </div>
      </div>
      <nav className="scrollbar-thin flex-1 overflow-y-auto p-3">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-sidebar-border p-4 text-[11px] text-sidebar-foreground/60">
        v1.0 · © ITOMS
      </div>
    </aside>
  );
}