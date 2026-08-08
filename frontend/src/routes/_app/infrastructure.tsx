import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/app/page-header";

export const Route = createFileRoute("/_app/infrastructure")({
  head: () => ({ meta: [{ title: "Infrastructure — ITOMS" }] }),
  component: InfraPage,
});

const ips = [
  { name: "core-rtr-01", ip: "10.0.0.1", location: "Server room", notes: "MikroTik CCR2004" },
  { name: "fw-edge-01", ip: "10.0.0.2", location: "Server room", notes: "Edge firewall" },
  { name: "sw-f3-01", ip: "10.0.3.10", location: "Floor 3 IDF", notes: "Cisco CBS350" },
  { name: "ap-f2-04", ip: "10.0.2.44", location: "Floor 2 west", notes: "WiFi 6 AP" },
];
const isps = [
  { name: "PrimaryFiber", bandwidth: "1 Gbps", sla: "99.9%", contact: "noc@primaryfiber.net" },
  { name: "BackupLink", bandwidth: "500 Mbps", sla: "99.5%", contact: "support@backuplink.io" },
];
const cctv = [
  { id: "CAM-01", location: "Lobby", model: "Hikvision DS-2CD2143", status: "Online" },
  { id: "CAM-12", location: "Lobby", model: "Hikvision DS-2CD2143", status: "Offline" },
  { id: "CAM-17", location: "Parking", model: "Dahua IPC-HFW", status: "Online" },
];

function InfraPage() {
  return (
    <div>
      <PageHeader title="Infrastructure" description="Documentation of network devices, IP inventory and providers." />
      <Tabs defaultValue="ip">
        <TabsList>
          <TabsTrigger value="ip">IP inventory</TabsTrigger>
          <TabsTrigger value="isp">Internet providers</TabsTrigger>
          <TabsTrigger value="cctv">CCTV</TabsTrigger>
        </TabsList>
        <TabsContent value="ip">
          <Card><CardHeader><CardTitle>Network devices & IPs</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Device</TableHead><TableHead>IP address</TableHead><TableHead>Location</TableHead><TableHead>Notes</TableHead></TableRow></TableHeader>
                <TableBody>
                  {ips.map((r) => <TableRow key={r.ip}><TableCell className="font-mono">{r.name}</TableCell><TableCell className="font-mono">{r.ip}</TableCell><TableCell>{r.location}</TableCell><TableCell className="text-muted-foreground">{r.notes}</TableCell></TableRow>)}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="isp">
          <Card><CardHeader><CardTitle>Internet service providers</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Provider</TableHead><TableHead>Bandwidth</TableHead><TableHead>SLA</TableHead><TableHead>Contact</TableHead></TableRow></TableHeader>
                <TableBody>
                  {isps.map((r) => <TableRow key={r.name}><TableCell className="font-medium">{r.name}</TableCell><TableCell>{r.bandwidth}</TableCell><TableCell>{r.sla}</TableCell><TableCell className="text-muted-foreground">{r.contact}</TableCell></TableRow>)}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="cctv">
          <Card><CardHeader><CardTitle>CCTV inventory</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Location</TableHead><TableHead>Model</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {cctv.map((r) => <TableRow key={r.id}><TableCell className="font-mono">{r.id}</TableCell><TableCell>{r.location}</TableCell><TableCell>{r.model}</TableCell><TableCell className={r.status === "Online" ? "text-success" : "text-destructive"}>{r.status}</TableCell></TableRow>)}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
