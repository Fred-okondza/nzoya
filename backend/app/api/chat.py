from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List, Dict
from app.core.database import get_db, SessionLocal
from app.api.auth import get_current_user
from app.models.models import Conversation, Message, User, Annonce, Notification
from app.schemas.message import ConversationCreate, ConversationResponse, MessageCreate, MessageResponse
import json

router = APIRouter(prefix="/chat", tags=["Chat"])

# Gestionnaire de connexions WebSocket
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, conversation_id: int):
        await websocket.accept()
        if conversation_id not in self.active_connections:
            self.active_connections[conversation_id] = []
        self.active_connections[conversation_id].append(websocket)

    def disconnect(self, websocket: WebSocket, conversation_id: int):
        if conversation_id in self.active_connections:
            self.active_connections[conversation_id].remove(websocket)

    async def broadcast(self, message: dict, conversation_id: int):
        if conversation_id in self.active_connections:
            for connection in self.active_connections[conversation_id]:
                await connection.send_text(json.dumps(message))

manager = ConnectionManager()

# Créer ou récupérer une conversation
@router.post("/conversations", response_model=ConversationResponse, status_code=201)
async def creer_conversation(
    data: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    annonce = db.query(Annonce).filter(Annonce.id == data.annonce_id).first()
    if not annonce:
        raise HTTPException(status_code=404, detail="Annonce introuvable")

    if current_user.role.value != "locataire":
        raise HTTPException(
            status_code=403,
            detail="Seuls les locataires peuvent initier une conversation"
        )

    existante = db.query(Conversation).filter(
        Conversation.annonce_id == data.annonce_id,
        Conversation.locataire_id == current_user.id
    ).first()

    if existante:
        return existante

    conversation = Conversation(
        annonce_id=data.annonce_id,
        locataire_id=current_user.id,
        proprietaire_id=annonce.proprietaire_id
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation

# Lister mes conversations
@router.get("/conversations", response_model=List[ConversationResponse])
async def mes_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value == "locataire":
        conversations = db.query(Conversation).filter(
            Conversation.locataire_id == current_user.id
        ).all()
    else:
        conversations = db.query(Conversation).filter(
            Conversation.proprietaire_id == current_user.id
        ).all()
    return conversations

# Récupérer une conversation
@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def voir_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation introuvable")

    if current_user.id not in [conversation.locataire_id, conversation.proprietaire_id]:
        raise HTTPException(status_code=403, detail="Non autorisé")

    return conversation

# Envoyer un message REST
@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse)
async def envoyer_message(
    conversation_id: int,
    data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation introuvable")

    if current_user.id not in [conversation.locataire_id, conversation.proprietaire_id]:
        raise HTTPException(status_code=403, detail="Non autorisé")

    message = Message(
        contenu=data.contenu,
        expediteur_id=current_user.id,
        conversation_id=conversation_id
    )
    db.add(message)
    db.flush()

    # Créer une notification pour le destinataire
    destinataire_id = (
        conversation.proprietaire_id
        if current_user.id == conversation.locataire_id
        else conversation.locataire_id
    )
    notification = Notification(
        utilisateur_id=destinataire_id,
        titre=f"Nouveau message de {current_user.nom}",
        contenu=data.contenu[:50] + "..." if len(data.contenu) > 50 else data.contenu,
        lien=f"/messages/{conversation_id}"
    )
    db.add(notification)
    db.commit()
    db.refresh(message)

    await manager.broadcast({
        "id": message.id,
        "contenu": message.contenu,
        "expediteur_id": message.expediteur_id,
        "conversation_id": message.conversation_id,
        "created_at": message.created_at.isoformat(),
        "lu": message.lu
    }, conversation_id)

    return message

# WebSocket pour le chat temps réel
@router.websocket("/ws/{conversation_id}/{user_id}")
async def websocket_chat(
    websocket: WebSocket,
    conversation_id: int,
    user_id: int,
):
    db = SessionLocal()
    await manager.connect(websocket, conversation_id)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)

            message = Message(
                contenu=message_data["contenu"],
                expediteur_id=user_id,
                conversation_id=conversation_id
            )
            db.add(message)
            db.flush()

            # Créer notification via WebSocket
            conversation = db.query(Conversation).filter(
                Conversation.id == conversation_id
            ).first()
            if conversation:
                destinataire_id = (
                    conversation.proprietaire_id
                    if user_id == conversation.locataire_id
                    else conversation.locataire_id
                )
                expediteur = db.query(User).filter(User.id == user_id).first()
                notification = Notification(
                    utilisateur_id=destinataire_id,
                    titre=f"Nouveau message de {expediteur.nom if expediteur else 'Quelqu un'}",
                    contenu=message_data["contenu"][:50] + "..." if len(message_data["contenu"]) > 50 else message_data["contenu"],
                    lien=f"/messages/{conversation_id}"
                )
                db.add(notification)

            db.commit()
            db.refresh(message)

            await manager.broadcast({
                "id": message.id,
                "contenu": message.contenu,
                "expediteur_id": message.expediteur_id,
                "conversation_id": message.conversation_id,
                "created_at": message.created_at.isoformat(),
                "lu": message.lu
            }, conversation_id)

    except WebSocketDisconnect:
        manager.disconnect(websocket, conversation_id)
    finally:
        db.close()