from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import Notification, User
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/notifications", tags=["Notifications"])

class NotificationResponse(BaseModel):
    id: int
    titre: str
    contenu: str
    lu: bool
    lien: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Lister mes notifications
@router.get("/", response_model=List[NotificationResponse])
async def mes_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Notification).filter(
        Notification.utilisateur_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(20).all()

# Nombre de notifications non lues
@router.get("/non-lues")
async def non_lues(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    count = db.query(Notification).filter(
        Notification.utilisateur_id == current_user.id,
        Notification.lu == False
    ).count()
    return {"count": count}

# Marquer toutes comme lues
@router.put("/lire-tout")
async def lire_tout(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(Notification).filter(
        Notification.utilisateur_id == current_user.id,
        Notification.lu == False
    ).update({"lu": True})
    db.commit()
    return {"message": "Toutes les notifications marquées comme lues"}

# Marquer une notification comme lue
@router.put("/{notification_id}/lire")
async def lire_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.utilisateur_id == current_user.id
    ).first()
    if notification:
        notification.lu = True
        db.commit()
    return {"message": "Notification lue"}