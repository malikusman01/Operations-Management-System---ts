import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { fmtDateTime } from "@/lib/format";
import { ListChecks, TicketCheck, Clock, AlertTriangle, Bell } from "lucide-react";
import type { Notification } from "@/lib/types";

export const notifIcon = (type: Notification["type"]) => {
  switch (type) {
    case "Task Assigned": return ListChecks;
    case "Ticket Updates": return TicketCheck;
    case "Deadline Reminder": return Clock;
    case "Overdue Task": return AlertTriangle;
    default: return Bell;
  }
};

export const notifTone = (type: Notification["type"]) => {
  switch (type) {
    case "Task Assigned": return "bg-info/15 text-info";
    case "Ticket Updates": return "bg-primary/15 text-primary";
    case "Deadline Reminder": return "bg-warning/15 text-warning";
    case "Overdue Task": return "bg-destructive/15 text-destructive";
    default: return "bg-muted text-muted-foreground";
  }
};

export function NotificationDetailDialog({
  notification,
  open,
  onOpenChange,
}: {
  notification: Notification | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!notification) return null;
  const Icon = notifIcon(notification.type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${notifTone(notification.type)}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-left leading-snug">{notification.title}</DialogTitle>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{notification.type}</Badge>
                <span className="text-xs text-muted-foreground">{fmtDateTime(notification.createdAt)}</span>
              </div>
            </div>
          </div>
        </DialogHeader>
        <p className="whitespace-pre-line text-sm text-muted-foreground">
          {notification.body || "No further details were attached to this notification."}
        </p>
      </DialogContent>
    </Dialog>
  );
}