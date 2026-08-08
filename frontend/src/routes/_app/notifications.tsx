import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/app/page-header";
import { notificationsService } from "@/lib/services";
import { fmtDateTime } from "@/lib/format";
import { Bell, CheckCheck } from "lucide-react";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — ITOMS" }] }),
  component: NotifPage,
});

function NotifPage() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["notifications"], queryFn: notificationsService.list });

  const markAll = () => {
    qc.setQueryData(["notifications"], data.map((n) => ({ ...n, read: true })));
  };
  const markOne = (id: string) => {
    qc.setQueryData(["notifications"], data.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Task, deadline and ticket updates."
        actions={<Button variant="outline" onClick={markAll}><CheckCheck className="mr-2 h-4 w-4" />Mark all read</Button>}
      />
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y">
            {data.map((n) => (
              <li key={n.id} className="flex items-start gap-3 p-4">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary"><Bell className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{n.title}</p>
                    {!n.read && <Badge className="bg-primary text-primary-foreground">New</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{n.type} · {fmtDateTime(n.createdAt)}</p>
                </div>
                {!n.read && <Button size="sm" variant="ghost" onClick={() => markOne(n.id)}>Mark read</Button>}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
