from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import User, Annonce, UserRole
from app.schemas.user import UserResponse
from app.schemas.annonce import AnnonceResponse

router = APIRouter(prefix="/admin", tags=["Administration"])

# Vérifier que l'utilisateur est admin
def verifier_admin(current_user: User = Depends(get_current_user)):
    if current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    return current_user

# Statistiques globales
@router.get("/stats")
async def stats(
    db: Session = Depends(get_db),
    admin: User = Depends(verifier_admin)
):
    return {
        "total_utilisateurs": db.query(User).count(),
        "total_proprietaires": db.query(User).filter(User.role == UserRole.proprietaire).count(),
        "total_locataires": db.query(User).filter(User.role == UserRole.locataire).count(),
        "total_annonces": db.query(Annonce).count(),
        "annonces_actives": db.query(Annonce).filter(Annonce.est_disponible == True).count(),
        "annonces_non_verifiees": db.query(Annonce).filter(Annonce.est_verifie == False).count(),
        "utilisateurs_suspendus": db.query(User).filter(User.est_suspendu == True).count(),
    }

# Lister tous les utilisateurs
@router.get("/utilisateurs", response_model=List[UserResponse])
async def lister_utilisateurs(
    db: Session = Depends(get_db),
    admin: User = Depends(verifier_admin)
):
    return db.query(User).order_by(User.created_at.desc()).all()

# Suspendre / réactiver un utilisateur
@router.put("/utilisateurs/{user_id}/suspendre")
async def suspendre_utilisateur(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(verifier_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    if user.role.value == "admin":
        raise HTTPException(status_code=403, detail="Impossible de suspendre un admin")
    user.est_suspendu = not user.est_suspendu
    db.commit()
    return {
        "message": f"Utilisateur {'suspendu' if user.est_suspendu else 'réactivé'} avec succès",
        "est_suspendu": user.est_suspendu
    }

# Lister toutes les annonces
@router.get("/annonces", response_model=List[AnnonceResponse])
async def lister_annonces(
    db: Session = Depends(get_db),
    admin: User = Depends(verifier_admin)
):
    return db.query(Annonce).order_by(Annonce.created_at.desc()).all()

# Valider une annonce
@router.put("/annonces/{annonce_id}/valider")
async def valider_annonce(
    annonce_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(verifier_admin)
):
    annonce = db.query(Annonce).filter(Annonce.id == annonce_id).first()
    if not annonce:
        raise HTTPException(status_code=404, detail="Annonce introuvable")
    annonce.est_verifie = True
    db.commit()
    return {"message": "Annonce validée avec succès"}

# Rejeter/supprimer une annonce
@router.delete("/annonces/{annonce_id}")
async def supprimer_annonce(
    annonce_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(verifier_admin)
):
    annonce = db.query(Annonce).filter(Annonce.id == annonce_id).first()
    if not annonce:
        raise HTTPException(status_code=404, detail="Annonce introuvable")
    db.delete(annonce)
    db.commit()
    return {"message": "Annonce supprimée avec succès"}