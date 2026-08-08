import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Priority, TaskStatus, TicketStatus, ProjectStatus } from "@/lib/types";

const taskMap: Record<TaskStatus, string> = {
  "Assigned": "bg-info/15 text-info border-info/30",
  "In Progress": "bg-primary/15 text-primary border-primary/30",
  "Pending": "bg-muted text-muted-foreground border-border",
  "Waiting Approval": "bg-warning/15 text-warning border-warning/30",
  "Completed": "bg-success/15 text-success border-success/30",
  "Overdue": "bg-destructive/15 text-destructive border-destructive/30",
  "Cancelled": "bg-muted text-muted-foreground border-border line-through",
};

const priorityMap: Record<Priority, string> = {
  Low: "bg-muted text-muted-foreground border-border",
  Medium: "bg-info/15 text-info border-info/30",
  High: "bg-warning/15 text-warning border-warning/30",
  Critical: "bg-destructive/15 text-destructive border-destructive/30",
};

const ticketMap: Record<TicketStatus, string> = {
  Open: "bg-info/15 text-info border-info/30",
  Assigned: "bg-primary/15 text-primary border-primary/30",
  "In Progress": "bg-warning/15 text-warning border-warning/30",
  Resolved: "bg-success/15 text-success border-success/30",
  Closed: "bg-muted text-muted-foreground border-border",
};

const projectMap: Record<ProjectStatus, string> = {
  Planned: "bg-muted text-muted-foreground border-border",
  Active: "bg-primary/15 text-primary border-primary/30",
  "At Risk": "bg-warning/15 text-warning border-warning/30",
  Completed: "bg-success/15 text-success border-success/30",
  "On Hold": "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <Badge variant="outline" className={cn(taskMap[status])}>{status}</Badge>;
}
export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge variant="outline" className={cn(priorityMap[priority])}>{priority}</Badge>;
}
export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return <Badge variant="outline" className={cn(ticketMap[status])}>{status}</Badge>;
}
export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge variant="outline" className={cn(projectMap[status])}>{status}</Badge>;
}
