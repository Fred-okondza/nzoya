from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, annonces, chat, profil, notifications

app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(annonces.router)
app.include_router(chat.router)
app.include_router(profil.router)
app.include_router(notifications.router)

@app.get("/")
async def root():
    return {"message": f"Bienvenue sur l'API {settings.APP_NAME} 🏠"}

@app.get("/health")
async def health():
    return {"status": "ok"}