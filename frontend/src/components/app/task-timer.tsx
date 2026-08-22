import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { tasksService } from "@/lib/services";
import { fmtDuration } from "@/lib/format";
import { Play, Pause } from "lucide-react";
import { toast } from "sonner";
import type { Task } from "@/lib/types";

export function useElapsedSeconds(task: Task): number {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!task.timerRunningSince) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [task.timerRunningSince]);

  if (!task.timerRunningSince) return task.timeSpentSeconds;
  const startedAt = new Date(task.timerRunningSince).getTime();
  const runningFor = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
  return task.timeSpentSeconds + runningFor + 0 * tick;
}

export function TaskTimerControl({
  task,
  canControl,
  size = "default",
}: {
  task: Task;
  canControl: boolean;
  size?: "default" | "sm";
}) {
  const qc = useQueryClient();
  const elapsed = useElapsedSeconds(task);
  const running = !!task.timerRunningSince;

  const invalidate = () => qc.invalidateQueries({ queryKey: ["tasks"] });

  const startMutation = useMutation({
    mutationFn: () => tasksService.startTimer(task.id),
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message || "Could not start timer"),
  });
  const stopMutation = useMutation({
    mutationFn: () => tasksService.stopTimer(task.id),
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message || "Could not stop timer"),
  });

  const toggle = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (running) stopMutation.mutate();
    else startMutation.mutate();
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className={`font-mono text-xs tabular-nums ${running ? "text-primary font-medium" : "text-muted-foreground"}`}>
        {fmtDuration(elapsed)}
      </span>
      {canControl && (
        <Button
          type="button"
          variant={running ? "secondary" : "ghost"}
          size="icon"
          className={size === "sm" ? "h-6 w-6" : "h-7 w-7"}
          onClick={toggle}
          disabled={startMutation.isPending || stopMutation.isPending}
          title={running ? "Stop timer" : "Start timer"}
        >
          {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </Button>
      )}
    </div>
  );
}