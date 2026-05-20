from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# Schema de base
class AnnonceBase(BaseModel):
    titre: str
    description: Optional[str] = None
    prix: float
    ville: str
    quartier: Optional[str] = None
    type_logement: str
    nb_chambres: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    # Sanitaires
    toilette_interieure: bool = False
    douche_interieure: bool = False
    cuisine_interieure: bool = False

    # Eau & Electricité
    eau_courante: bool = False
    electricite: bool = False

    # Confort
    meuble: bool = False
    climatisation: bool = False
    parking: bool = False
    cloture: bool = False
    gardien: bool = False

# Création d'une annonce
class AnnonceCreate(AnnonceBase):
    pass

# Mise à jour d'une annonce
class AnnonceUpdate(BaseModel):
    titre: Optional[str] = None
    description: Optional[str] = None
    prix: Optional[float] = None
    ville: Optional[str] = None
    quartier: Optional[str] = None
    type_logement: Optional[str] = None
    nb_chambres: Optional[int] = None
    est_disponible: Optional[bool] = None
    toilette_interieure: Optional[bool] = None
    douche_interieure: Optional[bool] = None
    cuisine_interieure: Optional[bool] = None
    eau_courante: Optional[bool] = None
    electricite: Optional[bool] = None
    meuble: Optional[bool] = None
    climatisation: Optional[bool] = None
    parking: Optional[bool] = None
    cloture: Optional[bool] = None
    gardien: Optional[bool] = None

# Schema photo
class PhotoResponse(BaseModel):
    id: int
    url: str

    class Config:
        from_attributes = True

# Réponse complète
class AnnonceResponse(AnnonceBase):
    id: int
    est_disponible: bool
    est_verifie: bool
    created_at: datetime
    proprietaire_id: int
    photos: List[PhotoResponse] = []

    class Config:
        from_attributes = True