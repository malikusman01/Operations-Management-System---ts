import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/app/page-header";
import { TicketStatusBadge } from "@/components/app/badges";
import { ticketsService, usersService } from "@/lib/services";
import { fmtDate, userName } from "@/lib/format";
import { useAuth } from "@/lib/auth-context";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import type { TicketCategory } from "@/lib/types";

export const Route = createFileRoute("/_app/tickets")({
  head: () => ({ meta: [{ title: "Tickets — ITOMS" }] }),
  component: TicketsPage,
});

const CATEGORIES: TicketCategory[] = ["Hardware","Software","Network","CCTV","Printer","Internet","Application"];
const STATUSES = ["Open","Assigned","In Progress","Resolved","Closed"];

type FormState = { subject: string; description: string; category: TicketCategory; priority: string; assignedTo: string };
const emptyForm: FormState = { subject: "", description: "", category: "Hardware", priority: "Medium", assignedTo: "" };

function TicketsPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: tickets = [], isLoading } = useQuery({ queryKey: ["tickets"], queryFn: ticketsService.list });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: usersService.list });
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [status, setStatus] = useState("all");

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const filtered = useMemo(() => tickets.filter((t) =>
    (cat === "all" || t.category === cat) &&
    (status === "all" || t.status === status) &&
    (q === "" || t.subject.toLowerCase().includes(q.toLowerCase()) || t.id.toLowerCase().includes(q.toLowerCase()))
  ), [tickets, q, cat, status]);

  const createMutation = useMutation({
    mutationFn: () => ticketsService.create({
      subject: form.subject,
      category: form.category,
      requester: user?.id,
      assignedTo: form.assignedTo || undefined,
      status: "Open",
      // description/priority are passed through toTicket via a cast — see adapters.ts
      ...({ description: form.description, priority: form.priority } as object),
    }),
    onSuccess: () => {
      toast.success("Ticket created");
      qc.invalidateQueries({ queryKey: ["tickets"] });
      setOpen(false);
      setForm(emptyForm);
    },
    onError: (e: Error) => toast.error(e.message || "Could not create ticket"),
  });

  const submit = () => {
    if (!form.subject) {
      toast.error("Subject is required");
      return;
    }
    createMutation.mutate();
  };

  return (
    <div>
      <PageHeader
        title="Tickets"
        description="End-user support requests and IT incidents."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setForm(emptyForm)}><Plus className="mr-2 h-4 w-4" />New ticket</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New ticket</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as TicketCategory })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Low","Medium","High","Critical"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Assign to (optional)</Label>
                  <Select value={form.assignedTo} onValueChange={(v) => setForm({ ...form, assignedTo: v })}>
                    <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                    <SelectContent>
                      {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.fullName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submit} disabled={createMutation.isPending}>Create ticket</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="mb-4">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row">
          <div className="relative md:max-w-xs md:flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search subject or ID…" className="pl-8" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="md:w-48"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="md:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead><TableHead>Subject</TableHead>
                <TableHead>Category</TableHead><TableHead>Requester</TableHead>
                <TableHead>Assigned to</TableHead><TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Loading…</TableCell></TableRow>
              )}
              {!isLoading && filtered.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">{t.id}</TableCell>
                  <TableCell className="font-medium">{t.subject}</TableCell>
                  <TableCell>{t.category}</TableCell>
                  <TableCell>{userName(t.requester)}</TableCell>
                  <TableCell>{userName(t.assignedTo)}</TableCell>
                  <TableCell><TicketStatusBadge status={t.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{fmtDate(t.createdAt)}</TableCell>
                </TableRow>
              ))}
              {!isLoading && filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No tickets match.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}