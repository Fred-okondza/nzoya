from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hasher_mot_de_passe, verifier_mot_de_passe, creer_token, decoder_token
from app.models.models import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token

router = APIRouter(prefix="/auth", tags=["Authentification"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

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
        raise HTTPException(
            status_code=400,
            detail="Cet email est déjà utilisé"
        )
    nouveau = User(
        nom=user.nom,
        email=user.email,
        telephone=user.telephone,
        mot_de_passe=hasher_mot_de_passe(user.mot_de_passe),
        role=user.role
    )
    db.add(nouveau)
    db.commit()
    db.refresh(nouveau)
    return nouveau

# Connexion JSON (pour le frontend)
@router.post("/connexion", response_model=Token)
async def connexion(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verifier_mot_de_passe(credentials.mot_de_passe, user.mot_de_passe):
        raise HTTPException(
            status_code=401,
            detail="Email ou mot de passe incorrect"
        )
    token = creer_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

# Connexion OAuth2 (pour Swagger)
@router.post("/token", response_model=Token)
async def token(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verifier_mot_de_passe(form.password, user.mot_de_passe):
        raise HTTPException(
            status_code=401,
            detail="Email ou mot de passe incorrect"
        )
    token = creer_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

# Profil
@router.get("/profil", response_model=UserResponse)
async def profil(current_user: User = Depends(get_current_user)):
    return current_user