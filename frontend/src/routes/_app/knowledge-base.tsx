import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/app/page-header";
import { Search, BookOpen, FileText, ShieldCheck, Wrench } from "lucide-react";

export const Route = createFileRoute("/_app/knowledge-base")({
  head: () => ({ meta: [{ title: "Knowledge Base — ITOMS" }] }),
  component: KbPage,
});

const docs = [
  { id: 1, title: "VPN onboarding for new staff", category: "SOP", icon: ShieldCheck, summary: "Step-by-step provisioning of corporate VPN access." },
  { id: 2, title: "Switch firmware upgrade procedure", category: "Technical", icon: Wrench, summary: "Safe upgrade with rollback plan for Cisco CBS350." },
  { id: 3, title: "Laptop imaging baseline", category: "SOP", icon: FileText, summary: "Standard image, drivers, agents and security baseline." },
  { id: 4, title: "Incident response runbook", category: "Runbook", icon: ShieldCheck, summary: "How to triage, contain and document incidents." },
  { id: 5, title: "Printer troubleshooting", category: "Technical", icon: Wrench, summary: "Common issues with HP LaserJet M428 series." },
  { id: 6, title: "Password & MFA policy", category: "Policy", icon: BookOpen, summary: "Corporate password length, rotation and MFA requirements." },
];
const categories = ["All", "SOP", "Technical", "Runbook", "Policy"];

function KbPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const filtered = docs.filter((d) =>
    (cat === "All" || d.category === cat) &&
    (q === "" || d.title.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div>
      <PageHeader title="Knowledge base" description="SOPs, technical guides and runbooks." />
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative md:max-w-md md:flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search articles…" className="pl-8" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Badge key={c} variant={cat === c ? "default" : "outline"} className="cursor-pointer" onClick={() => setCat(c)}>{c}</Badge>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((d) => {
          const Icon = d.icon;
          return (
            <Card key={d.id} className="cursor-pointer transition hover:shadow-md">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
                  <Badge variant="outline">{d.category}</Badge>
                </div>
                <h3 className="font-medium">{d.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d.summary}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
