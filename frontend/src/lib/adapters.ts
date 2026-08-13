// Translate FastAPI snake_case payloads <-> frontend camelCase types.
// Adjust field names here if your backend schemas differ.
import type { Asset, AuditLog, Department, Notification, Project, RoleRecord, Task, Ticket, User } from "./types";

type AnyRec = Record<string, unknown>;
const s = (v: unknown) => (v == null ? "" : String(v));

export const fromUser = (r: AnyRec): User => ({
  id: s(r.id ?? r.user_id),
  fullName: s(r.full_name ?? r.fullName ?? r.name),
  email: s(r.email),
  // Backend only returns role_id/department_id (foreign keys), not name
  // strings. The Users page resolves the display name itself by cross-
  // referencing the fetched /roles and /departments lists against these
  // raw ids. Fall back to "IT Technician" only when there's truly no id
  // at all (e.g. mock data / a user with no role assigned yet).
  role: (r.role ?? r.role_name ?? "IT Technician") as User["role"],
  department: s(r.department ?? r.department_name ?? ""),
  status: (r.is_active === false || r.status === "Inactive" ? "Inactive" : "Active") as User["status"],
  roleId: r.role_id != null ? s(r.role_id) : undefined,
  departmentId: r.department_id != null ? s(r.department_id) : undefined,
});

export const toUser = (u: Partial<User> & { password?: string }): AnyRec => {
  const body: AnyRec = {
    full_name: u.fullName,
    email: u.email,
    is_active: u.status ? u.status === "Active" : undefined,
  };
  if (u.password) body.password = u.password;
  if (u.roleId !== undefined) body.role_id = u.roleId === "" ? null : Number(u.roleId);
  if (u.departmentId !== undefined) body.department_id = u.departmentId === "" ? null : Number(u.departmentId);
  return body;
};

export const fromRole = (r: AnyRec): RoleRecord => ({
  id: s(r.id),
  name: s(r.name),
});

export const fromDepartment = (r: AnyRec): Department => ({
  id: s(r.id),
  name: s(r.name),
  description: s(r.description ?? ""),
});

export const fromTask = (r: AnyRec): Task => ({
  id: s(r.id ?? r.task_id),
  title: s(r.title),
  description: s(r.description ?? ""),
  priority: (r.priority ?? "Medium") as Task["priority"],
  assignedBy: s(r.assigned_by ?? r.assignedBy ?? ""),
  assignedTo: s(r.assigned_to ?? r.assignedTo ?? ""),
  assignmentDate: s(r.assignment_date ?? r.assignmentDate ?? r.created_at ?? ""),
  deadline: s(r.deadline ?? r.due_date ?? ""),
  status: (r.status ?? "Assigned") as Task["status"],
  remarks: r.remarks ? s(r.remarks) : undefined,
});

export const toTask = (t: Partial<Task>): AnyRec => ({
  title: t.title,
  description: t.description,
  priority: t.priority,
  assigned_by: t.assignedBy,
  assigned_to: t.assignedTo,
  assignment_date: t.assignmentDate,
  deadline: t.deadline,
  status: t.status,
  remarks: t.remarks,
});

export const fromTicket = (r: AnyRec): Ticket => ({
  id: s(r.id),
  category: (r.category ?? "Hardware") as Ticket["category"],
  subject: s(r.subject ?? r.title),
  requester: s(r.requester ?? r.created_by ?? ""),
  assignedTo: s(r.assigned_to ?? r.assignedTo ?? ""),
  status: (r.status ?? "Open") as Ticket["status"],
  createdAt: s(r.created_at ?? r.createdAt ?? ""),
});

export const toTicket = (t: Partial<Ticket>): AnyRec => ({
  title: t.subject,
  description: (t as AnyRec).description ?? "",
  category: t.category,
  priority: (t as AnyRec).priority ?? "Medium",
  status: t.status,
  created_by: t.requester,
  assigned_to: t.assignedTo,
});

export const fromProject = (r: AnyRec): Project => ({
  id: s(r.id),
  name: s(r.name),
  description: s(r.description ?? ""),
  owner: s(r.owner ?? r.owner_id ?? ""),
  startDate: s(r.start_date ?? r.startDate ?? ""),
  endDate: s(r.end_date ?? r.endDate ?? ""),
  status: (r.status ?? "Active") as Project["status"],
  progress: Number(r.progress ?? 0),
});

export const fromAsset = (r: AnyRec): Asset => ({
  id: s(r.id),
  tag: s(r.tag ?? r.asset_tag),
  type: (r.type ?? "Laptop") as Asset["type"],
  brand: s(r.brand ?? ""),
  model: s(r.model ?? ""),
  serial: s(r.serial ?? r.serial_number ?? ""),
  location: s(r.location ?? ""),
  assignedUser: r.assigned_user ? s(r.assigned_user) : (r.assignedUser ? s(r.assignedUser) : null),
  purchaseDate: s(r.purchase_date ?? r.purchaseDate ?? ""),
  warrantyExpiry: s(r.warranty_expiry ?? r.warrantyExpiry ?? ""),
  status: (r.status ?? "In Use") as Asset["status"],
});

export const fromNotification = (r: AnyRec): Notification => ({
  id: s(r.id),
  type: (r.type ?? "Task Assigned") as Notification["type"],
  title: s(r.title),
  body: s(r.body ?? r.message ?? ""),
  createdAt: s(r.created_at ?? r.createdAt ?? ""),
  read: Boolean(r.read ?? r.is_read ?? false),
});

export const fromAuditLog = (r: AnyRec): AuditLog => ({
  id: s(r.id),
  user: s(r.user ?? r.user_name ?? ""),
  action: s(r.action ?? ""),
  module: s(r.module ?? ""),
  timestamp: s(r.timestamp ?? r.created_at ?? ""),
  details: s(r.details ?? ""),
});

export const mapList = <T,>(fn: (r: AnyRec) => T) => (rows: unknown): T[] =>
  Array.isArray(rows) ? rows.map((r) => fn(r as AnyRec)) : [];