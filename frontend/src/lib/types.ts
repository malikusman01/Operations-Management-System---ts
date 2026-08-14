export type Role =
  | "Manager IT"
  | "Assistant Manager IT"
  | "Network Administrator"
  | "Web Developer"
  | "IT Technician"
  | "System Administrator";

export type UserStatus = "Active" | "Inactive";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  department: string;
  status: UserStatus;
  /** Raw foreign keys from the backend, used to select/persist role &
   * department in forms. Display uses `role`/`department` (name strings). */
  roleId?: string;
  departmentId?: string;
}

/** A role row as returned by GET /roles — id + name, distinct from the
 * `Role` display-name union above. */
export interface RoleRecord {
  id: string;
  name: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
}

export type TaskStatus =
  | "Assigned"
  | "In Progress"
  | "Pending"
  | "Waiting Approval"
  | "Completed"
  | "Overdue"
  | "Cancelled";

export type Priority = "Low" | "Medium" | "High" | "Critical";

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  assignedBy: string;
  assignedTo: string;
  assignmentDate: string;
  deadline: string;
  status: TaskStatus;
  remarks?: string;
}

export type TicketCategory =
  | "Hardware"
  | "Software"
  | "Network"
  | "CCTV"
  | "Printer"
  | "Internet"
  | "Application";

export type TicketStatus = "Open" | "Assigned" | "In Progress" | "Resolved" | "Closed";

export interface Ticket {
  id: string;
  category: TicketCategory;
  subject: string;
  requester: string;
  assignedTo: string;
  status: TicketStatus;
  createdAt: string;
}

export type ProjectStatus = "Planned" | "Active" | "At Risk" | "Completed" | "On Hold";

export interface Project {
  id: string;
  name: string;
  description: string;
  owner: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  progress: number;
}

export type AssetType =
  | "Laptop"
  | "Desktop"
  | "Printer"
  | "Router"
  | "Switch"
  | "PoE Switch"
  | "CCTV Camera"
  | "Phone"
  | "Cable"
  | "Monitor";

export interface Asset {
  id: string;
  tag: string;
  type: AssetType;
  brand: string;
  model: string;
  serial: string;
  location: string;
  assigneeName: string;
  employeeCode: string;
  status: "In Use" | "In Storage" | "Faulty" | "Retired";
}

export interface Notification {
  id: string;
  type: "Task Assigned" | "Deadline Reminder" | "Overdue Task" | "Ticket Updates";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  module: string;
  timestamp: string;
  details: string;
}

export type KbCategory = "SOP" | "Technical" | "Runbook" | "Policy";

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: KbCategory;
  summary: string;
  body: string;
  createdAt: string;
  author: string;
}

/** Permission level per module for a given role: Write, Read-only, or none. */
export type PermissionLevel = "W" | "R" | "-";
export type RoleMatrix = Record<string, Record<string, PermissionLevel>>;