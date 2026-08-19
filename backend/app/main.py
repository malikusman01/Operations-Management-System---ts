from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import Base, engine

from app.models.user import User
from app.models.role import Role
from app.models.department import Department
from app.models.task import Task
from app.models.ticket import Ticket
from app.models.project import Project
from app.models.asset import Asset
from app.models.audit_log import AuditLog

from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.tasks import router as tasks_router
from app.routers.projects import router as projects_router
from app.routers.tickets import router as tickets_router
from app.routers.notifications import router as notifications_router
from app.routers.assets import router as assets_router
from app.routers.audit_logs import router as audit_logs_router
from app.routers.departments import router as departments_router
from app.routers.roles import router as roles_router

from app.models.asset import Asset
from app.models.audit_log import AuditLog
from app.models.notification import Notification

app = FastAPI(
    title="ITOMS API",
    version="1.0.0"
)

# NOTE: update this list to match whatever port your frontend dev server
# actually runs on (check the terminal output of `npm run dev`).
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(tasks_router)
app.include_router(projects_router)
app.include_router(tickets_router)
app.include_router(notifications_router)
app.include_router(assets_router)
app.include_router(audit_logs_router)
app.include_router(departments_router)
app.include_router(roles_router)


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {
        "status": "success",
        "message": "ITOMS API Running"
    }