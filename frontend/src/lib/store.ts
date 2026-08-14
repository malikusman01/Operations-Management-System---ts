// A small persisted "database" used when USE_MOCK is true (no FastAPI backend
// configured). Everything lives in localStorage so create/edit/delete actions
// made while demoing the app actually stick — including across a page refresh.
// This is intentionally simple: it is not meant to replace the real backend,
// just to make the offline/demo experience fully functional end to end.
import {
  mockAssets, mockAuditLogs, mockDepartments, mockKnowledgeArticles, mockNotifications,
  mockProjects, mockRoleMatrix, mockTasks, mockTickets, mockUsers,
} from "./mock";
import type {
  Asset, AuditLog, Department, KnowledgeArticle, Notification, Project,
  RoleMatrix, Task, Ticket, User,
} from "./types";

interface DB {
  users: User[];
  departments: Department[];
  tasks: Task[];
  tickets: Ticket[];
  projects: Project[];
  assets: Asset[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  knowledgeArticles: KnowledgeArticle[];
  roleMatrix: RoleMatrix;
}

const STORAGE_KEY = "itoms_demo_db_v1";

function seed(): DB {
  return {
    users: mockUsers.map((u) => ({ ...u })),
    departments: mockDepartments.map((d) => ({ ...d })),
    tasks: mockTasks.map((t) => ({ ...t })),
    tickets: mockTickets.map((t) => ({ ...t })),
    projects: mockProjects.map((p) => ({ ...p })),
    assets: mockAssets.map((a) => ({ ...a })),
    notifications: mockNotifications.map((n) => ({ ...n })),
    auditLogs: mockAuditLogs.map((l) => ({ ...l })),
    knowledgeArticles: mockKnowledgeArticles.map((k) => ({ ...k })),
    roleMatrix: JSON.parse(JSON.stringify(mockRoleMatrix)),
  };
}

function save(next: DB) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable (private mode, quota, SSR) — demo still works in-memory */
  }
}

function load(): DB {
  if (typeof window === "undefined") return seed();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = seed();
      save(fresh);
      return fresh;
    }
    const parsed = JSON.parse(raw) as Partial<DB>;
    return { ...seed(), ...parsed };
  } catch {
    const fresh = seed();
    save(fresh);
    return fresh;
  }
}

let db: DB = load();

function persist() {
  save(db);
}

const genId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;

export const store = {
  resetDemoData() {
    db = seed();
    persist();
  },

  addAuditLog(user: string, action: string, module: string, details = "") {
    const entry: AuditLog = {
      id: genId("L"), user, action, module, timestamp: new Date().toISOString(), details,
    };
    db.auditLogs = [entry, ...db.auditLogs];
    persist();
    return entry;
  },

  users: {
    list: () => db.users,
    get: (id: string) => db.users.find((u) => u.id === id) ?? null,
    create: (u: Partial<User> & { password?: string }) => {
      const created: User = {
        id: genId("u"),
        fullName: u.fullName ?? "New User",
        email: u.email ?? "",
        role: (u.role as User["role"]) ?? "IT Technician",
        department: u.department ?? "",
        status: u.status ?? "Active",
      };
      db.users = [...db.users, created];
      persist();
      return created;
    },
    update: (id: string, u: Partial<User>): User | null => {
      const idx = db.users.findIndex((x) => x.id === id);
      if (idx === -1) return null;
      const updated: User = { ...db.users[idx], ...u };
      db.users = db.users.map((x, i) => (i === idx ? updated : x));
      persist();
      return updated;
    },
    remove: (id: string) => {
      db.users = db.users.filter((u) => u.id !== id);
      persist();
    },
  },

  departments: {
    list: () => db.departments,
    create: (d: Partial<Department>) => {
      const created: Department = { id: genId("d"), name: d.name ?? "New department", description: d.description ?? "" };
      db.departments = [...db.departments, created];
      persist();
      return created;
    },
    update: (id: string, d: Partial<Department>): Department | null => {
      const idx = db.departments.findIndex((x) => x.id === id);
      if (idx === -1) return null;
      const updated: Department = { ...db.departments[idx], ...d };
      db.departments = db.departments.map((x, i) => (i === idx ? updated : x));
      persist();
      return updated;
    },
    remove: (id: string) => {
      db.departments = db.departments.filter((d) => d.id !== id);
      persist();
    },
  },

  tasks: {
    list: () => db.tasks,
    get: (id: string) => db.tasks.find((t) => t.id === id) ?? null,
    create: (t: Partial<Task>) => {
      const created: Task = {
        id: genId("T"),
        title: t.title ?? "Untitled task",
        description: t.description ?? "",
        priority: t.priority ?? "Medium",
        assignedBy: t.assignedBy ?? "",
        assignedTo: t.assignedTo ?? "",
        assignmentDate: t.assignmentDate ?? new Date().toISOString(),
        deadline: t.deadline ?? new Date().toISOString(),
        status: t.status ?? "Assigned",
        remarks: t.remarks,
      };
      db.tasks = [created, ...db.tasks];
      persist();
      return created;
    },
    update: (id: string, t: Partial<Task>): Task | null => {
      const idx = db.tasks.findIndex((x) => x.id === id);
      if (idx === -1) return null;
      const updated: Task = { ...db.tasks[idx], ...t };
      db.tasks = db.tasks.map((x, i) => (i === idx ? updated : x));
      persist();
      return updated;
    },
    remove: (id: string) => {
      db.tasks = db.tasks.filter((t) => t.id !== id);
      persist();
    },
  },

  tickets: {
    list: () => db.tickets,
    get: (id: string) => db.tickets.find((t) => t.id === id) ?? null,
    create: (t: Partial<Ticket>) => {
      const created: Ticket = {
        id: genId("TK"),
        category: t.category ?? "Hardware",
        subject: t.subject ?? "Untitled ticket",
        requester: t.requester ?? "",
        assignedTo: t.assignedTo ?? "",
        status: t.status ?? "Open",
        createdAt: t.createdAt ?? new Date().toISOString(),
      };
      db.tickets = [created, ...db.tickets];
      persist();
      return created;
    },
    update: (id: string, t: Partial<Ticket>): Ticket | null => {
      const idx = db.tickets.findIndex((x) => x.id === id);
      if (idx === -1) return null;
      const updated: Ticket = { ...db.tickets[idx], ...t };
      db.tickets = db.tickets.map((x, i) => (i === idx ? updated : x));
      persist();
      return updated;
    },
    remove: (id: string) => {
      db.tickets = db.tickets.filter((t) => t.id !== id);
      persist();
    },
  },

  projects: {
    list: () => db.projects,
    create: (p: Partial<Project>) => {
      const created: Project = {
        id: genId("P"),
        name: p.name ?? "Untitled project",
        description: p.description ?? "",
        owner: p.owner ?? "",
        startDate: p.startDate ?? new Date().toISOString(),
        endDate: p.endDate ?? new Date().toISOString(),
        status: p.status ?? "Planned",
        progress: p.progress ?? 0,
      };
      db.projects = [created, ...db.projects];
      persist();
      return created;
    },
    update: (id: string, p: Partial<Project>): Project | null => {
      const idx = db.projects.findIndex((x) => x.id === id);
      if (idx === -1) return null;
      const updated: Project = { ...db.projects[idx], ...p };
      db.projects = db.projects.map((x, i) => (i === idx ? updated : x));
      persist();
      return updated;
    },
    remove: (id: string) => {
      db.projects = db.projects.filter((p) => p.id !== id);
      persist();
    },
  },

  assets: {
    list: () => db.assets,
    create: (a: Partial<Asset>) => {
      const created: Asset = {
        id: genId("A"),
        tag: a.tag ?? `TAG-${Math.floor(Math.random() * 9000 + 1000)}`,
        type: a.type ?? "Laptop",
        brand: a.brand ?? "",
        model: a.model ?? "",
        serial: a.serial ?? "",
        location: a.location ?? "",
        assigneeName: a.assigneeName ?? "",
        employeeCode: a.employeeCode ?? "",
        status: a.status ?? "In Storage",
      };
      db.assets = [created, ...db.assets];
      persist();
      return created;
    },
    update: (id: string, a: Partial<Asset>): Asset | null => {
      const idx = db.assets.findIndex((x) => x.id === id);
      if (idx === -1) return null;
      const updated: Asset = { ...db.assets[idx], ...a };
      db.assets = db.assets.map((x, i) => (i === idx ? updated : x));
      persist();
      return updated;
    },
    remove: (id: string) => {
      db.assets = db.assets.filter((a) => a.id !== id);
      persist();
    },
  },

  notifications: {
    list: () => db.notifications,
    markRead: (id: string) => {
      db.notifications = db.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      persist();
      return db.notifications;
    },
    markAllRead: () => {
      db.notifications = db.notifications.map((n) => ({ ...n, read: true }));
      persist();
      return db.notifications;
    },
    push: (n: Partial<Notification>) => {
      const created: Notification = {
        id: genId("n"),
        type: n.type ?? "Task Assigned",
        title: n.title ?? "",
        body: n.body ?? "",
        createdAt: new Date().toISOString(),
        read: false,
      };
      db.notifications = [created, ...db.notifications];
      persist();
      return created;
    },
  },

  auditLogs: {
    list: () => db.auditLogs,
  },

  knowledgeArticles: {
    list: () => db.knowledgeArticles,
    create: (k: Partial<KnowledgeArticle>) => {
      const created: KnowledgeArticle = {
        id: genId("KB"),
        title: k.title ?? "Untitled article",
        category: k.category ?? "SOP",
        summary: k.summary ?? "",
        body: k.body ?? "",
        createdAt: new Date().toISOString(),
        author: k.author ?? "",
      };
      db.knowledgeArticles = [created, ...db.knowledgeArticles];
      persist();
      return created;
    },
    remove: (id: string) => {
      db.knowledgeArticles = db.knowledgeArticles.filter((k) => k.id !== id);
      persist();
    },
  },

  roleMatrix: {
    get: () => db.roleMatrix,
    setCell: (role: string, moduleName: string, level: "W" | "R" | "-") => {
      db.roleMatrix = { ...db.roleMatrix, [role]: { ...db.roleMatrix[role], [moduleName]: level } };
      persist();
      return db.roleMatrix;
    },
  },
};