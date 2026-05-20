"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Annonce } from "@/lib/types";
import Navbar from "@/components/Navbar";
import { useAuthStore } from "@/lib/store";

export default function DetailAnnonce() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [annonce, setAnnonce] = useState<Annonce | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoActive, setPhotoActive] = useState(0);

  useEffect(() => {
    const charger = async () => {
      try {
        const { data } = await api.get(`/annonces/${id}`);
        setAnnonce(data);
      } catch {
        router.push("/annonces");
      } finally {
        setLoading(false);
      }
    };
    charger();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  if (!annonce) return null;

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-8 py-8">

        {/* Galerie photos */}
        <div className="mb-6">
          {/* Photo principale */}
          <div className="bg-gray-200 rounded-2xl h-72 flex items-center justify-center overflow-hidden mb-3">
            {annonce.photos.length > 0 ? (
              <img
                src={annonce.photos[photoActive].url}
                alt={annonce.titre}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400 text-6xl">🏠</span>
            )}
          </div>

          {/* Miniatures */}
          {annonce.photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {annonce.photos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => setPhotoActive(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                    photoActive === index
                      ? "border-green-600"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Compteur photos */}
          {annonce.photos.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              {photoActive + 1} / {annonce.photos.length} photo(s)
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Infos principales */}
          <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {annonce.titre}
                </h1>
                <p className="text-gray-500 mt-1">
                  📍 {annonce.quartier ? `${annonce.quartier}, ` : ""}{annonce.ville}
                </p>
              </div>
              {annonce.est_verifie && (
                <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">
                  ✅ Vérifié
                </span>
              )}
            </div>

            <p className="text-gray-600 mb-6">
              {annonce.description || "Aucune description fournie."}
            </p>

            {/* Caractéristiques */}
            <h3 className="font-bold text-gray-800 mb-3">Caractéristiques</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-2 text-gray-600">
                🏠 <span>{annonce.type_logement}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                🛏️ <span>{annonce.nb_chambres} chambre(s)</span>
              </div>
            </div>

            {/* Équipements */}
            <h3 className="font-bold text-gray-800 mb-3">Équipements</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Toilette intérieure", value: annonce.toilette_interieure, icon: "🚽" },
                { label: "Douche intérieure", value: annonce.douche_interieure, icon: "🚿" },
                { label: "Cuisine intérieure", value: annonce.cuisine_interieure, icon: "🍳" },
                { label: "Eau courante", value: annonce.eau_courante, icon: "💧" },
                { label: "Électricité", value: annonce.electricite, icon: "⚡" },
                { label: "Meublé", value: annonce.meuble, icon: "🛋️" },
                { label: "Climatisation", value: annonce.climatisation, icon: "❄️" },
                { label: "Parking", value: annonce.parking, icon: "🚗" },
                { label: "Clôture", value: annonce.cloture, icon: "🔒" },
                { label: "Gardien", value: annonce.gardien, icon: "👮" },
              ].map((eq) => (
                <div
                  key={eq.label}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                    eq.value
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-50 text-gray-400 line-through"
                  }`}
                >
                  {eq.icon} {eq.label}
                </div>
              ))}
            </div>
          </div>

          {/* Prix et contact */}
          <div className="bg-white rounded-2xl p-6 shadow-sm h-fit">
            <p className="text-3xl font-extrabold text-green-600 mb-1">
              {annonce.prix.toLocaleString()} FCFA
            </p>
            <p className="text-gray-400 text-sm mb-6">par mois</p>

            <button className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition mb-3">
              📞 Contacter le propriétaire
            </button>

            <button
              onClick={async () => {
                if (!user) {
                  router.push("/auth/connexion");
                  return;
                }
                try {
                  const { data } = await api.post("/chat/conversations", {
                    annonce_id: annonce.id,
                  });
                  router.push(`/messages/${data.id}`);
                } catch (err: any) {
                  alert(err.response?.data?.detail || "Erreur");
                }
              }}
              className="w-full py-3 border border-green-600 text-green-600 rounded-xl font-semibold hover:bg-green-50 transition"
            >
              💬 Envoyer un message
            </button>

            <p className="text-xs text-gray-400 text-center mt-4">
              Publié le {new Date(annonce.created_at).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}