import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { PriorityBadge, StatusBadge, TicketStatusBadge } from "@/components/app/badges";
import { tasksService, ticketsService, usersService, projectsService } from "@/lib/services";
import { fmtDate, userName } from "@/lib/format";
import {
  ListChecks, ClockAlert, CheckCircle2, AlertTriangle, FolderKanban, UserCheck, TicketCheck,
} from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ITOMS" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks"], queryFn: tasksService.list });
  const { data: tickets = [] } = useQuery({ queryKey: ["tickets"], queryFn: ticketsService.list });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: usersService.list });
  const { data: projects = [] } = useQuery({ queryKey: ["projects"], queryFn: projectsService.list });

  const totalTasks = tasks.length;
  const openTasks = tasks.filter((t) => !["Completed", "Cancelled"].includes(t.status)).length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const overdue = tasks.filter((t) => t.status === "Overdue").length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const openTickets = tickets.filter((t) => !["Resolved", "Closed"].includes(t.status)).length;

  const statusDist = ["Assigned", "In Progress", "Pending", "Waiting Approval", "Completed", "Overdue", "Cancelled"].map((s) => ({
    name: s, value: tasks.filter((t) => t.status === s).length,
  }));
  const palette = ["#2563eb", "#0ea5e9", "#64748b", "#f59e0b", "#10b981", "#ef4444", "#94a3b8"];

  const productivity = ["Jan","Feb","Mar","Apr","May","Jun"].map((m, i) => ({
    month: m, completed: 24 + i * 4 + (i % 2 ? 5 : 0), created: 30 + i * 5,
  }));
  const dept = [
    { name: "IT", score: 88 }, { name: "Network", score: 76 },
    { name: "Engineering", score: 92 }, { name: "Support", score: 81 },
  ];
  const ticketTrend = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => ({
    day: d, opened: 12 + (i % 3) * 3, resolved: 10 + (i % 4) * 4,
  }));

  return (
    <div>
      <PageHeader title="Operations dashboard" description="Real-time view of your IT operations." />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-7">
        <StatCard label="Total tasks" value={totalTasks} icon={ListChecks} tone="primary" />
        <StatCard label="Open tasks" value={openTasks} icon={ListChecks} tone="info" />
        <StatCard label="Completed" value={completed} icon={CheckCircle2} tone="success" />
        <StatCard label="Overdue" value={overdue} icon={ClockAlert} tone="destructive" />
        <StatCard label="Projects" value={projects.length} icon={FolderKanban} tone="accent" />
        <StatCard label="Active users" value={activeUsers} icon={UserCheck} tone="info" />
        <StatCard label="Open tickets" value={openTickets} icon={TicketCheck} tone="warning" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Monthly productivity</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productivity}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="created" name="Created" fill="var(--color-chart-2)" radius={[4,4,0,0]} />
                <Bar dataKey="completed" name="Completed" fill="var(--color-chart-1)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Task status</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusDist} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {statusDist.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Department performance</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dept} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" domain={[0, 100]} className="text-xs" />
                <YAxis dataKey="name" type="category" className="text-xs" width={90} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Bar dataKey="score" fill="var(--color-accent)" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Ticket resolution trend</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ticketTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Legend />
                <Line type="monotone" dataKey="opened" stroke="var(--color-chart-5)" strokeWidth={2} />
                <Line type="monotone" dataKey="resolved" stroke="var(--color-chart-3)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Recent tasks</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task ID</TableHead><TableHead>Title</TableHead>
                  <TableHead>Assigned to</TableHead><TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead><TableHead>Deadline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.slice(0, 6).map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{t.id}</TableCell>
                    <TableCell className="max-w-[220px] truncate">{t.title}</TableCell>
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

        <Card>
          <CardHeader><CardTitle>Recent tickets</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead><TableHead>Category</TableHead>
                  <TableHead>Assigned to</TableHead><TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.slice(0, 6).map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{t.id}</TableCell>
                    <TableCell>{t.category}</TableCell>
                    <TableCell>{userName(t.assignedTo)}</TableCell>
                    <TableCell><TicketStatusBadge status={t.status} /></TableCell>
                    <TableCell className="text-muted-foreground">{fmtDate(t.createdAt)}</TableCell>
                  </TableRow>
                ))}
                {tickets.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="py-6 text-center text-muted-foreground">No tickets</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <AlertTriangle className="h-3.5 w-3.5" />
        Running in demo mode. Set <code className="rounded bg-muted px-1">VITE_API_URL</code> to connect to your FastAPI backend.
      </p>
    </div>
  );
}
