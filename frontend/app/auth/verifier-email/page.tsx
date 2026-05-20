"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

export default function VerifierEmail() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [statut, setStatut] = useState<"chargement" | "succes" | "erreur">("chargement");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatut("erreur");
      setMessage("Token manquant.");
      return;
    }
    const verifier = async () => {
      try {
        await api.get(`/auth/verifier-email?token=${token}`);
        setStatut("succes");
        setMessage("Email vérifié avec succès !");
        setTimeout(() => router.push("/auth/connexion"), 3000);
      } catch (err: any) {
        setStatut("erreur");
        setMessage(err.response?.data?.detail || "Token invalide ou expiré.");
      }
    };
    verifier();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        <Link href="/" className="block text-2xl font-bold text-green-700 mb-6">
          NzoYa 🏠
        </Link>

        {statut === "chargement" && (
          <>
            <div className="text-4xl mb-4">⏳</div>
            <h2 className="text-xl font-bold text-gray-800">Vérification en cours...</h2>
          </>
        )}

        {statut === "succes" && (
          <>
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Compte vérifié !</h2>
            <p className="text-gray-500 mb-6">{message}</p>
            <p className="text-sm text-gray-400">Redirection vers la connexion...</p>
          </>
        )}

        {statut === "erreur" && (
          <>
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Erreur</h2>
            <p className="text-gray-500 mb-6">{message}</p>
            <Link
              href="/auth/inscription"
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition"
            >
              Retour à l'inscription
            </Link>
          </>
        )}
      </div>
    </main>
  );
}