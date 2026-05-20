from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
import enum

class UserRole(enum.Enum):
    proprietaire = "proprietaire"
    locataire = "locataire"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    telephone = Column(String, nullable=True)
    mot_de_passe = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    est_verifie = Column(Boolean, default=False)
    est_suspendu = Column(Boolean, default=False)
    token_verification = Column(String, nullable=True)
    token_reset_password = Column(String, nullable=True)
    token_reset_expire = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    annonces = relationship("Annonce", back_populates="proprietaire")
    conversations_locataire = relationship("Conversation", foreign_keys="Conversation.locataire_id", back_populates="locataire")
    conversations_proprietaire = relationship("Conversation", foreign_keys="Conversation.proprietaire_id", back_populates="proprietaire")

class Annonce(Base):
    __tablename__ = "annonces"

    id = Column(Integer, primary_key=True, index=True)
    titre = Column(String, nullable=False)
    description = Column(String, nullable=True)
    prix = Column(Float, nullable=False)
    ville = Column(String, nullable=False)
    quartier = Column(String, nullable=True)
    ruelle = Column(String, nullable=True)
    adresse_complete = Column(String, nullable=True)
    type_logement = Column(String, nullable=False)
    nb_chambres = Column(Integer, nullable=False)
    est_disponible = Column(Boolean, default=True)
    est_verifie = Column(Boolean, default=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Sanitaires
    toilette_interieure = Column(Boolean, default=False)
    douche_interieure = Column(Boolean, default=False)
    cuisine_interieure = Column(Boolean, default=False)

    # Eau & Electricité
    eau_courante = Column(Boolean, default=False)
    electricite = Column(Boolean, default=False)

    # Confort
    meuble = Column(Boolean, default=False)
    climatisation = Column(Boolean, default=False)
    parking = Column(Boolean, default=False)
    cloture = Column(Boolean, default=False)
    gardien = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    proprietaire_id = Column(Integer, ForeignKey("users.id"))
    proprietaire = relationship("User", back_populates="annonces")
    photos = relationship("Photo", back_populates="annonce")
    conversations = relationship("Conversation", back_populates="annonce")

class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False)
    annonce_id = Column(Integer, ForeignKey("annonces.id"))
    annonce = relationship("Annonce", back_populates="photos")

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    annonce_id = Column(Integer, ForeignKey("annonces.id"))
    locataire_id = Column(Integer, ForeignKey("users.id"))
    proprietaire_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    annonce = relationship("Annonce", back_populates="conversations")
    locataire = relationship("User", foreign_keys=[locataire_id], back_populates="conversations_locataire")
    proprietaire = relationship("User", foreign_keys=[proprietaire_id], back_populates="conversations_proprietaire")
    messages = relationship("Message", back_populates="conversation")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    contenu = Column(Text, nullable=False)
    expediteur_id = Column(Integer, ForeignKey("users.id"))
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    lu = Column(Boolean, default=False)

    conversation = relationship("Conversation", back_populates="messages")
    expediteur = relationship("User")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    utilisateur_id = Column(Integer, ForeignKey("users.id"))
    titre = Column(String, nullable=False)
    contenu = Column(String, nullable=False)
    lu = Column(Boolean, default=False)
    lien = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    utilisateur = relationship("User")