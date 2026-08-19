from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from app.utils.audit import create_log

from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.task import Task
from app.models.user import User
from app.core.security import get_current_user, get_current_role_name, require_manager, MANAGER_ROLES

from app.schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskResponse
)

from app.utils.audit import create_log
from app.utils.notifications import create_notification

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)


@router.get("", response_model=list[TaskResponse])
def get_tasks(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    role_name: str | None = Depends(get_current_role_name),
):
    query = db.query(Task)

    if role_name not in MANAGER_ROLES:
        query = query.filter(Task.assigned_to == user.id)

    return query.all()


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    role_name: str | None = Depends(get_current_role_name),
):
    task = db.query(Task).filter(
        Task.id == task_id
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    if role_name not in MANAGER_ROLES and task.assigned_to != user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to view this task"
        )

    return task


@router.post("", response_model=TaskResponse)
def create_task(
    data: TaskCreate,
    db: Session = Depends(get_db),
    manager: User = Depends(require_manager),
):
    task = Task(
        title=data.title,
        description=data.description,
        priority=data.priority,
        status=data.status,
        assigned_by=data.assigned_by or manager.id,
        assigned_to=data.assigned_to,
        deadline=data.deadline
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    create_log(
        db=db,
        action="CREATE",
        module="TASKS",
        description=f"Task '{task.title}' created",
        user_id=task.assigned_by
    )    
    create_notification(
        db=db,
        user_id=task.assigned_to,
        type="Task Assigned",
        title=f"New task: {task.title}",
        body=f"Assigned by {manager.full_name}"
    )

    return task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    data: TaskUpdate,
    db: Session = Depends(get_db),
    manager: User = Depends(require_manager),
):
    task = db.query(Task).filter(
        Task.id == task_id
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )


    previous_assignee = task.assigned_to

    task.title = data.title
    task.description = data.description
    task.priority = data.priority
    task.status = data.status
    task.assigned_by = data.assigned_by
    task.assigned_to = data.assigned_to
    task.deadline = data.deadline

    db.commit()
    db.refresh(task)

    if data.assigned_to and data.assigned_to != previous_assignee:
        create_notification(
            db=db,
            user_id=data.assigned_to,
            type="Task Assigned",
            title=f"Task reassigned to you: {task.title}",
            body=f"Reassigned by {manager.full_name}"
        )

    return task


@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    manager: User = Depends(require_manager),
):
    task = db.query(Task).filter(
        Task.id == task_id
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    db.delete(task)
    db.commit()

    return {
        "message": "Task deleted successfully"
    }