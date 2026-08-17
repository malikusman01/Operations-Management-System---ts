# ITOMS — IT Operations Management System

ITOMS is a role-based web application for running an internal IT department: assigning and tracking work, managing a support ticket queue, keeping an asset inventory, and controlling who on the team can see and do what.

It's built as a standard two-tier application — a React single-page frontend talking to a FastAPI backend over a REST API, with PostgreSQL (via Supabase) as the database.

## Why this exists

Most small-to-mid-size IT teams end up tracking their work across a spreadsheet, a shared inbox, and a sticky note. ITOMS consolidates that into one system with:

- A single source of truth for tasks, tickets, and assets
- Role-based access, so technicians only see what's assigned to them while managers get the full picture
- An audit trail of who changed what
- A permission matrix instead of hardcoded rules, so access can evolve without a code change

## Features

- **Tasks** — create, assign, prioritize, and track internal work items through a status workflow (Assigned → In Progress → Completed, etc.)
- **Tickets** — end users raise support tickets; IT staff triage, assign, and resolve them
- **Assets** — inventory of hardware (laptops, monitors, phones, network gear) with assignee and status tracking
- **Users, Departments & Roles** — manage accounts and organizational structure; a role/module permission matrix controls access
- **Notifications** — in-app alerts for task assignments, deadlines, and ticket updates
- **Audit Logs** — a record of key actions across the system
- **Knowledge Base** — SOPs, runbooks, and technical articles for the IT team
- **Reports** — charts on task/ticket volume, status breakdowns, and team workload, exportable to CSV

### Access model

| Role | Access |
|---|---|
| Manager IT / Assistant Manager IT | Full access to every module |
| Everyone else | Dashboard, their own Tasks (view only), their own Tickets (view + create), Notifications, Settings |

Restrictions are enforced on the backend (not just hidden in the UI), so the API itself rejects requests outside a role's permissions.

## Tech stack

**Frontend**
- React + TypeScript, built with Vite
- TanStack Router (file-based routing) and TanStack Query (data fetching/caching)
- Tailwind CSS + Radix UI primitives
- Recharts for reporting

**Backend**
- FastAPI (Python)
- SQLAlchemy ORM over PostgreSQL (hosted on Supabase)
- JWT-based authentication (OAuth2 password flow)
- Pydantic for request/response validation

## Getting started

### Prerequisites
- Node.js 18+
- Python 3.11+
- A PostgreSQL database (a free Supabase project works out of the box)

### Backend setup

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\Activate.ps1
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in `backend/` with:


DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_KEY=<your-supabase-key>
JWT_SECRET_KEY=<a-long-random-string>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60


Run the API:

bash
uvicorn app.main:app --reload


The API is now live at `http://localhost:8000` (interactive docs at `/docs`). On first run it creates all tables automatically; seed the `roles` and `departments` tables with your organization's values before creating users.

### Frontend setup

bash
cd frontend
npm install


Create a `.env` file in `frontend/` with:


VITE_API_URL=http://localhost:8000
VITE_AUTH_MODE=form


Run the dev server:

```bash
npm run dev
```

The app is now live at `http://localhost:5173` (or the port Vite reports).

> Leave `VITE_API_URL` empty to run the frontend against built-in mock data with no backend at all — useful for UI work or demos.

Project structure


Project_ITOMS/
├── backend/
│   └── app/
│       ├── core/        # config, JWT/auth, RBAC dependencies
│       ├── db/          # database session setup
│       ├── models/      # SQLAlchemy models
│       ├── routers/     # API endpoints, grouped by resource
│       ├── schemas/     # Pydantic request/response models
│       ├── services/    # Supabase client
│       ├── utils/       # audit logging helper
│       └── main.py
└── frontend/
    └── src/
        ├── components/  # shared UI (design-system + app-specific)
        ├── lib/         # API client, services, adapters, types, permissions
        └── routes/      # file-based pages


License

Internal / proprietary — add a license here if you intend to open-source this.
