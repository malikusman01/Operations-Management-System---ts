from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.database import get_db
from app.models.ticket import Ticket
from app.models.user import User
from app.core.security import get_current_user, get_current_role_name, require_manager, MANAGER_ROLES

from app.schemas.ticket import (
    TicketCreate,
    TicketUpdate,
    TicketResponse
)

from app.core.security import get_current_user, get_current_role_name, require_manager, MANAGER_ROLES
from app.utils.notifications import create_notification

router = APIRouter(
    prefix="/tickets",
    tags=["Tickets"]
)


@router.get("", response_model=list[TicketResponse])
def get_tickets(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    role_name: str | None = Depends(get_current_role_name),
):
    query = db.query(Ticket)

    if role_name not in MANAGER_ROLES:
        query = query.filter(
            or_(Ticket.created_by == user.id, Ticket.assigned_to == user.id)
        )

    return query.all()


@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    role_name: str | None = Depends(get_current_role_name),
):
    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id
    ).first()

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    is_owner = ticket.created_by == user.id or ticket.assigned_to == user.id
    if role_name not in MANAGER_ROLES and not is_owner:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to view this ticket"
        )

    return ticket


@router.post("", response_model=TicketResponse)
def create_ticket(
    data: TicketCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    ticket = Ticket(
        title=data.title,
        description=data.description,
        status=data.status,
        priority=data.priority,
        created_by=user.id,
        assigned_to=data.assigned_to
    )

    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return ticket


@router.put("/{ticket_id}", response_model=TicketResponse)
def update_ticket(
    ticket_id: int,
    data: TicketUpdate,
    db: Session = Depends(get_db),
    manager: User = Depends(require_manager),
):
    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id
    ).first()

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    previous_assignee = ticket.assigned_to

    ticket.title = data.title
    ticket.description = data.description
    ticket.status = data.status
    ticket.priority = data.priority
    ticket.created_by = data.created_by
    ticket.assigned_to = data.assigned_to

    db.commit()
    db.refresh(ticket)

    if data.assigned_to and data.assigned_to != previous_assignee:
        create_notification(
            db=db,
            user_id=data.assigned_to,
            type="Ticket Updates",
            title=f"Ticket assigned to you: {ticket.title}",
            body=f"Assigned by {manager.full_name}"
        )

    return ticket


@router.delete("/{ticket_id}")
def delete_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    manager: User = Depends(require_manager),
):
    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id
    ).first()

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    db.delete(ticket)
    db.commit()

    return {
        "message": "Ticket deleted successfully"
    }