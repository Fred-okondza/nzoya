from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.models import Annonce, Photo, User
from app.schemas.annonce import AnnonceUpdate, AnnonceResponse
import cloudinary
import cloudinary.uploader
from app.core.config import settings

# Configuration Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

router = APIRouter(prefix="/annonces", tags=["Annonces"])

# Lister les annonces avec filtres
@router.get("/", response_model=List[AnnonceResponse])
async def lister_annonces(
    ville: Optional[str] = None,
    quartier: Optional[str] = None,
    prix_min: Optional[float] = None,
    prix_max: Optional[float] = None,
    nb_chambres: Optional[int] = None,
    type_logement: Optional[str] = None,
    meuble: Optional[bool] = None,
    toilette_interieure: Optional[bool] = None,
    douche_interieure: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Annonce).filter(Annonce.est_disponible == True)

    if ville:
        query = query.filter(Annonce.ville == ville)
    if quartier:
        query = query.filter(Annonce.quartier == quartier)
    if prix_min:
        query = query.filter(Annonce.prix >= prix_min)
    if prix_max:
        query = query.filter(Annonce.prix <= prix_max)
    if nb_chambres:
        query = query.filter(Annonce.nb_chambres == nb_chambres)
    if type_logement:
        query = query.filter(Annonce.type_logement == type_logement)
    if meuble is not None:
        query = query.filter(Annonce.meuble == meuble)
    if toilette_interieure is not None:
        query = query.filter(Annonce.toilette_interieure == toilette_interieure)
    if douche_interieure is not None:
        query = query.filter(Annonce.douche_interieure == douche_interieure)

    return query.order_by(Annonce.created_at.desc()).all()

# Voir une annonce
@router.get("/{annonce_id}", response_model=AnnonceResponse)
async def voir_annonce(annonce_id: int, db: Session = Depends(get_db)):
    annonce = db.query(Annonce).filter(Annonce.id == annonce_id).first()
    if not annonce:
        raise HTTPException(status_code=404, detail="Annonce introuvable")
    return annonce

# Créer une annonce
@router.post("/", response_model=AnnonceResponse, status_code=201)
async def creer_annonce(
    titre: str = Form(...),
    description: Optional[str] = Form(None),
    prix: float = Form(...),
    ville: str = Form(...),
    quartier: Optional[str] = Form(None),
    ruelle: Optional[str] = Form(None),
    adresse_complete: Optional[str] = Form(None),
    type_logement: str = Form(...),
    nb_chambres: int = Form(...),
    toilette_interieure: bool = Form(False),
    douche_interieure: bool = Form(False),
    cuisine_interieure: bool = Form(False),
    eau_courante: bool = Form(False),
    electricite: bool = Form(False),
    meuble: bool = Form(False),
    climatisation: bool = Form(False),
    parking: bool = Form(False),
    cloture: bool = Form(False),
    gardien: bool = Form(False),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    photos: Optional[List[UploadFile]] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value != "proprietaire":
        raise HTTPException(
            status_code=403,
            detail="Seuls les propriétaires peuvent publier des annonces"
        )

    nouvelle_annonce = Annonce(
        titre=titre,
        description=description,
        prix=prix,
        ville=ville,
        quartier=quartier,
        ruelle=ruelle,
        adresse_complete=adresse_complete,
        type_logement=type_logement,
        nb_chambres=nb_chambres,
        toilette_interieure=toilette_interieure,
        douche_interieure=douche_interieure,
        cuisine_interieure=cuisine_interieure,
        eau_courante=eau_courante,
        electricite=electricite,
        meuble=meuble,
        climatisation=climatisation,
        parking=parking,
        cloture=cloture,
        gardien=gardien,
        latitude=latitude,
        longitude=longitude,
        proprietaire_id=current_user.id
    )
    db.add(nouvelle_annonce)
    db.flush()

    # Upload photos sur Cloudinary
    if photos:
        for photo in photos:
            if photo and photo.filename and photo.filename != "":
                try:
                    contenu = await photo.read()
                    if len(contenu) > 0:
                        result = cloudinary.uploader.upload(
                            contenu,
                            folder="nzoya/annonces"
                        )
                        db.add(Photo(url=result["url"], annonce_id=nouvelle_annonce.id))
                        print(f"✅ Photo uploadée: {result['url']}")
                except Exception as e:
                    print(f"❌ Erreur upload photo: {e}")

    db.commit()
    db.refresh(nouvelle_annonce)
    return nouvelle_annonce

# Modifier une annonce
@router.put("/{annonce_id}", response_model=AnnonceResponse)
async def modifier_annonce(
    annonce_id: int,
    annonce_data: AnnonceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    annonce = db.query(Annonce).filter(Annonce.id == annonce_id).first()
    if not annonce:
        raise HTTPException(status_code=404, detail="Annonce introuvable")
    if annonce.proprietaire_id != current_user.id:
        raise HTTPException(status_code=403, detail="Non autorisé")

    for key, value in annonce_data.model_dump(exclude_unset=True).items():
        setattr(annonce, key, value)

    db.commit()
    db.refresh(annonce)
    return annonce

# Supprimer une annonce
@router.delete("/{annonce_id}", status_code=204)
async def supprimer_annonce(
    annonce_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    annonce = db.query(Annonce).filter(Annonce.id == annonce_id).first()
    if not annonce:
        raise HTTPException(status_code=404, detail="Annonce introuvable")
    if annonce.proprietaire_id != current_user.id:
        raise HTTPException(status_code=403, detail="Non autorisé")

    db.delete(annonce)
    db.commit()