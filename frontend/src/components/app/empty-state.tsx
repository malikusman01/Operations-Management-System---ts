import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

export function EmptyState({ title = "Nothing here yet", description, action }: { title?: string; description?: string; action?: ReactNode }) {
  return (
    <div className="grid place-items-center rounded-lg border border-dashed p-10 text-center">
      <Inbox className="mb-3 h-8 w-8 text-muted-foreground" />
      <p className="font-medium">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
