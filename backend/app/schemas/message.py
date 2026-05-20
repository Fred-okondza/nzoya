from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class MessageCreate(BaseModel):
    contenu: str

class MessageResponse(BaseModel):
    id: int
    contenu: str
    expediteur_id: int
    conversation_id: int
    created_at: datetime
    lu: bool

    class Config:
        from_attributes = True

class ConversationCreate(BaseModel):
    annonce_id: int

class UserInfo(BaseModel):
    id: int
    nom: str
    telephone: Optional[str] = None

    class Config:
        from_attributes = True

class AnnonceInfo(BaseModel):
    id: int
    titre: str
    prix: float
    ville: str

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: int
    annonce_id: int
    locataire_id: int
    proprietaire_id: int
    created_at: datetime
    annonce: AnnonceInfo
    locataire: UserInfo
    proprietaire: UserInfo
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True