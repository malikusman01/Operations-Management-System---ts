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
import { departmentsService, rolesService, usersService } from "@/lib/services";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@/lib/types";

export const Route = createFileRoute("/_app/users")({
  head: () => ({ meta: [{ title: "Users — ITOMS" }] }),
  component: UsersPage,
});

type FormState = {
  fullName: string; email: string; password: string;
  roleId: string; departmentId: string;
};
const emptyForm: FormState = { fullName: "", email: "", password: "", roleId: "", departmentId: "" };

function UsersPage() {
  const qc = useQueryClient();
  const { data: users = [], isLoading } = useQuery({ queryKey: ["users"], queryFn: usersService.list });
  const { data: roles = [] } = useQuery({ queryKey: ["roles"], queryFn: rolesService.list });
  const { data: departments = [] } = useQuery({ queryKey: ["departments"], queryFn: departmentsService.list });

  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  // Resolve a user's role/department display name: prefer the id-based
  // lookup against the real /roles and /departments lists (this is what
  // actually reflects what's saved in the database); fall back to
  // whatever name string fromUser() produced (covers older mock data that
  // has no roleId/departmentId at all).
  const roleName = (u: User) => roles.find((r) => r.id === u.roleId)?.name ?? u.role;
  const deptName = (u: User) => departments.find((d) => d.id === u.departmentId)?.name ?? u.department;

  const filtered = useMemo(() => users.filter((u) =>
    (roleFilter === "all" || roleName(u) === roleFilter) &&
    (deptFilter === "all" || deptName(u) === deptFilter) &&
    (q === "" || u.fullName.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [users, q, roleFilter, deptFilter, roles, departments]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["users"] });

  const buildPayload = (): Partial<User> & { password?: string } => {
    const selectedRole = roles.find((r) => r.id === form.roleId);
    const selectedDept = departments.find((d) => d.id === form.departmentId);
    return {
      fullName: form.fullName,
      email: form.email,
      password: form.password || undefined,
      roleId: form.roleId || undefined,
      role: (selectedRole?.name as User["role"]) ?? undefined,
      departmentId: form.departmentId || undefined,
      department: selectedDept?.name ?? undefined,
    };
  };

  const createMutation = useMutation({
    mutationFn: () => usersService.create(buildPayload()),
    onSuccess: () => {
      toast.success("User created");
      invalidate();
      setOpen(false);
      setForm(emptyForm);
    },
    onError: (e: Error) => toast.error(e.message || "Could not create user"),
  });

  const updateMutation = useMutation({
    mutationFn: (id: string) => {
      const { password: _password, ...rest } = buildPayload();
      return usersService.update(id, rest);
    },
    onSuccess: () => {
      toast.success("User updated");
      invalidate();
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
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "Could not update status"),
  });

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (u: User) => {
    setEditingId(u.id);
    // Prefer the real id if present; otherwise best-effort match by name
    // (covers users created before roleId/departmentId were saved).
    const roleId = u.roleId ?? roles.find((r) => r.name === u.role)?.id ?? "";
    const departmentId = u.departmentId ?? departments.find((d) => d.name === u.department)?.id ?? "";
    setForm({ fullName: u.fullName, email: u.email, password: "", roleId, departmentId });
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
                  <Select value={form.roleId} onValueChange={(v) => setForm({ ...form, roleId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Department</Label>
                  <Select value={form.departmentId} onValueChange={(v) => setForm({ ...form, departmentId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select a department" /></SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
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
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="md:w-56"><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {roles.map((r) => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="md:w-48"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
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
                    <TableCell>{roleName(u)}</TableCell>
                    <TableCell>{deptName(u) || <span className="text-muted-foreground">—</span>}</TableCell>
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