import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PriorityBadge, StatusBadge } from "@/components/app/badges";
import { TaskTimerControl } from "@/components/app/task-timer";
import { fmtDateTime, timeLeft, userName } from "@/lib/format";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksService } from "@/lib/services";
import { toast } from "sonner";
import { Pencil, Trash2, User as UserIcon, UserCog, Clock } from "lucide-react";
import type { Task, TaskStatus, User } from "@/lib/types";

const STATUSES: TaskStatus[] = ["Assigned", "In Progress", "Pending", "Waiting Approval", "Completed", "Overdue", "Cancelled"];

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
  users,
  isManager,
  canControlTimer,
  onEdit,
  onDelete,
}: {
  task: Task | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  users: User[];
  isManager: boolean;
  canControlTimer: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const qc = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: (status: TaskStatus) => tasksService.update(task?.id ?? "", { status }),
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (e: Error) => toast.error(e.message || "Could not update status"),
  });

  if (!task) return null;

  const tl = timeLeft(task.deadline);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-xs text-muted-foreground">{task.id}</p>
              <DialogTitle className="mt-0.5 text-left leading-snug">{task.title}</DialogTitle>
            </div>
            <PriorityBadge priority={task.priority} />
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {task.description && (
            <p className="whitespace-pre-line text-sm text-muted-foreground">{task.description}</p>
          )}

          <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center gap-2 text-sm">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Assignee</p>
                <p className="font-medium">{userName(task.assignedTo, users)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <UserCog className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Assigned by</p>
                <p className="font-medium">{userName(task.assignedBy, users)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Deadline</p>
                <p className={`font-medium ${tl.overdue ? "text-destructive" : ""}`}>{fmtDateTime(task.deadline)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className={tl.overdue ? "border-destructive/30 bg-destructive/10 text-destructive" : ""}>
                {tl.label}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-xs text-muted-foreground">Time tracked</p>
              <TaskTimerControl task={task} canControl={canControlTimer} />
            </div>
            <StatusBadge status={task.status} />
          </div>

          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">Change status</p>
            <Select value={task.status} onValueChange={(v) => statusMutation.mutate(v as TaskStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isManager && (
          <DialogFooter className="gap-2 sm:justify-between">
            <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => onDelete(task)}>
              <Trash2 className="mr-2 h-3.5 w-3.5" />Delete
            </Button>
            <Button onClick={() => onEdit(task)}>
              <Pencil className="mr-2 h-3.5 w-3.5" />Edit task
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}