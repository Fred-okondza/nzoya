"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import Navbar from "@/components/Navbar";
import { Annonce } from "@/lib/types";

interface Stats {
  total_utilisateurs: number;
  total_proprietaires: number;
  total_locataires: number;
  total_annonces: number;
  annonces_actives: number;
  annonces_non_verifiees: number;
  utilisateurs_suspendus: number;
}

interface Utilisateur {
  id: number;
  nom: string;
  email: string;
  role: string;
  est_verifie: boolean;
  est_suspendu: boolean;
  created_at: string;
}

export default function Admin() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [onglet, setOnglet] = useState<"stats" | "annonces" | "utilisateurs">("stats");
  const [stats, setStats] = useState<Stats | null>(null);
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push("/auth/connexion");
      return;
    }
    if (user && user.role !== "admin") {
      router.push("/");
      return;
    }
    chargerDonnees();
  }, [token, user]);

  const chargerDonnees = async () => {
    try {
      const [statsRes, annoncesRes, utilisateursRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/annonces"),
        api.get("/admin/utilisateurs"),
      ]);
      setStats(statsRes.data);
      setAnnonces(annoncesRes.data);
      setUtilisateurs(utilisateursRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validerAnnonce = async (id: number) => {
    try {
      await api.put(`/admin/annonces/${id}/valider`);
      setAnnonces(annonces.map((a) =>
        a.id === id ? { ...a, est_verifie: true } : a
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const supprimerAnnonce = async (id: number) => {
    if (!confirm("Supprimer cette annonce ?")) return;
    try {
      await api.delete(`/admin/annonces/${id}`);
      setAnnonces(annonces.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSuspendre = async (id: number) => {
    try {
      const { data } = await api.put(`/admin/utilisateurs/${id}/suspendre`);
      setUtilisateurs(utilisateurs.map((u) =>
        u.id === id ? { ...u, est_suspendu: data.est_suspendu } : u
      ));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          🛡️ Panel Administrateur
        </h1>

        {/* Onglets */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {[
            { key: "stats", label: "📊 Statistiques" },
            { key: "annonces", label: "🏠 Annonces" },
            { key: "utilisateurs", label: "👥 Utilisateurs" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setOnglet(tab.key as any)}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition ${
                onglet === tab.key
                  ? "bg-white border border-b-white border-gray-200 text-green-600 -mb-px"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        {onglet === "stats" && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Utilisateurs", value: stats.total_utilisateurs, icon: "👥", color: "blue" },
              { label: "Propriétaires", value: stats.total_proprietaires, icon: "🏠", color: "green" },
              { label: "Locataires", value: stats.total_locataires, icon: "🔑", color: "purple" },
              { label: "Annonces", value: stats.total_annonces, icon: "📋", color: "orange" },
              { label: "Annonces actives", value: stats.annonces_actives, icon: "✅", color: "green" },
              { label: "Non vérifiées", value: stats.annonces_non_verifiees, icon: "⏳", color: "yellow" },
              { label: "Suspendus", value: stats.utilisateurs_suspendus, icon: "🚫", color: "red" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm">
                <p className="text-3xl mb-2">{stat.icon}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Annonces */}
        {onglet === "annonces" && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-700">
                Toutes les annonces ({annonces.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              {annonces.map((annonce) => (
                <div key={annonce.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{annonce.titre}</p>
                    <p className="text-sm text-gray-500">
                      {annonce.ville} — {annonce.prix.toLocaleString()} FCFA/mois
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {annonce.est_verifie ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        ✅ Vérifié
                      </span>
                    ) : (
                      <button
                        onClick={() => validerAnnonce(annonce.id)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200 transition"
                      >
                        Valider
                      </button>
                    )}
                    <button
                      onClick={() => supprimerAnnonce(annonce.id)}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium hover:bg-red-200 transition"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Utilisateurs */}
        {onglet === "utilisateurs" && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-700">
                Tous les utilisateurs ({utilisateurs.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              {utilisateurs.map((u) => (
                <div key={u.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">
                      {u.nom.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{u.nom}</p>
                      <p className="text-sm text-gray-500">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      u.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : u.role === "proprietaire"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {u.role}
                    </span>
                    {u.est_verifie ? (
                      <span className="text-xs text-green-600">✅</span>
                    ) : (
                      <span className="text-xs text-gray-400">Non vérifié</span>
                    )}
                    {u.role !== "admin" && (
                      <button
                        onClick={() => toggleSuspendre(u.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                          u.est_suspendu
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-600 hover:bg-red-200"
                        }`}
                      >
                        {u.est_suspendu ? "Réactiver" : "Suspendre"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}