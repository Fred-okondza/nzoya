"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

export default function NouveauMotDePasse() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [succes, setSucces] = useState(false);
  const [erreur, setErreur] = useState("");
  const [form, setForm] = useState({
    nouveau_mot_de_passe: "",
    confirmer: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.nouveau_mot_de_passe !== form.confirmer) {
      setErreur("Les mots de passe ne correspondent pas");
      return;
    }
    setLoading(true);
    setErreur("");
    try {
      const token = searchParams.get("token");
      await api.post("/auth/reinitialiser-mot-de-passe", {
        token,
        nouveau_mot_de_passe: form.nouveau_mot_de_passe,
      });
      setSucces(true);
      setTimeout(() => router.push("/auth/connexion"), 3000);
    } catch (err: any) {
      setErreur(err.response?.data?.detail || "Token invalide ou expiré");
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
          Nouveau mot de passe
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Choisissez un nouveau mot de passe sécurisé
        </p>

        {succes ? (
          <div className="text-center">
            <div className="text-4xl mb-4">✅</div>
            <p className="text-gray-700 font-medium mb-2">
              Mot de passe modifié !
            </p>
            <p className="text-gray-500 text-sm">
              Redirection vers la connexion...
            </p>
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
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={form.nouveau_mot_de_passe}
                  onChange={(e) =>
                    setForm({ ...form, nouveau_mot_de_passe: e.target.value })
                  }
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  value={form.confirmer}
                  onChange={(e) =>
                    setForm({ ...form, confirmer: e.target.value })
                  }
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? "Modification..." : "Modifier le mot de passe"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}