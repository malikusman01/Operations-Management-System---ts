// Demo data used until FastAPI backend is wired up. Replace by removing this file
// and pointing services at `api`.
import type {
  Task,
  User,
  Ticket,
  Project,
  Asset,
  AuditLog,
  Notification,
  Department,
  KnowledgeArticle,
  RoleMatrix,
} from "./types";

export const mockUsers: User[] = [
  { id: "u1", fullName: "Aisha Khan", email: "aisha@itoms.io", role: "Manager IT", department: "IT", status: "Active" },
  { id: "u2", fullName: "Daniel Owens", email: "daniel@itoms.io", role: "Network Administrator", department: "Network", status: "Active" },
  { id: "u3", fullName: "Maria Lopez", email: "maria@itoms.io", role: "Web Developer", department: "Engineering", status: "Active" },
  { id: "u4", fullName: "Hiroshi Tanaka", email: "hiroshi@itoms.io", role: "IT Technician", department: "Support", status: "Active" },
  { id: "u5", fullName: "Emma Schmidt", email: "emma@itoms.io", role: "System Administrator", department: "IT", status: "Inactive" },
  { id: "u6", fullName: "Yusuf Ali", email: "yusuf@itoms.io", role: "Assistant Manager IT", department: "IT", status: "Active" },
];

export const mockDepartments: Department[] = [
  { id: "d1", name: "IT", description: "Core IT operations" },
  { id: "d2", name: "Network", description: "Network & infrastructure" },
  { id: "d3", name: "Engineering", description: "Software engineering" },
  { id: "d4", name: "Support", description: "Helpdesk & end-user support" },
];

export const mockTasks: Task[] = [
  { id: "T-1042", title: "Renew SSL certificates for prod cluster", description: "Rotate certs across edge nodes before Friday.", priority: "Critical", assignedBy: "u1", assignedTo: "u2", assignmentDate: "2025-06-01", deadline: "2025-06-12", status: "In Progress", remarks: "Cert ordered" },
  { id: "T-1043", title: "Upgrade office switches firmware", description: "Apply latest stable firmware to 14 switches.", priority: "High", assignedBy: "u1", assignedTo: "u2", assignmentDate: "2025-06-03", deadline: "2025-06-15", status: "Assigned" },
  { id: "T-1044", title: "Onboard 3 new developers", description: "Provision laptops, accounts and VPN.", priority: "Medium", assignedBy: "u6", assignedTo: "u4", assignmentDate: "2025-06-04", deadline: "2025-06-11", status: "Pending" },
  { id: "T-1045", title: "Migrate intranet to new server", description: "Cutover during weekend window.", priority: "High", assignedBy: "u1", assignedTo: "u3", assignmentDate: "2025-05-28", deadline: "2025-06-08", status: "Overdue" },
  { id: "T-1046", title: "Backup verification — quarterly", description: "Validate restore from last 4 snapshots.", priority: "Medium", assignedBy: "u1", assignedTo: "u5", assignmentDate: "2025-05-20", deadline: "2025-06-05", status: "Completed" },
  { id: "T-1047", title: "Replace failed PoE switch — Floor 3", description: "RMA processed, install replacement.", priority: "Critical", assignedBy: "u6", assignedTo: "u4", assignmentDate: "2025-06-06", deadline: "2025-06-10", status: "Waiting Approval" },
  { id: "T-1048", title: "Document new VPN onboarding flow", description: "Add to KB.", priority: "Low", assignedBy: "u1", assignedTo: "u3", assignmentDate: "2025-06-02", deadline: "2025-06-20", status: "In Progress" },
  { id: "T-1049", title: "Audit dormant AD accounts", description: "Disable accounts inactive >90d.", priority: "Medium", assignedBy: "u1", assignedTo: "u5", assignmentDate: "2025-06-01", deadline: "2025-06-14", status: "Cancelled" },
];

export const mockTickets: Ticket[] = [
  { id: "TK-2201", category: "Hardware", subject: "Laptop won't power on", requester: "u3", assignedTo: "u4", status: "In Progress", createdAt: "2025-06-07" },
  { id: "TK-2202", category: "Network", subject: "VPN drops every 10 minutes", requester: "u6", assignedTo: "u2", status: "Open", createdAt: "2025-06-08" },
  { id: "TK-2203", category: "Printer", subject: "Floor 2 printer offline", requester: "u4", assignedTo: "u4", status: "Resolved", createdAt: "2025-06-06" },
  { id: "TK-2204", category: "Software", subject: "MS Teams crashes on join", requester: "u5", assignedTo: "u3", status: "Assigned", createdAt: "2025-06-08" },
  { id: "TK-2205", category: "CCTV", subject: "Camera 12 lobby offline", requester: "u1", assignedTo: "u2", status: "Open", createdAt: "2025-06-09" },
  { id: "TK-2206", category: "Internet", subject: "Slow speeds in west wing", requester: "u3", assignedTo: "u2", status: "Closed", createdAt: "2025-06-02" },
];

export const mockProjects: Project[] = [
  { id: "P-101", name: "Datacenter migration", description: "Move workloads to new DC", owner: "u1", startDate: "2025-04-01", endDate: "2025-09-30", status: "Active", progress: 62 },
  { id: "P-102", name: "Zero-trust rollout", description: "Identity-aware access for all apps", owner: "u2", startDate: "2025-03-15", endDate: "2025-12-15", status: "Active", progress: 34 },
  { id: "P-103", name: "Helpdesk revamp", description: "New ticketing + SLAs", owner: "u6", startDate: "2025-05-01", endDate: "2025-07-15", status: "At Risk", progress: 45 },
  { id: "P-104", name: "Endpoint hardening", description: "EDR + patch baseline", owner: "u5", startDate: "2025-02-01", endDate: "2025-06-01", status: "Completed", progress: 100 },
];

export const mockAssets: Asset[] = [
  { id: "A-001", tag: "LAP-0341", type: "Laptop", brand: "Dell", model: "Latitude 7440", serial: "DL7440-9381", location: "HQ Floor 4", assigneeName: "Maria Lopez", employeeCode: "EMP-1043", status: "In Use" },
  { id: "A-002", tag: "SW-014", type: "PoE Switch", brand: "Cisco", model: "CBS350-24P", serial: "CSC350-141", location: "HQ Floor 3 IDF", assigneeName: "", employeeCode: "", status: "In Use" },
  { id: "A-003", tag: "CAM-012", type: "CCTV Camera", brand: "Hikvision", model: "DS-2CD2143", serial: "HKV-2143-12", location: "Lobby", assigneeName: "", employeeCode: "", status: "Faulty" },
  { id: "A-004", tag: "RTR-002", type: "Router", brand: "MikroTik", model: "CCR2004", serial: "MK2004-02", location: "Server room", assigneeName: "", employeeCode: "", status: "In Use" },
  { id: "A-005", tag: "PRN-007", type: "Printer", brand: "HP", model: "LaserJet M428", serial: "HPM428-7", location: "Floor 2", assigneeName: "", employeeCode: "", status: "In Use" },
];

export const mockNotifications: Notification[] = [
  { id: "n1", type: "Task Assigned", title: "New task: Renew SSL certificates", body: "Assigned to you by Aisha Khan", createdAt: "2025-06-09T09:21:00Z", read: false },
  { id: "n2", type: "Deadline Reminder", title: "Upgrade office switches due in 3 days", body: "T-1043", createdAt: "2025-06-09T08:00:00Z", read: false },
  { id: "n3", type: "Overdue Task", title: "T-1045 is overdue", body: "Migrate intranet to new server", createdAt: "2025-06-08T18:30:00Z", read: true },
  { id: "n4", type: "Ticket Updates", title: "TK-2202 reassigned to you", body: "VPN drops every 10 minutes", createdAt: "2025-06-08T14:11:00Z", read: true },
];

export const mockAuditLogs: AuditLog[] = Array.from({ length: 24 }).map((_, i) => ({
  id: `L-${1000 + i}`,
  user: mockUsers[i % mockUsers.length].fullName,
  action: ["Login", "Update Task", "Create Ticket", "Delete User", "Assign Asset"][i % 5],
  module: ["Auth", "Tasks", "Tickets", "Users", "Assets"][i % 5],
  timestamp: new Date(Date.now() - i * 3600_000).toISOString(),
  details: "Action recorded by ITOMS",
}));

export const mockKnowledgeArticles: KnowledgeArticle[] = [
  { id: "KB-1", title: "VPN onboarding for new staff", category: "SOP", summary: "Step-by-step provisioning of corporate VPN access.", body: "1. Create AD account.\n2. Assign VPN group policy.\n3. Send client config + QR for MFA enrolment.\n4. Verify connection from a test device.", createdAt: "2025-04-02T09:00:00Z", author: "Aisha Khan" },
  { id: "KB-2", title: "Switch firmware upgrade procedure", category: "Technical", summary: "Safe upgrade with rollback plan for Cisco CBS350.", body: "1. Download signed firmware from Cisco portal.\n2. Take a config backup.\n3. Upgrade during maintenance window.\n4. Verify uplinks and revert to backup image if issues occur.", createdAt: "2025-04-10T11:30:00Z", author: "Daniel Owens" },
  { id: "KB-3", title: "Laptop imaging baseline", category: "SOP", summary: "Standard image, drivers, agents and security baseline.", body: "Base image includes Windows 11 Enterprise, EDR agent, VPN client and standard Office suite. Re-image any device before reassignment.", createdAt: "2025-05-01T14:00:00Z", author: "Hiroshi Tanaka" },
  { id: "KB-4", title: "Incident response runbook", category: "Runbook", summary: "How to triage, contain and document incidents.", body: "1. Confirm and classify severity.\n2. Contain affected systems.\n3. Notify stakeholders per severity matrix.\n4. Document timeline and root cause in the post-incident report.", createdAt: "2025-05-14T08:45:00Z", author: "Aisha Khan" },
  { id: "KB-5", title: "Printer troubleshooting", category: "Technical", summary: "Common issues with HP LaserJet M428 series.", body: "Check toner and paper path first, then reset the network card if the printer drops off Wi-Fi/LAN. Reinstall driver if print jobs queue but never print.", createdAt: "2025-05-20T10:15:00Z", author: "Yusuf Ali" },
  { id: "KB-6", title: "Password & MFA policy", category: "Policy", summary: "Corporate password length, rotation and MFA requirements.", body: "Minimum 12 characters, rotated every 90 days, MFA required for all remote and admin access.", createdAt: "2025-05-28T16:20:00Z", author: "Emma Schmidt" },
];

const ROLE_LIST = ["Manager IT", "Assistant Manager IT", "Network Administrator", "Web Developer", "IT Technician", "System Administrator"];
const MODULE_LIST = ["Dashboard", "Tasks", "Projects", "Users", "Tickets", "Assets", "Infrastructure", "Reports", "Settings", "Audit Logs"];

export const mockRoleMatrix: RoleMatrix = {
  "Manager IT": Object.fromEntries(MODULE_LIST.map((m) => [m, "W"])),
  "Assistant Manager IT": Object.fromEntries(MODULE_LIST.map((m) => [m, m === "Audit Logs" ? "R" : "W"])),
  "Network Administrator": Object.fromEntries(MODULE_LIST.map((m) => [m, ["Tasks", "Tickets", "Infrastructure", "Assets", "Dashboard"].includes(m) ? "W" : "R"])),
  "Web Developer": Object.fromEntries(MODULE_LIST.map((m) => [m, ["Tasks", "Projects", "Dashboard"].includes(m) ? "W" : "R"])),
  "IT Technician": Object.fromEntries(MODULE_LIST.map((m) => [m, ["Tickets", "Tasks", "Assets", "Dashboard"].includes(m) ? "W" : "R"])),
  "System Administrator": Object.fromEntries(MODULE_LIST.map((m) => [m, "W"])),
};

export const ROLES = ROLE_LIST;
export const MODULES = MODULE_LIST;