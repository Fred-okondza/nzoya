from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
from app.core.database import get_db
from app.core.security import hasher_mot_de_passe, verifier_mot_de_passe, creer_token, decoder_token
from app.core.email import envoyer_email_verification, envoyer_email_reset_password
from app.models.models import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Authentification"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

class EmailRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    nouveau_mot_de_passe: str

# Récupérer l'utilisateur connecté
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    email = decoder_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide"
        )
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilisateur introuvable"
        )
    return user

# Inscription
@router.post("/inscription", response_model=UserResponse, status_code=201)
async def inscription(user: UserCreate, db: Session = Depends(get_db)):
    existant = db.query(User).filter(User.email == user.email).first()
    if existant:
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")

    token_verification = secrets.token_urlsafe(32)

    nouveau = User(
        nom=user.nom,
        email=user.email,
        telephone=user.telephone,
        mot_de_passe=hasher_mot_de_passe(user.mot_de_passe),
        role=user.role,
        token_verification=token_verification
    )
    db.add(nouveau)
    db.commit()
    db.refresh(nouveau)

    try:
        envoyer_email_verification(nouveau.email, nouveau.nom, token_verification)
    except Exception as e:
        print(f"Erreur envoi email: {e}")

    return nouveau

# Vérifier email
@router.get("/verifier-email")
async def verifier_email(token: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.token_verification == token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Token invalide ou expiré")
    user.est_verifie = True
    user.token_verification = None
    db.commit()
    return {"message": "Email vérifié avec succès ! Vous pouvez maintenant vous connecter."}

# Connexion JSON (pour le frontend)
@router.post("/connexion", response_model=Token)
async def connexion(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verifier_mot_de_passe(credentials.mot_de_passe, user.mot_de_passe):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    token = creer_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

# Connexion OAuth2 (pour Swagger)
@router.post("/token", response_model=Token)
async def token(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verifier_mot_de_passe(form.password, user.mot_de_passe):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    token = creer_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

# Profil
@router.get("/profil", response_model=UserResponse)
async def profil(current_user: User = Depends(get_current_user)):
    return current_user

# Mot de passe oublié
@router.post("/mot-de-passe-oublie")
async def mot_de_passe_oublie(data: EmailRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        return {"message": "Si cet email existe, vous recevrez un lien de réinitialisation."}

    token_reset = secrets.token_urlsafe(32)
    user.token_reset_password = token_reset
    user.token_reset_expire = datetime.utcnow() + timedelta(hours=1)
    db.commit()

    try:
        envoyer_email_reset_password(user.email, user.nom, token_reset)
    except Exception as e:
        print(f"Erreur envoi email: {e}")

    return {"message": "Si cet email existe, vous recevrez un lien de réinitialisation."}

# Réinitialiser mot de passe
@router.post("/reinitialiser-mot-de-passe")
async def reinitialiser_mot_de_passe(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.token_reset_password == data.token
    ).first()

    if not user:
        raise HTTPException(status_code=400, detail="Token invalide ou expiré")

    if user.token_reset_expire < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Token expiré")

    user.mot_de_passe = hasher_mot_de_passe(data.nouveau_mot_de_passe)
    user.token_reset_password = None
    user.token_reset_expire = None
    db.commit()

    return {"message": "Mot de passe réinitialisé avec succès !"}