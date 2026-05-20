from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, Annonce
from app.schemas.user import UserResponse
from app.schemas.annonce import AnnonceResponse
from app.core.security import hasher_mot_de_passe, verifier_mot_de_passe
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/profil", tags=["Profil"])

class UpdateProfil(BaseModel):
    nom: Optional[str] = None
    telephone: Optional[str] = None

class UpdateMotDePasse(BaseModel):
    ancien_mot_de_passe: str
    nouveau_mot_de_passe: str

# Modifier le profil
@router.put("/", response_model=UserResponse)
async def modifier_profil(
    data: UpdateProfil,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if data.nom:
        current_user.nom = data.nom
    if data.telephone:
        current_user.telephone = data.telephone
    db.commit()
    db.refresh(current_user)
    return current_user

# Changer le mot de passe
@router.put("/mot-de-passe")
async def changer_mot_de_passe(
    data: UpdateMotDePasse,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verifier_mot_de_passe(data.ancien_mot_de_passe, current_user.mot_de_passe):
        raise HTTPException(status_code=400, detail="Ancien mot de passe incorrect")
    current_user.mot_de_passe = hasher_mot_de_passe(data.nouveau_mot_de_passe)
    db.commit()
    return {"message": "Mot de passe modifié avec succès"}

# Mes annonces (propriétaire)
@router.get("/mes-annonces", response_model=List[AnnonceResponse])
async def mes_annonces(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value != "proprietaire":
        raise HTTPException(status_code=403, detail="Non autorisé")
    return db.query(Annonce).filter(
        Annonce.proprietaire_id == current_user.id
    ).order_by(Annonce.created_at.desc()).all()

# Activer/désactiver une annonce
@router.put("/mes-annonces/{annonce_id}/disponibilite", response_model=AnnonceResponse)
async def toggle_disponibilite(
    annonce_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    annonce = db.query(Annonce).filter(
        Annonce.id == annonce_id,
        Annonce.proprietaire_id == current_user.id
    ).first()
    if not annonce:
        raise HTTPException(status_code=404, detail="Annonce introuvable")
    annonce.est_disponible = not annonce.est_disponible
    db.commit()
    db.refresh(annonce)
    return annonce