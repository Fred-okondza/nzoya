"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import Navbar from "@/components/Navbar";
import CarteWrapper from "@/components/CarteWrapper";

export default function Publier() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [photos, setPhotos] = useState<FileList | null>(null);
  const [localisationLoading, setLocalisationLoading] = useState(false);
  const [localisationMessage, setLocalisationMessage] = useState("");
  const [centreCarte, setCentreCarte] = useState<[number, number]>([-4.2634, 15.2429]);
  const [form, setForm] = useState({
    titre: "",
    description: "",
    prix: "",
    ville: "",
    quartier: "",
    ruelle: "",
    adresse_complete: "",
    type_logement: "",
    nb_chambres: "",
    latitude: "",
    longitude: "",
    toilette_interieure: false,
    douche_interieure: false,
    cuisine_interieure: false,
    eau_courante: false,
    electricite: false,
    meuble: false,
    climatisation: false,
    parking: false,
    cloture: false,
    gardien: false,
  });

  useEffect(() => {
    if (!token) {
      router.push("/auth/connexion");
    } else if (user && user.role !== "proprietaire") {
      router.push("/annonces");
    }
  }, [token, user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const value = target.type === "checkbox" ? target.checked : target.value;
    setForm({ ...form, [target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErreur("");

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      if (photos) {
        Array.from(photos).forEach((photo) => {
          formData.append("photos", photo);
        });
      }

      await api.post("/annonces/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      router.push("/annonces");
    } catch (err: any) {
      setErreur(err.response?.data?.detail || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const localiserAdresse = async () => {
    if (!form.ville && !form.quartier) {
      alert("Veuillez d'abord saisir la ville et le quartier");
      return;
    }
    setLocalisationLoading(true);
    setLocalisationMessage("");
    try {
      const adresse = `${form.ruelle || ""} ${form.quartier || ""} ${form.ville} Congo`.trim();
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(adresse)}&format=json&limit=1`,
        { headers: { "Accept-Language": "fr" } }
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setCentreCarte([parseFloat(lat), parseFloat(lon)]);
        setForm({
          ...form,
          latitude: lat,
          longitude: lon,
          adresse_complete: display_name,
        });
        setLocalisationMessage("✅ Adresse trouvée ! Ajustez le marqueur si besoin.");
      } else {
        setLocalisationMessage("⚠️ Adresse non trouvée. Pointez manuellement sur la carte.");
      }
    } catch {
      setLocalisationMessage("⚠️ Erreur de géocodage. Pointez manuellement.");
    } finally {
      setLocalisationLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Publier une annonce
        </h1>
        <p className="text-gray-500 mb-8">
          Remplissez les informations de votre logement
        </p>

        {erreur && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {erreur}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Infos de base */}
          <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <h2 className="font-bold text-gray-700">Informations générales</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre de l'annonce
              </label>
              <input
                type="text"
                name="titre"
                value={form.titre}
                onChange={handleChange}
                required
                placeholder="Ex: Belle villa à Bacongo"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Décrivez votre logement..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix (FCFA/mois)
                </label>
                <input
                  type="number"
                  name="prix"
                  value={form.prix}
                  onChange={handleChange}
                  required
                  placeholder="150000"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de chambres
                </label>
                <input
                  type="number"
                  name="nb_chambres"
                  value={form.nb_chambres}
                  onChange={handleChange}
                  required
                  placeholder="3"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville
                </label>
                <select
                  name="ville"
                  value={form.ville}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Choisir une ville</option>
                  <option value="Brazzaville">Brazzaville</option>
                  <option value="Pointe-Noire">Pointe-Noire</option>
                  <option value="Dolisie">Dolisie</option>
                  <option value="Ouesso">Ouesso</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quartier
                </label>
                <input
                  type="text"
                  name="quartier"
                  value={form.quartier}
                  onChange={handleChange}
                  placeholder="Ex: Bacongo"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ruelle / Avenue
              </label>
              <input
                type="text"
                name="ruelle"
                value={form.ruelle}
                onChange={handleChange}
                placeholder="Ex: Avenue de la Paix"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de logement
              </label>
              <select
                name="type_logement"
                value={form.type_logement}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Choisir un type</option>
                <option value="villa">Villa</option>
                <option value="appartement">Appartement</option>
                <option value="studio">Studio</option>
                <option value="chambre">Chambre</option>
              </select>
            </div>
          </div>

          {/* Équipements */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-4">Équipements</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "toilette_interieure", label: "🚽 Toilette intérieure" },
                { name: "douche_interieure", label: "🚿 Douche intérieure" },
                { name: "cuisine_interieure", label: "🍳 Cuisine intérieure" },
                { name: "eau_courante", label: "💧 Eau courante" },
                { name: "electricite", label: "⚡ Électricité" },
                { name: "meuble", label: "🛋️ Meublé" },
                { name: "climatisation", label: "❄️ Climatisation" },
                { name: "parking", label: "🚗 Parking" },
                { name: "cloture", label: "🔒 Clôture" },
                { name: "gardien", label: "👮 Gardien" },
              ].map((eq) => (
                <label
                  key={eq.name}
                  className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-green-50 transition"
                >
                  <input
                    type="checkbox"
                    name={eq.name}
                    checked={(form as any)[eq.name]}
                    onChange={handleChange}
                    className="w-4 h-4 accent-green-600"
                  />
                  <span className="text-sm text-gray-700">{eq.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Localisation */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-2">📍 Localisation</h2>
            <p className="text-sm text-gray-500 mb-4">
              Entrez le quartier et la ruelle puis cliquez sur "Localiser" ou pointez directement sur la carte.
            </p>

            <button
              type="button"
              onClick={localiserAdresse}
              disabled={localisationLoading}
              className="w-full py-3 border border-green-600 text-green-600 rounded-xl font-medium hover:bg-green-50 transition mb-4 disabled:opacity-50"
            >
              {localisationLoading ? "Recherche en cours..." : "🔍 Localiser automatiquement"}
            </button>

            {localisationMessage && (
              <p className="text-sm mb-3 text-gray-600">{localisationMessage}</p>
            )}

            <CarteWrapper
              centre={centreCarte}
              zoom={14}
              hauteur="300px"
              markers={
                form.latitude && form.longitude
                  ? [{ lat: Number(form.latitude), lng: Number(form.longitude) }]
                  : []
              }
              onClic={(lat, lng) => {
                setForm({
                  ...form,
                  latitude: String(lat),
                  longitude: String(lng),
                });
                setLocalisationMessage("✅ Position sélectionnée manuellement.");
              }}
            />
            {form.latitude && form.longitude && (
              <p className="text-xs text-green-600 mt-2">
                ✅ Position : {Number(form.latitude).toFixed(4)},{" "}
                {Number(form.longitude).toFixed(4)}
              </p>
            )}
          </div>

          {/* Photos */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-4">Photos</h2>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setPhotos(e.target.files)}
              className="w-full px-4 py-3 border border-dashed border-gray-300 rounded-xl text-gray-500 cursor-pointer hover:border-green-500 transition"
            />
            {photos && (
              <p className="text-sm text-green-600 mt-2">
                ✅ {photos.length} photo(s) sélectionnée(s)
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Publication en cours..." : "Publier l'annonce"}
          </button>
        </form>
      </div>
    </main>
  );
}