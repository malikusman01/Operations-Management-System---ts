import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/app/page-header";
import { ProjectStatusBadge } from "@/components/app/badges";
import { projectsService, usersService } from "@/lib/services";
import { fmtDate, userName } from "@/lib/format";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Project, ProjectStatus } from "@/lib/types";

export const Route = createFileRoute("/_app/projects")({
  head: () => ({ meta: [{ title: "Projects — ITOMS" }] }),
  component: ProjectsPage,
});

const STATUSES: ProjectStatus[] = ["Planned", "Active", "At Risk", "Completed", "On Hold"];

type FormState = {
  name: string; description: string; owner: string; startDate: string; endDate: string;
  status: ProjectStatus; progress: number;
};
const emptyForm: FormState = { name: "", description: "", owner: "", startDate: "", endDate: "", status: "Planned", progress: 0 };

function ProjectsPage() {
  const qc = useQueryClient();
  const { data: projects = [], isLoading } = useQuery({ queryKey: ["projects"], queryFn: projectsService.list });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: usersService.list });

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["projects"] });

  const asPayload = () => ({
    name: form.name,
    description: form.description,
    owner: form.owner,
    startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
    endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
    status: form.status,
    progress: Number(form.progress) || 0,
  });

  const createMutation = useMutation({
    mutationFn: () => projectsService.create(asPayload()),
    onSuccess: () => { toast.success("Project created"); invalidate(); setOpen(false); setForm(emptyForm); },
    onError: (e: Error) => toast.error(e.message || "Could not create project"),
  });

  const updateMutation = useMutation({
    mutationFn: (id: string) => projectsService.update(id, asPayload()),
    onSuccess: () => { toast.success("Project updated"); invalidate(); setOpen(false); setEditingId(null); setForm(emptyForm); },
    onError: (e: Error) => toast.error(e.message || "Could not update project"),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => projectsService.remove(id),
    onSuccess: () => { toast.success("Project deleted"); invalidate(); setDeleteTarget(null); },
    onError: (e: Error) => toast.error(e.message || "Could not delete project"),
  });

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (p: Project) => {
    setEditingId(p.id);
    setForm({
      name: p.name, description: p.description, owner: p.owner,
      startDate: p.startDate?.slice(0, 10) ?? "", endDate: p.endDate?.slice(0, 10) ?? "",
      status: p.status, progress: p.progress,
    });
    setOpen(true);
  };

  const submit = () => {
    if (!form.name.trim() || !form.owner) { toast.error("Name and owner are required"); return; }
    if (editingId) updateMutation.mutate(editingId);
    else createMutation.mutate();
  };

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Long-running IT initiatives and their progress."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />New project</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editingId ? "Edit project" : "New project"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div>
                  <Label>Owner</Label>
                  <Select value={form.owner} onValueChange={(v) => setForm({ ...form, owner: v })}>
                    <SelectTrigger><SelectValue placeholder="Select an owner" /></SelectTrigger>
                    <SelectContent>
                      {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.fullName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="startDate">Start date</Label>
                    <Input id="startDate" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End date</Label>
                    <Input id="endDate" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ProjectStatus })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="progress">Progress (%)</Label>
                    <Input id="progress" type="number" min={0} max={100} value={form.progress}
                      onChange={(e) => setForm({ ...form, progress: Math.max(0, Math.min(100, Number(e.target.value))) })} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submit} disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? "Save changes" : "Create project"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && projects.length === 0 && <p className="text-sm text-muted-foreground">No projects yet — create one to get started.</p>}
        {projects.map((p) => (
          <Card key={p.id} className="group relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{p.name}</CardTitle>
                <ProjectStatusBadge status={p.status} />
              </div>
              <p className="text-xs text-muted-foreground">{p.id} · Owner {userName(p.owner)}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{p.progress}%</span>
                </div>
                <Progress value={p.progress} />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{fmtDate(p.startDate)}</span>
                <span>→ {fmtDate(p.endDate)}</span>
              </div>
              <div className="flex justify-end gap-1 pt-1">
                <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="mr-1 h-3.5 w-3.5" />Edit</Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(p)}>
                  <Trash2 className="mr-1 h-3.5 w-3.5" />Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes "{deleteTarget?.name}" permanently. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && removeMutation.mutate(deleteTarget.id)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}