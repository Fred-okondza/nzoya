import resend
from app.core.config import settings

resend.api_key = settings.RESEND_API_KEY

def envoyer_email_verification(email: str, nom: str, token: str):
    lien = f"{settings.FRONTEND_URL}/auth/verifier-email?token={token}"
    
    resend.Emails.send({
        "from": "NzoYa <onboarding@resend.dev>",
        "to": email,
        "subject": "Vérifiez votre compte NzoYa 🏠",
        "html": f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #16a34a; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">NzoYa 🏠</h1>
            </div>
            <div style="padding: 30px; background-color: #f9fafb;">
                <h2 style="color: #1f2937;">Bonjour {nom} !</h2>
                <p style="color: #6b7280;">
                    Merci de vous être inscrit sur NzoYa. 
                    Cliquez sur le bouton ci-dessous pour vérifier votre compte.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{lien}" 
                       style="background-color: #16a34a; color: white; padding: 14px 28px; 
                              text-decoration: none; border-radius: 8px; font-weight: bold;">
                        Vérifier mon compte
                    </a>
                </div>
                <p style="color: #9ca3af; font-size: 12px;">
                    Ce lien expire dans 24 heures. Si vous n'avez pas créé de compte, ignorez cet email.
                </p>
            </div>
        </div>
        """
    })

def envoyer_email_reset_password(email: str, nom: str, token: str):
    lien = f"{settings.FRONTEND_URL}/auth/nouveau-mot-de-passe?token={token}"
    
    resend.Emails.send({
        "from": "NzoYa <onboarding@resend.dev>",
        "to": email,
        "subject": "Réinitialisation de votre mot de passe NzoYa 🔒",
        "html": f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #16a34a; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">NzoYa 🏠</h1>
            </div>
            <div style="padding: 30px; background-color: #f9fafb;">
                <h2 style="color: #1f2937;">Bonjour {nom} !</h2>
                <p style="color: #6b7280;">
                    Vous avez demandé à réinitialiser votre mot de passe.
                    Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{lien}"
                       style="background-color: #16a34a; color: white; padding: 14px 28px;
                              text-decoration: none; border-radius: 8px; font-weight: bold;">
                        Réinitialiser mon mot de passe
                    </a>
                </div>
                <p style="color: #9ca3af; font-size: 12px;">
                    Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.
                </p>
            </div>
        </div>
        """
    })