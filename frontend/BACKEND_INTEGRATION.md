# Connecting ITOMS Frontend to your FastAPI Backend

The frontend ships with a mock data layer so it runs without a backend.
To switch to your real FastAPI server, set environment variables — no code edits required.

## 1. Configure environment

Copy `.env.example` → `.env`:

```bash
VITE_API_URL=http://localhost:8000       # your FastAPI base URL
VITE_AUTH_MODE=form                      # "form" (OAuth2PasswordRequestForm) or "json"
```

Restart the dev server after changing `.env`.

When `VITE_API_URL` is **empty**, the app uses mock data. When set, every request
goes to your FastAPI server via `src/lib/api.ts` (Axios) with a JWT in the
`Authorization: Bearer <token>` header.

## 2. Expected FastAPI endpoints

Your `backend/app/routers/` already has `auth.py`, `tasks.py`, `users.py`.
Implement the rest as you grow. The frontend calls:

| Method | Path                  | Used by             |
|--------|-----------------------|---------------------|
| POST   | `/auth/login`         | Login page          |
| GET    | `/auth/me`            | Session restore     |
| POST   | `/auth/logout`        | Logout (optional)   |
| GET/POST/PUT/DELETE | `/users[/{id}]`        | Users module |
| GET    | `/departments`        | Departments module  |
| GET/POST/PUT/DELETE | `/tasks[/{id}]`        | Tasks module |
| GET    | `/tickets`            | Tickets module      |
| GET    | `/projects`           | Projects module     |
| GET    | `/assets`             | Assets module       |
| GET    | `/notifications`      | Notifications       |
| GET    | `/audit-logs`         | Audit Logs          |

### `/auth/login` response shape

```json
{ "access_token": "<jwt>", "token_type": "bearer" }
```

With `VITE_AUTH_MODE=form` the frontend posts `application/x-www-form-urlencoded`
with `username` + `password` — matches FastAPI's `OAuth2PasswordRequestForm`.

### `/auth/me` response shape

```json
{
  "id": "u1",
  "full_name": "Aisha Khan",
  "email": "aisha@itoms.io",
  "role": "Manager IT",
  "department": "IT",
  "is_active": true
}
```

## 3. CORS

In `backend/app/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 4. Field-name mapping

FastAPI typically returns `snake_case`; the frontend uses `camelCase`.
All translation happens in **`src/lib/adapters.ts`** — one place to edit
if your Pydantic schemas use different field names.

For example, if your `Task` model uses `due_date` instead of `deadline`,
the adapter already handles both. Add new aliases there as needed.

## 5. Where to add new endpoints

1. Add the TypeScript type in `src/lib/types.ts`.
2. Add an adapter `fromX` / `toX` in `src/lib/adapters.ts`.
3. Add a service in `src/lib/services.ts` following the existing pattern.
4. Call it from a route with TanStack Query (`useQuery` / `useMutation`).

That's it — UI components stay unchanged.
