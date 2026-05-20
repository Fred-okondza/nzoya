"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

export default function MotDePasseOublie() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErreur("");
    try {
      await api.post("/auth/mot-de-passe-oublie", { email });
      setEnvoye(true);
    } catch (err: any) {
      setErreur(err.response?.data?.detail || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <Link href="/" className="block text-center text-2xl font-bold text-green-700 mb-6">
          NzoYa 🏠
        </Link>

        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          Mot de passe oublié
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>

        {envoye ? (
          <div className="text-center">
            <div className="text-4xl mb-4">📧</div>
            <p className="text-gray-700 font-medium mb-2">Email envoyé !</p>
            <p className="text-gray-500 text-sm mb-6">
              Vérifiez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.
            </p>
            <Link
              href="/auth/connexion"
              className="text-green-600 font-medium hover:underline"
            >
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            {erreur && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
                {erreur}
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="jean@exemple.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? "Envoi en cours..." : "Envoyer le lien"}
              </button>
            </form>
            <p className="text-center text-gray-500 text-sm mt-6">
              <Link href="/auth/connexion" className="text-green-600 font-medium hover:underline">
                Retour à la connexion
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}