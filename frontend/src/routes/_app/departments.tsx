import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/app/page-header";
import { departmentsService } from "@/lib/services";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { Department } from "@/lib/types";

export const Route = createFileRoute("/_app/departments")({
  head: () => ({ meta: [{ title: "Departments — ITOMS" }] }),
  component: DepartmentsPage,
});

type FormState = { name: string; description: string };
const emptyForm: FormState = { name: "", description: "" };

function DepartmentsPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["departments"], queryFn: departmentsService.list });

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["departments"] });

  const createMutation = useMutation({
    mutationFn: () => departmentsService.create(form),
    onSuccess: () => { toast.success("Department created"); invalidate(); setOpen(false); setForm(emptyForm); },
    onError: (e: Error) => toast.error(e.message || "Could not create department"),
  });

  const updateMutation = useMutation({
    mutationFn: (id: string) => departmentsService.update(id, form),
    onSuccess: () => { toast.success("Department updated"); invalidate(); setOpen(false); setEditingId(null); setForm(emptyForm); },
    onError: (e: Error) => toast.error(e.message || "Could not update department"),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => departmentsService.remove(id),
    onSuccess: () => { toast.success("Department deleted"); invalidate(); setDeleteTarget(null); },
    onError: (e: Error) => toast.error(e.message || "Could not delete department"),
  });

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (d: Department) => { setEditingId(d.id); setForm({ name: d.name, description: d.description }); setOpen(true); };

  const submit = () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    if (editingId) updateMutation.mutate(editingId);
    else createMutation.mutate();
  };

  return (
    <div>
      <PageHeader
        title="Departments"
        description="Organisational units served by IT."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />New department</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingId ? "Edit department" : "New department"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submit} disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? "Save changes" : "Create department"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={3} className="py-8 text-center text-muted-foreground">Loading…</TableCell></TableRow>}
              {!isLoading && data.length === 0 && (
                <TableRow><TableCell colSpan={3} className="py-8 text-center text-muted-foreground">No departments yet.</TableCell></TableRow>
              )}
              {data.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell className="text-muted-foreground">{d.description}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(d)}>Edit</Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(d)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete department?</AlertDialogTitle>
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