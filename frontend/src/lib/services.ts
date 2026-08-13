// Service layer — flips automatically between mock data and your FastAPI backend.
// Set VITE_API_URL in `.env` to point at FastAPI; leave empty to use mocks.
import { api, USE_MOCK, AUTH_MODE, apiError } from "./api";
import { store } from "./store";
import { ROLES } from "./mock";
import {
  fromAsset, fromAuditLog, fromDepartment, fromNotification,
  fromProject, fromRole, fromTask, fromTicket, fromUser, mapList, toTask, toTicket, toUser,
} from "./adapters";
import type {
  Asset, AuditLog, Department, KnowledgeArticle, Notification, PermissionLevel,
  Project, RoleMatrix, RoleRecord, Task, Ticket, User,
} from "./types";

const wait = <T,>(data: T, ms = 200) => new Promise<T>((r) => setTimeout(() => r(data), ms));

export { USE_MOCK };

let currentActor = { id: "u1", name: "Aisha Khan" };
const setActor = (u: User) => { currentActor = { id: u.id, name: u.fullName }; };
const audit = (action: string, module: string, details = "") =>
  store.addAuditLog(currentActor.name, action, module, details);

export const authService = {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    if (USE_MOCK) {
      await wait(null, 300);
      if (!email || !password) throw new Error("Invalid credentials");
      const match = store.users.list().find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? store.users.list()[0];
      setActor(match);
      audit("Login", "Auth", `${match.fullName} signed in`);
      return { token: "demo.jwt.token", user: match };
    }
    try {
      let token: string;
      if (AUTH_MODE === "form") {
        const body = new URLSearchParams({ username: email, password });
        const { data } = await api.post("/auth/login", body, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        token = data.access_token ?? data.token;
      } else {
        const { data } = await api.post("/auth/login", { email, password });
        token = data.access_token ?? data.token;
      }
      if (!token) throw new Error("No access token returned by /auth/login");
      const { data: me } = await api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
      return { token, user: fromUser(me) };
    } catch (e) {
      throw new Error(apiError(e, "Sign in failed"));
    }
  },
  async me(): Promise<User> {
    if (USE_MOCK) return wait(store.users.list().find((u) => u.id === currentActor.id) ?? store.users.list()[0]);
    const { data } = await api.get("/auth/me");
    return fromUser(data);
  },
  async logout(): Promise<void> {
    if (USE_MOCK) { audit("Logout", "Auth", `${currentActor.name} signed out`); return; }
    try { await api.post("/auth/logout"); } catch { /* ignore */ }
  },
};

export const usersService = {
  list: async (): Promise<User[]> => {
    if (USE_MOCK) return wait(store.users.list());
    const { data } = await api.get("/users");
    return mapList(fromUser)(data);
  },
  get: async (id: string): Promise<User | null> => {
    if (USE_MOCK) return wait(store.users.get(id));
    const { data } = await api.get(`/users/${id}`);
    return data ? fromUser(data) : null;
  },
  create: async (u: Partial<User> & { password?: string }): Promise<User> => {
    if (USE_MOCK) {
      const created = store.users.create(u);
      audit("Create User", "Users", `Added ${created.fullName} (${created.role})`);
      return wait(created);
    }
    const { data } = await api.post("/users", { ...toUser(u), password: u.password });
    return fromUser(data);
  },
  update: async (id: string, u: Partial<User>): Promise<User> => {
    if (USE_MOCK) {
      const updated = store.users.update(id, u);
      if (!updated) throw new Error("User not found");
      audit("Update User", "Users", `Updated ${updated.fullName}`);
      return wait(updated);
    }
    const { data } = await api.put(`/users/${id}`, toUser(u));
    return fromUser(data);
  },
  remove: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      const existing = store.users.get(id);
      store.users.remove(id);
      audit("Delete User", "Users", existing ? `Removed ${existing.fullName}` : id);
      return wait(undefined);
    }
    await api.delete(`/users/${id}`);
  },
};

export const departmentsService = {
  list: async (): Promise<Department[]> => {
    if (USE_MOCK) return wait(store.departments.list());
    const { data } = await api.get("/departments");
    return mapList(fromDepartment)(data);
  },
  create: async (d: Partial<Department>): Promise<Department> => {
    if (USE_MOCK) {
      const created = store.departments.create(d);
      audit("Create Department", "Departments", created.name);
      return wait(created);
    }
    const { data } = await api.post("/departments", d);
    return fromDepartment(data);
  },
  update: async (id: string, d: Partial<Department>): Promise<Department> => {
    if (USE_MOCK) {
      const updated = store.departments.update(id, d);
      if (!updated) throw new Error("Department not found");
      audit("Update Department", "Departments", updated.name);
      return wait(updated);
    }
    const { data } = await api.put(`/departments/${id}`, d);
    return fromDepartment(data);
  },
  remove: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      const existing = store.departments.list().find((d) => d.id === id);
      store.departments.remove(id);
      audit("Delete Department", "Departments", existing?.name ?? id);
      return wait(undefined);
    }
    await api.delete(`/departments/${id}`);
  },
};

export const tasksService = {
  list: async (): Promise<Task[]> => {
    if (USE_MOCK) return wait(store.tasks.list());
    const { data } = await api.get("/tasks");
    return mapList(fromTask)(data);
  },
  get: async (id: string): Promise<Task | null> => {
    if (USE_MOCK) return wait(store.tasks.get(id));
    const { data } = await api.get(`/tasks/${id}`);
    return data ? fromTask(data) : null;
  },
  create: async (t: Partial<Task>): Promise<Task> => {
    if (USE_MOCK) {
      const created = store.tasks.create({ ...t, assignedBy: t.assignedBy || currentActor.id });
      audit("Create Task", "Tasks", `${created.id} — ${created.title}`);
      store.notifications.push({ type: "Task Assigned", title: `New task: ${created.title}`, body: `Assigned by ${currentActor.name}` });
      return wait(created);
    }
    const { data } = await api.post("/tasks", toTask(t));
    return fromTask(data);
  },
  update: async (id: string, t: Partial<Task>): Promise<Task> => {
    if (USE_MOCK) {
      const updated = store.tasks.update(id, t);
      if (!updated) throw new Error("Task not found");
      audit("Update Task", "Tasks", `${updated.id} — ${updated.title}`);
      return wait(updated);
    }
    const { data } = await api.put(`/tasks/${id}`, toTask(t));
    return fromTask(data);
  },
  remove: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      const existing = store.tasks.get(id);
      store.tasks.remove(id);
      audit("Delete Task", "Tasks", existing ? `${existing.id} — ${existing.title}` : id);
      return wait(undefined);
    }
    await api.delete(`/tasks/${id}`);
  },
};

export const ticketsService = {
  list: async (): Promise<Ticket[]> => {
    if (USE_MOCK) return wait(store.tickets.list());
    const { data } = await api.get("/tickets");
    return mapList(fromTicket)(data);
  },
  get: async (id: string): Promise<Ticket | null> => {
    if (USE_MOCK) return wait(store.tickets.get(id));
    const { data } = await api.get(`/tickets/${id}`);
    return data ? fromTicket(data) : null;
  },
  create: async (t: Partial<Ticket>): Promise<Ticket> => {
    if (USE_MOCK) {
      const created = store.tickets.create(t);
      audit("Create Ticket", "Tickets", `${created.id} — ${created.subject}`);
      return wait(created);
    }
    const { data } = await api.post("/tickets", toTicket(t));
    return fromTicket(data);
  },
  update: async (id: string, t: Partial<Ticket>): Promise<Ticket> => {
    if (USE_MOCK) {
      const updated = store.tickets.update(id, t);
      if (!updated) throw new Error("Ticket not found");
      audit("Update Ticket", "Tickets", `${updated.id} — ${updated.subject}`);
      return wait(updated);
    }
    const { data } = await api.put(`/tickets/${id}`, toTicket(t));
    return fromTicket(data);
  },
  remove: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      const existing = store.tickets.get(id);
      store.tickets.remove(id);
      audit("Delete Ticket", "Tickets", existing ? `${existing.id} — ${existing.subject}` : id);
      return wait(undefined);
    }
    await api.delete(`/tickets/${id}`);
  },
};

export const projectsService = {
  list: async (): Promise<Project[]> => {
    if (USE_MOCK) return wait(store.projects.list());
    const { data } = await api.get("/projects");
    return mapList(fromProject)(data);
  },
  create: async (p: Partial<Project>): Promise<Project> => {
    if (USE_MOCK) {
      const created = store.projects.create(p);
      audit("Create Project", "Projects", `${created.id} — ${created.name}`);
      return wait(created);
    }
    const { data } = await api.post("/projects", p);
    return fromProject(data);
  },
  update: async (id: string, p: Partial<Project>): Promise<Project> => {
    if (USE_MOCK) {
      const updated = store.projects.update(id, p);
      if (!updated) throw new Error("Project not found");
      audit("Update Project", "Projects", `${updated.id} — ${updated.name}`);
      return wait(updated);
    }
    const { data } = await api.put(`/projects/${id}`, p);
    return fromProject(data);
  },
  remove: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      const existing = store.projects.list().find((p) => p.id === id);
      store.projects.remove(id);
      audit("Delete Project", "Projects", existing ? `${existing.id} — ${existing.name}` : id);
      return wait(undefined);
    }
    await api.delete(`/projects/${id}`);
  },
};

export const assetsService = {
  list: async (): Promise<Asset[]> => {
    if (USE_MOCK) return wait(store.assets.list());
    const { data } = await api.get("/assets");
    return mapList(fromAsset)(data);
  },
  create: async (a: Partial<Asset>): Promise<Asset> => {
    if (USE_MOCK) {
      const created = store.assets.create(a);
      audit("Create Asset", "Assets", `${created.tag} — ${created.model}`);
      return wait(created);
    }
    const { data } = await api.post("/assets", a);
    return fromAsset(data);
  },
  update: async (id: string, a: Partial<Asset>): Promise<Asset> => {
    if (USE_MOCK) {
      const updated = store.assets.update(id, a);
      if (!updated) throw new Error("Asset not found");
      audit("Update Asset", "Assets", `${updated.tag} — ${updated.model}`);
      return wait(updated);
    }
    const { data } = await api.put(`/assets/${id}`, a);
    return fromAsset(data);
  },
  remove: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      const existing = store.assets.list().find((a) => a.id === id);
      store.assets.remove(id);
      audit("Delete Asset", "Assets", existing ? `${existing.tag}` : id);
      return wait(undefined);
    }
    await api.delete(`/assets/${id}`);
  },
};

export const notificationsService = {
  list: async (): Promise<Notification[]> => {
    if (USE_MOCK) return wait(store.notifications.list());
    const { data } = await api.get("/notifications");
    return mapList(fromNotification)(data);
  },
  markRead: async (id: string): Promise<Notification[]> => {
    if (USE_MOCK) return wait(store.notifications.markRead(id));
    await api.post(`/notifications/${id}/read`);
    const { data } = await api.get("/notifications");
    return mapList(fromNotification)(data);
  },
  markAllRead: async (): Promise<Notification[]> => {
    if (USE_MOCK) return wait(store.notifications.markAllRead());
    await api.post(`/notifications/read-all`);
    const { data } = await api.get("/notifications");
    return mapList(fromNotification)(data);
  },
};

export const auditLogsService = {
  list: async (): Promise<AuditLog[]> => {
    if (USE_MOCK) return wait(store.auditLogs.list());
    const { data } = await api.get("/audit-logs");
    return mapList(fromAuditLog)(data);
  },
};

export const knowledgeBaseService = {
  list: async (): Promise<KnowledgeArticle[]> => {
    if (USE_MOCK) return wait(store.knowledgeArticles.list());
    const { data } = await api.get("/knowledge-base");
    return data as KnowledgeArticle[];
  },
  create: async (k: Partial<KnowledgeArticle>): Promise<KnowledgeArticle> => {
    if (USE_MOCK) {
      const created = store.knowledgeArticles.create({ ...k, author: k.author || currentActor.name });
      audit("Create Article", "Knowledge Base", created.title);
      return wait(created);
    }
    const { data } = await api.post("/knowledge-base", k);
    return data as KnowledgeArticle;
  },
  remove: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      store.knowledgeArticles.remove(id);
      audit("Delete Article", "Knowledge Base", id);
      return wait(undefined);
    }
    await api.delete(`/knowledge-base/${id}`);
  },
};

export const rolesService = {
  list: async (): Promise<RoleRecord[]> => {
    // ROLES (from mock.ts) is a plain string list used elsewhere for the
    // permission matrix; give it stable synthetic ids here so the Users
    // form works the same way in mock mode as it does against the real
    // /roles endpoint.
    if (USE_MOCK) return wait(ROLES.map((name, i) => ({ id: String(i + 1), name })));
    const { data } = await api.get("/roles");
    return mapList(fromRole)(data);
  },
  matrix: async (): Promise<RoleMatrix> => {
    if (USE_MOCK) return wait(store.roleMatrix.get());
    const { data } = await api.get("/roles/matrix");
    return data as RoleMatrix;
  },
  setPermission: async (role: string, moduleName: string, level: PermissionLevel): Promise<RoleMatrix> => {
    if (USE_MOCK) {
      const updated = store.roleMatrix.setCell(role, moduleName, level);
      audit("Update Permission", "Roles", `${role} · ${moduleName} → ${level}`);
      return wait(updated);
    }
    const { data } = await api.put("/roles/matrix", { role, module: moduleName, level });
    return data as RoleMatrix;
  },
};