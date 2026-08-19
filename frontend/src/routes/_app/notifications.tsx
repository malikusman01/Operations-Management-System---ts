import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/app/page-header";
import { notificationsService } from "@/lib/services";
import { relativeTime } from "@/lib/format";
import { CheckCheck, Bell } from "lucide-react";
import { notifIcon, notifTone, NotificationDetailDialog } from "@/components/app/notification-detail-dialog";
import type { Notification } from "@/lib/types";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — ITOMS" }] }),
  component: NotifPage,
});

function NotifPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["notifications"], queryFn: notificationsService.list });
  const [openId, setOpenId] = useState<string | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["notifications"] });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: invalidate,
  });

  const markOneMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: invalidate,
  });

  const openNotification = (n: Notification) => {
    setOpenId(n.id);
    if (!n.read) markOneMutation.mutate(n.id);
  };

  const unreadCount = data.filter((n) => !n.read).length;
  const active = data.find((n) => n.id === openId) ?? null;

  return (
    <div>
      <PageHeader
        title="Notifications"
        description={unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up."}
        actions={
          <Button variant="outline" onClick={() => markAllMutation.mutate()} disabled={markAllMutation.isPending || unreadCount === 0}>
            <CheckCheck className="mr-2 h-4 w-4" />Mark all read
          </Button>
        }
      />
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y">
            {isLoading && <li className="p-10 text-center text-sm text-muted-foreground">Loading…</li>}
            {!isLoading && data.length === 0 && (
              <li className="flex flex-col items-center gap-2 p-14 text-center text-sm text-muted-foreground">
                <Bell className="h-8 w-8 text-muted-foreground/40" />
                Nothing here yet — you'll see task and ticket updates as they happen.
              </li>
            )}
            {data.map((n) => {
              const Icon = notifIcon(n.type);
              return (
                <li
                  key={n.id}
                  onClick={() => openNotification(n)}
                  className={`flex cursor-pointer items-start gap-3 p-4 transition-colors hover:bg-muted/50 ${!n.read ? "bg-primary/5" : ""}`}
                >
                  <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${notifTone(n.type)}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`truncate text-sm ${!n.read ? "font-semibold" : "font-medium text-muted-foreground"}`}>
                        {n.title}
                      </p>
                      {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                    </div>
                    <p className="truncate text-sm text-muted-foreground">{n.body}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-xs text-muted-foreground">{relativeTime(n.createdAt)}</span>
                    <Badge variant="outline" className="text-[10px]">{n.type}</Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <NotificationDetailDialog notification={active} open={!!active} onOpenChange={(v) => !v && setOpenId(null)} />
    </div>
  );
}