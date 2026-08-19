import { useRouterState, Link, useNavigate } from "@tanstack/react-router";
import { Bell, Menu, Moon, Search, Sun, LogOut, User as UserIcon, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "./sidebar";
import { useTheme } from "@/lib/theme-context";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "@/lib/services";
import { relativeTime } from "@/lib/format";
import { notifIcon, notifTone, NotificationDetailDialog } from "@/components/app/notification-detail-dialog";
import { useState } from "react";
import type { Notification } from "@/lib/types";

const labelize = (seg: string) =>
  seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function Topbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const segs = pathname.split("/").filter(Boolean);
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsService.list,
  });
  const unread = notifications.filter((n) => !n.read).length;
  const recent = notifications.slice(0, 5);
  const [activeNotif, setActiveNotif] = useState<Notification | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["notifications"] });
  const markOneMutation = useMutation({ mutationFn: (id: string) => notificationsService.markRead(id), onSuccess: invalidate });
  const markAllMutation = useMutation({ mutationFn: () => notificationsService.markAllRead(), onSuccess: invalidate });

  const openNotification = (n: Notification) => {
    setActiveNotif(n);
    if (!n.read) markOneMutation.mutate(n.id);
  };

  const initials = user?.fullName.split(" ").map((p) => p[0]).slice(0, 2).join("") ?? "U";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="sr-only"><SheetTitle>Navigation</SheetTitle></SheetHeader>
          <Sidebar />
        </SheetContent>
      </Sheet>

      <div className="hidden min-w-0 flex-1 md:block">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link to="/dashboard" className="hover:text-foreground">ITOMS</Link>
          {segs.map((s, i) => (
            <span key={i} className="flex items-center gap-1">
              <span>/</span>
              <span className={i === segs.length - 1 ? "text-foreground font-medium" : ""}>{labelize(s)}</span>
            </span>
          ))}
        </nav>
      </div>

      <div className="relative ml-auto hidden lg:block">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search tasks, tickets, assets…" className="w-72 pl-8" />
      </div>

      <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full p-0 text-[10px]">
                {unread}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-0">
          <div className="flex items-center justify-between px-3 py-2.5">
            <p className="text-sm font-semibold">Notifications</p>
            {unread > 0 && (
              <button
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => markAllMutation.mutate()}
              >
                <CheckCheck className="h-3.5 w-3.5" />Mark all read
              </button>
            )}
          </div>
          <DropdownMenuSeparator className="m-0" />
          {recent.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">Nothing here yet.</p>
          )}
          <div className="max-h-80 overflow-y-auto">
            {recent.map((n) => {
              const Icon = notifIcon(n.type);
              return (
                <div
                  key={n.id}
                  onClick={() => openNotification(n)}
                  className={`flex cursor-pointer items-start gap-2.5 px-3 py-2.5 hover:bg-muted/60 ${!n.read ? "bg-primary/5" : ""}`}
                >
                  <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${notifTone(n.type)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-xs ${!n.read ? "font-semibold" : "text-muted-foreground"}`}>{n.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{relativeTime(n.createdAt)}</p>
                  </div>
                  {!n.read && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                </div>
              );
            })}
          </div>
          <DropdownMenuSeparator className="m-0" />
          <button
            className="w-full px-3 py-2.5 text-center text-xs font-medium text-primary hover:bg-muted/60"
            onClick={() => navigate({ to: "/notifications" })}
          >
            View all notifications
          </button>
        </DropdownMenuContent>
      </DropdownMenu>

      <NotificationDetailDialog notification={activeNotif} open={!!activeNotif} onOpenChange={(v) => !v && setActiveNotif(null)} />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full pr-2 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar className="h-8 w-8"><AvatarFallback>{initials}</AvatarFallback></Avatar>
            <div className="hidden text-left text-xs leading-tight md:block">
              <p className="font-medium">{user?.fullName}</p>
              <p className="text-muted-foreground">{user?.role}</p>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild><Link to="/settings"><UserIcon className="mr-2 h-4 w-4" />Profile & settings</Link></DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}