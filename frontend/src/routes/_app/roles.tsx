import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Minus } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";

export const Route = createFileRoute("/_app/roles")({
  head: () => ({ meta: [{ title: "Roles & Permissions — ITOMS" }] }),
  component: RolesPage,
});

const ROLES = ["Manager IT","Assistant Manager IT","Network Administrator","Web Developer","IT Technician","System Administrator"];
const MODULES = ["Dashboard","Tasks","Projects","Users","Tickets","Assets","Infrastructure","Reports","Settings","Audit Logs"];
// each cell: 'R' read, 'W' write, '-' none
const MATRIX: Record<string, Record<string, string>> = {
  "Manager IT":           Object.fromEntries(MODULES.map((m) => [m, "W"])),
  "Assistant Manager IT": Object.fromEntries(MODULES.map((m) => [m, m === "Audit Logs" ? "R" : "W"])),
  "Network Administrator": Object.fromEntries(MODULES.map((m) => [m, ["Tasks","Tickets","Infrastructure","Assets","Dashboard"].includes(m) ? "W" : "R"])),
  "Web Developer":         Object.fromEntries(MODULES.map((m) => [m, ["Tasks","Projects","Dashboard"].includes(m) ? "W" : "R"])),
  "IT Technician":         Object.fromEntries(MODULES.map((m) => [m, ["Tickets","Tasks","Assets","Dashboard"].includes(m) ? "W" : "R"])),
  "System Administrator":  Object.fromEntries(MODULES.map((m) => [m, "W"])),
};

function Cell({ v }: { v: string }) {
  if (v === "W") return <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-success/15 text-success"><Check className="h-3.5 w-3.5" /></span>;
  if (v === "R") return <span className="inline-flex h-6 items-center justify-center rounded-full bg-info/15 px-2 text-[10px] font-medium text-info">Read</span>;
  return <Minus className="mx-auto h-4 w-4 text-muted-foreground/40" />;
}

function RolesPage() {
  return (
    <div>
      <PageHeader title="Roles & permissions" description="Permission matrix for each role across modules." />
      <Card>
        <CardHeader><CardTitle>Permission matrix</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Role</TableHead>
                {MODULES.map((m) => <TableHead key={m} className="text-center text-xs">{m}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {ROLES.map((r) => (
                <TableRow key={r}>
                  <TableCell className="font-medium">{r}</TableCell>
                  {MODULES.map((m) => <TableCell key={m} className="text-center"><Cell v={MATRIX[r][m]} /></TableCell>)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
