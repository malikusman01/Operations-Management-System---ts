from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.ticket import Ticket

from app.schemas.ticket import (
    TicketCreate,
    TicketUpdate,
    TicketResponse
)

router = APIRouter(
    prefix="/tickets",
    tags=["Tickets"]
)


@router.get("", response_model=list[TicketResponse])
def get_tickets(
    db: Session = Depends(get_db)
):
    return db.query(Ticket).all()


@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db)
):
    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id
    ).first()

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    return ticket


@router.post("", response_model=TicketResponse)
def create_ticket(
    data: TicketCreate,
    db: Session = Depends(get_db)
):
    ticket = Ticket(
        title=data.title,
        description=data.description,
        status=data.status,
        priority=data.priority,
        created_by=data.created_by,
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
    db: Session = Depends(get_db)
):
    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id
    ).first()

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    ticket.title = data.title
    ticket.description = data.description
    ticket.status = data.status
    ticket.priority = data.priority
    ticket.created_by = data.created_by
    ticket.assigned_to = data.assigned_to

    db.commit()
    db.refresh(ticket)

    return ticket


@router.delete("/{ticket_id}")
def delete_ticket(
    ticket_id: int,
    db: Session = Depends(get_db)
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