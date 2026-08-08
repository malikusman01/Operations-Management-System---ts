from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from app.utils.audit import create_log

from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.task import Task

from app.schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskResponse
)

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)


@router.get("", response_model=list[TaskResponse])
def get_tasks(
    db: Session = Depends(get_db)
):
    return db.query(Task).all()


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(
        Task.id == task_id
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    return task


@router.post("", response_model=TaskResponse)
def create_task(
    data: TaskCreate,
    db: Session = Depends(get_db)
):
    task = Task(
        title=data.title,
        description=data.description,
        priority=data.priority,
        status=data.status,
        assigned_by=data.assigned_by,
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
        user_id=data.assigned_by
    )

    return task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    data: TaskUpdate,
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(
        Task.id == task_id
    ).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    task.title = data.title
    task.description = data.description
    task.priority = data.priority
    task.status = data.status
    task.assigned_by = data.assigned_by
    task.assigned_to = data.assigned_to
    task.deadline = data.deadline

    db.commit()
    db.refresh(task)

    return task


@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db)
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