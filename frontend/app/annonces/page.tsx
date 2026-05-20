"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Annonce } from "@/lib/types";
import Navbar from "@/components/Navbar";

export default function Annonces() {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [ville, setVille] = useState("");
  const [type_logement, setTypeLogement] = useState("");

  const chargerAnnonces = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (ville) params.ville = ville;
      if (type_logement) params.type_logement = type_logement;
      const { data } = await api.get("/annonces/", { params });
      setAnnonces(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const annoncesPresDesMoi = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { data } = await api.get("/annonces/proximite", {
            params: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              rayon_km: 5,
            },
          });
          setAnnonces(data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      },
      () => {
        alert("Impossible d'accéder à votre position.");
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    chargerAnnonces();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Filtres */}
      <section className="bg-white border-b px-8 py-4">
        <div className="flex flex-wrap gap-3 max-w-4xl mx-auto">
          <select
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Toutes les villes</option>
            <option value="Brazzaville">Brazzaville</option>
            <option value="Pointe-Noire">Pointe-Noire</option>
            <option value="Dolisie">Dolisie</option>
            <option value="Ouesso">Ouesso</option>
          </select>

          <select
            value={type_logement}
            onChange={(e) => setTypeLogement(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Tous les types</option>
            <option value="villa">Villa</option>
            <option value="appartement">Appartement</option>
            <option value="studio">Studio</option>
            <option value="chambre">Chambre</option>
          </select>

          <button
            onClick={chargerAnnonces}
            className="px-6 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition"
          >
            Filtrer
          </button>

          <button
            onClick={annoncesPresDesMoi}
            className="px-6 py-2 border border-green-600 text-green-600 rounded-xl font-medium hover:bg-green-50 transition"
          >
            📍 Près de moi
          </button>
        </div>
      </section>

      {/* Liste annonces */}
      <section className="max-w-6xl mx-auto px-8 py-8">
        {loading ? (
          <div className="text-center text-gray-500 py-20">
            Chargement des annonces...
          </div>
        ) : annonces.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            Aucune annonce disponible pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {annonces.map((annonce) => (
              <div
                key={annonce.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition"
              >
                {/* Photo */}
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {annonce.photos.length > 0 ? (
                    <img
                      src={annonce.photos[0].url}
                      alt={annonce.titre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-4xl">🏠</span>
                  )}
                </div>

                {/* Infos */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 truncate">
                    {annonce.titre}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    📍 {annonce.quartier ? `${annonce.quartier}, ` : ""}{annonce.ville}
                  </p>

                  {/* Equipements */}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {annonce.toilette_interieure && (
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                        🚽 Toilette int.
                      </span>
                    )}
                    {annonce.douche_interieure && (
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                        🚿 Douche int.
                      </span>
                    )}
                    {annonce.meuble && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                        🛋️ Meublé
                      </span>
                    )}
                    {annonce.electricite && (
                      <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full">
                        ⚡ Électricité
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-green-600 font-bold text-lg">
                      {annonce.prix.toLocaleString()} FCFA
                      <span className="text-gray-400 text-sm font-normal">/mois</span>
                    </span>
                    <span className="text-gray-400 text-sm">
                      {annonce.nb_chambres} ch.
                    </span>
                  </div>

                  <Link href={`/annonces/${annonce.id}`}>
                    <button className="mt-3 w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition font-medium">
                      Voir le logement
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}