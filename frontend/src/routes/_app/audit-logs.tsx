import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/app/page-header";
import { auditLogsService } from "@/lib/services";
import { fmtDateTime } from "@/lib/format";
import { Search, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/audit-logs")({
  head: () => ({ meta: [{ title: "Audit Logs — ITOMS" }] }),
  component: AuditPage,
});

function AuditPage() {
  const { data = [] } = useQuery({ queryKey: ["audit-logs"], queryFn: auditLogsService.list });
  const [q, setQ] = useState("");
  const [mod, setMod] = useState("all");
  const modules = useMemo(() => Array.from(new Set(data.map((l) => l.module))), [data]);
  const filtered = data.filter((l) =>
    (mod === "all" || l.module === mod) &&
    (q === "" || l.user.toLowerCase().includes(q.toLowerCase()) || l.action.toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <div>
      <PageHeader
        title="Audit logs"
        description="All actions taken across the system."
        actions={<Button variant="outline" onClick={() => toast.info("Exporting CSV…")}><Download className="mr-2 h-4 w-4" />Export</Button>}
      />
      <Card className="mb-4">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row">
          <div className="relative md:max-w-xs md:flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search user or action…" className="pl-8" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select value={mod} onValueChange={setMod}>
            <SelectTrigger className="md:w-48"><SelectValue placeholder="Module" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All modules</SelectItem>
              {modules.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Timestamp</TableHead><TableHead>User</TableHead><TableHead>Action</TableHead><TableHead>Module</TableHead><TableHead>Details</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="text-muted-foreground">{fmtDateTime(l.timestamp)}</TableCell>
                  <TableCell className="font-medium">{l.user}</TableCell>
                  <TableCell>{l.action}</TableCell>
                  <TableCell>{l.module}</TableCell>
                  <TableCell className="text-muted-foreground">{l.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
