import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/app/page-header";
import { PriorityBadge, StatusBadge } from "@/components/app/badges";
import { tasksService, usersService } from "@/lib/services";
import { fmtDate, userName } from "@/lib/format";
import { useAuth } from "@/lib/auth-context";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import type { TaskStatus, Priority } from "@/lib/types";

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({ meta: [{ title: "Tasks — ITOMS" }] }),
  component: TasksPage,
});

const STATUSES: TaskStatus[] = ["Assigned","In Progress","Pending","Waiting Approval","Completed","Overdue","Cancelled"];
const PRIORITIES: Priority[] = ["Low","Medium","High","Critical"];
const KANBAN_COLS: TaskStatus[] = ["Assigned","In Progress","Pending","Waiting Approval","Completed"];

type FormState = {
  title: string; description: string; priority: Priority; status: TaskStatus;
  assignedTo: string; deadline: string;
};
const emptyForm: FormState = {
  title: "", description: "", priority: "Medium", status: "Assigned", assignedTo: "", deadline: "",
};

function TasksPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: tasks = [], isLoading } = useQuery({ queryKey: ["tasks"], queryFn: tasksService.list });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: usersService.list });
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [priority, setPriority] = useState<string>("all");

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const filtered = useMemo(() => tasks.filter((t) =>
    (status === "all" || t.status === status) &&
    (priority === "all" || t.priority === priority) &&
    (q === "" || t.title.toLowerCase().includes(q.toLowerCase()) || t.id.toLowerCase().includes(q.toLowerCase()))
  ), [tasks, q, status, priority]);

  const createMutation = useMutation({
    mutationFn: () => tasksService.create({
      title: form.title,
      description: form.description,
      priority: form.priority,
      status: form.status,
      assignedBy: user?.id,
      assignedTo: form.assignedTo,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
    }),
    onSuccess: () => {
      toast.success("Task created");
      qc.invalidateQueries({ queryKey: ["tasks"] });
      setOpen(false);
      setForm(emptyForm);
    },
    onError: (e: Error) => toast.error(e.message || "Could not create task"),
  });

  const submit = () => {
    if (!form.title || !form.assignedTo) {
      toast.error("Title and assignee are required");
      return;
    }
    createMutation.mutate();
  };

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Plan, assign and track IT work across teams."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setForm(emptyForm)}><Plus className="mr-2 h-4 w-4" />New task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New task</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Priority</Label>
                    <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as Priority })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as TaskStatus })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Assigned to</Label>
                  <Select value={form.assignedTo} onValueChange={(v) => setForm({ ...form, assignedTo: v })}>
                    <SelectTrigger><SelectValue placeholder="Select a user" /></SelectTrigger>
                    <SelectContent>
                      {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.fullName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input id="deadline" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submit} disabled={createMutation.isPending}>Create task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="mb-4">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <div className="relative md:max-w-xs md:flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search title or ID…" className="pl-8" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="md:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="md:w-40"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">Table view</TabsTrigger>
          <TabsTrigger value="kanban">Kanban board</TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead><TableHead>Title</TableHead>
                    <TableHead>Assigned to</TableHead><TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead><TableHead>Deadline</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Loading…</TableCell></TableRow>}
                  {!isLoading && filtered.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No tasks match your filters.</TableCell></TableRow>
                  )}
                  {filtered.map((t) => (
                    <TableRow key={t.id} className="cursor-pointer">
                      <TableCell className="font-mono text-xs">{t.id}</TableCell>
                      <TableCell className="max-w-[300px] truncate font-medium">{t.title}</TableCell>
                      <TableCell>{userName(t.assignedTo)}</TableCell>
                      <TableCell><PriorityBadge priority={t.priority} /></TableCell>
                      <TableCell><StatusBadge status={t.status} /></TableCell>
                      <TableCell className="text-muted-foreground">{fmtDate(t.deadline)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kanban">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            {KANBAN_COLS.map((col) => {
              const items = filtered.filter((t) => t.status === col);
              return (
                <Card key={col} className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-sm">
                      <span>{col}</span>
                      <span className="rounded-full bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground">{items.length}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {items.map((t) => (
                      <div key={t.id} className="rounded-md border bg-background p-3 shadow-sm">
                        <p className="text-xs font-mono text-muted-foreground">{t.id}</p>
                        <p className="mt-1 line-clamp-2 text-sm font-medium">{t.title}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <PriorityBadge priority={t.priority} />
                          <span className="text-[11px] text-muted-foreground">{fmtDate(t.deadline)}</span>
                        </div>
                      </div>
                    ))}
                    {items.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">No tasks</p>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}