import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/app/page-header";
import { assetsService } from "@/lib/services";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Asset, AssetType } from "@/lib/types";

export const Route = createFileRoute("/_app/assets")({
  head: () => ({ meta: [{ title: "Assets — ITOMS" }] }),
  component: AssetsPage,
});

const TYPES: AssetType[] = [
  "Laptop", "Desktop", "Printer", "Router", "Switch", "PoE Switch",
  "CCTV Camera", "Phone", "Cable", "Monitor",
];
const STATUSES = ["In Use", "In Storage", "Faulty", "Retired"] as const;

type FormState = {
  tag: string; type: AssetType; brand: string; model: string; serial: string;
  location: string; assigneeName: string; employeeCode: string;
  status: Asset["status"];
};
const emptyForm: FormState = {
  tag: "", type: "Laptop", brand: "", model: "", serial: "", location: "",
  assigneeName: "", employeeCode: "", status: "In Storage",
};

function AssetsPage() {
  const qc = useQueryClient();
  const { data: assets = [], isLoading } = useQuery({ queryKey: ["assets"], queryFn: assetsService.list });
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);

  const filtered = useMemo(() => assets.filter((a) =>
    (type === "all" || a.type === type) &&
    (q === "" ||
      a.tag.toLowerCase().includes(q.toLowerCase()) ||
      a.serial.toLowerCase().includes(q.toLowerCase()) ||
      a.model.toLowerCase().includes(q.toLowerCase()) ||
      a.assigneeName.toLowerCase().includes(q.toLowerCase()) ||
      a.employeeCode.toLowerCase().includes(q.toLowerCase()))
  ), [assets, q, type]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["assets"] });

  const asPayload = () => ({
    tag: form.tag,
    type: form.type,
    brand: form.brand,
    model: form.model,
    serial: form.serial,
    location: form.location,
    assigneeName: form.assigneeName,
    employeeCode: form.employeeCode,
    status: form.status,
  });

  const createMutation = useMutation({
    mutationFn: () => assetsService.create(asPayload()),
    onSuccess: () => { toast.success("Asset added"); invalidate(); setOpen(false); setForm(emptyForm); },
    onError: (e: Error) => toast.error(e.message || "Could not add asset"),
  });

  const updateMutation = useMutation({
    mutationFn: (id: string) => assetsService.update(id, asPayload()),
    onSuccess: () => { toast.success("Asset updated"); invalidate(); setOpen(false); setEditingId(null); setForm(emptyForm); },
    onError: (e: Error) => toast.error(e.message || "Could not update asset"),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => assetsService.remove(id),
    onSuccess: () => { toast.success("Asset removed"); invalidate(); setDeleteTarget(null); },
    onError: (e: Error) => toast.error(e.message || "Could not remove asset"),
  });

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (a: Asset) => {
    setEditingId(a.id);
    setForm({
      tag: a.tag, type: a.type, brand: a.brand, model: a.model, serial: a.serial,
      location: a.location, assigneeName: a.assigneeName, employeeCode: a.employeeCode,
      status: a.status,
    });
    setOpen(true);
  };

  const submit = () => {
    if (!form.tag.trim() || !form.model.trim()) { toast.error("Tag and model are required"); return; }
    if (editingId) updateMutation.mutate(editingId);
    else createMutation.mutate();
  };

  const statusTone = (s: string) =>
    s === "In Use" ? "bg-success/15 text-success border-success/30"
    : s === "Faulty" ? "bg-destructive/15 text-destructive border-destructive/30"
    : s === "Retired" ? "bg-muted text-muted-foreground"
    : "bg-info/15 text-info border-info/30";

  return (
    <div>
      <PageHeader
        title="Assets"
        description="Inventory of all IT hardware and devices."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add asset</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editingId ? "Edit asset" : "Add asset"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="tag">Asset tag</Label>
                    <Input id="tag" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as AssetType })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Input id="brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input id="model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="serial">Serial number</Label>
                    <Input id="serial" value={form.serial} onChange={(e) => setForm({ ...form, serial: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="assigneeName">Assignee name</Label>
                    <Input id="assigneeName" placeholder="e.g. Maria Lopez" value={form.assigneeName} onChange={(e) => setForm({ ...form, assigneeName: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="employeeCode">Employee code</Label>
                    <Input id="employeeCode" placeholder="e.g. EMP-1043" value={form.employeeCode} onChange={(e) => setForm({ ...form, employeeCode: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Asset["status"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submit} disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? "Save changes" : "Add asset"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="mb-4">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row">
          <div className="relative md:max-w-xs md:flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search tag, serial, model, assignee…" className="pl-8" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="md:w-48"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag</TableHead><TableHead>Type</TableHead>
                <TableHead>Model</TableHead><TableHead>Serial</TableHead>
                <TableHead>Location</TableHead><TableHead>Assignee</TableHead>
                <TableHead>Employee code</TableHead><TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={9} className="py-8 text-center text-muted-foreground">Loading…</TableCell></TableRow>}
              {!isLoading && filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-xs">{a.tag}</TableCell>
                  <TableCell>{a.type}</TableCell>
                  <TableCell>{a.brand} {a.model}</TableCell>
                  <TableCell className="font-mono text-xs">{a.serial}</TableCell>
                  <TableCell className="text-muted-foreground">{a.location}</TableCell>
                  <TableCell>{a.assigneeName || <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell className="text-muted-foreground">{a.employeeCode || "—"}</TableCell>
                  <TableCell><Badge variant="outline" className={statusTone(a.status)}>{a.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(a)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(a)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && filtered.length === 0 && (
                <TableRow><TableCell colSpan={9} className="py-8 text-center text-muted-foreground">No assets match.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove asset?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes "{deleteTarget?.tag}" from inventory permanently. This can't be undone.
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