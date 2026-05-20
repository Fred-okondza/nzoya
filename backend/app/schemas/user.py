from pydantic import BaseModel, EmailStr
from enum import Enum
from datetime import datetime

class UserRole(str, Enum):
    proprietaire = "proprietaire"
    locataire = "locataire"

# Création d'un utilisateur
class UserCreate(BaseModel):
    nom: str
    email: EmailStr
    telephone: str | None = None
    mot_de_passe: str
    role: UserRole

# Connexion
class UserLogin(BaseModel):
    email: EmailStr
    mot_de_passe: str

# Réponse (sans mot de passe)
class UserResponse(BaseModel):
    id: int
    nom: str
    email: EmailStr
    telephone: str | None
    role: UserRole
    est_verifie: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Token JWT
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None