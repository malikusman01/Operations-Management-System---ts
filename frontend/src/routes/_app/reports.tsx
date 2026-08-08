import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/page-header";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { FileDown } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({ meta: [{ title: "Reports — ITOMS" }] }),
  component: ReportsPage,
});

const completion = ["W1","W2","W3","W4","W5","W6"].map((w, i) => ({ week: w, completed: 18 + i * 3, planned: 22 + i * 2 }));
const ticketRes = ["Jan","Feb","Mar","Apr","May","Jun"].map((m, i) => ({ month: m, mttr: 8 - i * 0.4, count: 110 + i * 8 }));
const productivity = ["IT","Network","Engineering","Support"].map((d, i) => ({ team: d, score: 70 + i * 6 }));

function ReportsPage() {
  return (
    <div>
      <PageHeader
        title="Reports"
        description="Productivity, completion and resolution analytics."
        actions={
          <>
            <Button variant="outline" onClick={() => toast.info("Exporting PDF…")}><FileDown className="mr-2 h-4 w-4" />PDF</Button>
            <Button onClick={() => toast.info("Exporting Excel…")}><FileDown className="mr-2 h-4 w-4" />Excel</Button>
          </>
        }
      />
      <Tabs defaultValue="weekly">
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>
        <TabsContent value="daily"><Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Daily report — connect to <code>/reports/daily</code></CardContent></Card></TabsContent>
        <TabsContent value="weekly">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Task completion</CardTitle></CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={completion}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="week" className="text-xs" /><YAxis className="text-xs" />
                    <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                    <Legend />
                    <Bar dataKey="planned" name="Planned" fill="var(--color-chart-2)" radius={[4,4,0,0]} />
                    <Bar dataKey="completed" name="Completed" fill="var(--color-chart-1)" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Department productivity</CardTitle></CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productivity} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" domain={[0, 100]} className="text-xs" />
                    <YAxis dataKey="team" type="category" className="text-xs" width={90} />
                    <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                    <Bar dataKey="score" fill="var(--color-accent)" radius={[0,4,4,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="monthly">
          <Card>
            <CardHeader><CardTitle>Ticket resolution</CardTitle></CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ticketRes}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" /><YAxis className="text-xs" />
                  <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                  <Legend />
                  <Line type="monotone" dataKey="mttr" name="MTTR (h)" stroke="var(--color-chart-5)" strokeWidth={2} />
                  <Line type="monotone" dataKey="count" name="Tickets" stroke="var(--color-chart-1)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
