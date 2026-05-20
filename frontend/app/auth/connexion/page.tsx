"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export default function Connexion() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setToken, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [form, setForm] = useState({
    email: "",
    mot_de_passe: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErreur("");
    try {
      // Connexion
      const { data } = await api.post("/auth/connexion", form);
      setToken(data.access_token);

      // Récupérer le profil
      const { data: profil } = await api.get("/auth/profil", {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      setUser(profil);

      router.push("/annonces");
    } catch (err: any) {
      setErreur(err.response?.data?.detail || "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="block text-center text-2xl font-bold text-green-700 mb-6">
          NzoYa 🏠
        </Link>

        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          Bon retour !
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Connectez-vous à votre compte
        </p>

        {/* Message succès inscription */}
        {searchParams.get("inscrit") && (
          <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg mb-4 text-sm">
            ✅ Compte créé avec succès ! Connectez-vous.
          </div>
        )}

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
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="jean@exemple.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              name="mot_de_passe"
              value={form.mot_de_passe}
              onChange={handleChange}
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
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Pas encore de compte ?{" "}
          <Link href="/auth/inscription" className="text-green-600 font-medium hover:underline">
            S'inscrire gratuitement
          </Link>
        </p>
      </div>
    </main>
  );
}