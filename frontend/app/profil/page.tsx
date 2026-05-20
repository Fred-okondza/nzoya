"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import Navbar from "@/components/Navbar";
import { Annonce } from "@/lib/types";

export default function Profil() {
  const router = useRouter();
  const { user, token, setUser } = useAuthStore();
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(false);
  const [succès, setSuccès] = useState("");
  const [erreur, setErreur] = useState("");

  const [formProfil, setFormProfil] = useState({
    nom: "",
    telephone: "",
  });

  const [formMotDePasse, setFormMotDePasse] = useState({
    ancien_mot_de_passe: "",
    nouveau_mot_de_passe: "",
    confirmer: "",
  });

  useEffect(() => {
    if (!token) {
      router.push("/auth/connexion");
      return;
    }
    if (user) {
      setFormProfil({
        nom: user.nom || "",
        telephone: user.telephone || "",
      });
      if (user.role === "proprietaire") {
        chargerMesAnnonces();
      }
    }
  }, [token, user]);

  const chargerMesAnnonces = async () => {
    try {
      const { data } = await api.get("/profil/mes-annonces");
      setAnnonces(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErreur("");
    setSuccès("");
    try {
      const { data } = await api.put("/profil/", formProfil);
      setUser(data);
      setSuccès("Profil mis à jour avec succès ✅");
    } catch (err: any) {
      setErreur(err.response?.data?.detail || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMotDePasse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formMotDePasse.nouveau_mot_de_passe !== formMotDePasse.confirmer) {
      setErreur("Les mots de passe ne correspondent pas");
      return;
    }
    setLoading(true);
    setErreur("");
    setSuccès("");
    try {
      await api.put("/profil/mot-de-passe", {
        ancien_mot_de_passe: formMotDePasse.ancien_mot_de_passe,
        nouveau_mot_de_passe: formMotDePasse.nouveau_mot_de_passe,
      });
      setSuccès("Mot de passe modifié avec succès ✅");
      setFormMotDePasse({
        ancien_mot_de_passe: "",
        nouveau_mot_de_passe: "",
        confirmer: "",
      });
    } catch (err: any) {
      setErreur(err.response?.data?.detail || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const toggleDisponibilite = async (annonce_id: number) => {
    try {
      const { data } = await api.put(
        `/profil/mes-annonces/${annonce_id}/disponibilite`
      );
      setAnnonces(annonces.map((a) => (a.id === annonce_id ? data : a)));
    } catch (err) {
      console.error(err);
    }
  };

  const supprimerAnnonce = async (annonce_id: number) => {
    if (!confirm("Supprimer cette annonce ?")) return;
    try {
      await api.delete(`/annonces/${annonce_id}`);
      setAnnonces(annonces.filter((a) => a.id !== annonce_id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          👤 Mon profil
        </h1>

        {succès && (
          <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {succès}
          </div>
        )}
        {erreur && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {erreur}
          </div>
        )}

        {/* Infos personnelles */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="font-bold text-gray-700 mb-4">
            Informations personnelles
          </h2>
          <form onSubmit={handleUpdateProfil} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet
              </label>
              <input
                type="text"
                value={formProfil.nom}
                onChange={(e) =>
                  setFormProfil({ ...formProfil, nom: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                value={formProfil.telephone}
                onChange={(e) =>
                  setFormProfil({ ...formProfil, telephone: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rôle
              </label>
              <input
                type="text"
                value={user?.role === "proprietaire" ? "Propriétaire" : "Locataire"}
                disabled
                className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 text-gray-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? "Sauvegarde..." : "Sauvegarder"}
            </button>
          </form>
        </div>

        {/* Changer mot de passe */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="font-bold text-gray-700 mb-4">
            Changer le mot de passe
          </h2>
          <form
            onSubmit={handleUpdateMotDePasse}
            className="flex flex-col gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ancien mot de passe
              </label>
              <input
                type="password"
                value={formMotDePasse.ancien_mot_de_passe}
                onChange={(e) =>
                  setFormMotDePasse({
                    ...formMotDePasse,
                    ancien_mot_de_passe: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={formMotDePasse.nouveau_mot_de_passe}
                onChange={(e) =>
                  setFormMotDePasse({
                    ...formMotDePasse,
                    nouveau_mot_de_passe: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={formMotDePasse.confirmer}
                onChange={(e) =>
                  setFormMotDePasse({
                    ...formMotDePasse,
                    confirmer: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-900 transition disabled:opacity-50"
            >
              {loading ? "Modification..." : "Changer le mot de passe"}
            </button>
          </form>
        </div>

        {/* Mes annonces (propriétaire) */}
        {user?.role === "proprietaire" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-700">Mes annonces</h2>
              <Link
                href="/publier"
                className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition"
              >
                + Nouvelle
              </Link>
            </div>

            {annonces.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                Aucune annonce publiée.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {annonces.map((annonce) => (
                  <div
                    key={annonce.id}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-xl"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {annonce.titre}
                      </p>
                      <p className="text-sm text-gray-500">
                        {annonce.prix.toLocaleString()} FCFA/mois —{" "}
                        {annonce.ville}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => toggleDisponibilite(annonce.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          annonce.est_disponible
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {annonce.est_disponible ? "Actif" : "Inactif"}
                      </button>
                      <Link
                        href={`/annonces/${annonce.id}`}
                        className="px-3 py-1 border border-gray-200 text-gray-600 rounded-full text-xs hover:bg-gray-50"
                      >
                        Voir
                      </Link>
                      <button
                        onClick={() => supprimerAnnonce(annonce.id)}
                        className="px-3 py-1 border border-red-200 text-red-500 rounded-full text-xs hover:bg-red-50"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}