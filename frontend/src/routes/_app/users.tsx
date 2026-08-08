import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/app/page-header";
import { usersService } from "@/lib/services";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@/lib/types";

export const Route = createFileRoute("/_app/users")({
  head: () => ({ meta: [{ title: "Users — ITOMS" }] }),
  component: UsersPage,
});

const ROLES = ["Manager IT","Assistant Manager IT","Network Administrator","Web Developer","IT Technician","System Administrator"];

type FormState = { fullName: string; email: string; password: string; role: string; department: string };
const emptyForm: FormState = { fullName: "", email: "", password: "", role: ROLES[0], department: "" };

function UsersPage() {
  const qc = useQueryClient();
  const { data: users = [], isLoading } = useQuery({ queryKey: ["users"], queryFn: usersService.list });
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [dept, setDept] = useState("all");

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const departments = useMemo(() => Array.from(new Set(users.map((u) => u.department).filter(Boolean))), [users]);

  const filtered = useMemo(() => users.filter((u) =>
    (role === "all" || u.role === role) &&
    (dept === "all" || u.department === dept) &&
    (q === "" || u.fullName.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()))
  ), [users, q, role, dept]);

  const createMutation = useMutation({
    mutationFn: () => usersService.create({
      fullName: form.fullName, email: form.email, password: form.password,
    }),
    onSuccess: () => {
      toast.success("User created");
      qc.invalidateQueries({ queryKey: ["users"] });
      setOpen(false);
      setForm(emptyForm);
    },
    onError: (e: Error) => toast.error(e.message || "Could not create user"),
  });

  const updateMutation = useMutation({
    mutationFn: (id: string) => usersService.update(id, {
      fullName: form.fullName, email: form.email,
    }),
    onSuccess: () => {
      toast.success("User updated");
      qc.invalidateQueries({ queryKey: ["users"] });
      setOpen(false);
      setEditingId(null);
      setForm(emptyForm);
    },
    onError: (e: Error) => toast.error(e.message || "Could not update user"),
  });

  const statusMutation = useMutation({
    mutationFn: (u: User) => usersService.update(u.id, { status: u.status === "Active" ? "Inactive" : "Active" }),
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e: Error) => toast.error(e.message || "Could not update status"),
  });

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (u: User) => {
    setEditingId(u.id);
    setForm({ fullName: u.fullName, email: u.email, password: "", role: u.role, department: u.department });
    setOpen(true);
  };

  const submit = () => {
    if (!form.fullName || !form.email || (!editingId && !form.password)) {
      toast.error("Full name, email, and password are required");
      return;
    }
    if (editingId) updateMutation.mutate(editingId);
    else createMutation.mutate();
  };

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage corporate IT user accounts."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add user</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit user" : "Add user"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="fullName">Full name</Label>
                  <Input id="fullName" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                {!editingId && (
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                  </div>
                )}
                <div>
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Role assignment isn't saved to the backend yet — the Roles module has no API endpoint.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submit} disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? "Save changes" : "Create user"}
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
            <Input placeholder="Search by name or email…" className="pl-8" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="md:w-56"><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="md:w-48"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead><TableHead>Role</TableHead>
                <TableHead>Department</TableHead><TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">Loading…</TableCell></TableRow>
              )}
              {!isLoading && filtered.map((u) => {
                const initials = u.fullName.split(" ").map((p) => p[0]).slice(0, 2).join("");
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8"><AvatarFallback>{initials}</AvatarFallback></Avatar>
                        <div>
                          <p className="font-medium">{u.fullName}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell>{u.department}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={u.status === "Active" ? "bg-success/15 text-success border-success/30" : "bg-muted text-muted-foreground"}>
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(u)}>Edit</Button>
                      <Button variant="ghost" size="sm" onClick={() => statusMutation.mutate(u)} disabled={statusMutation.isPending}>
                        {u.status === "Active" ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!isLoading && filtered.length === 0 && (
                <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No users match your filters.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}