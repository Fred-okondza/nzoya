import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <Navbar />

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-16 md:py-24">
        <h2 className="text-3xl md:text-5xl font-extrabold text-gray-800 mb-4">
          Trouvez votre maison <br />
          <span className="text-green-600">au Congo 🇨🇬</span>
        </h2>
        <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-xl">
          NzoYa connecte propriétaires et locataires à Brazzaville,
          Pointe-Noire et partout au Congo.
        </p>

        {/* Barre de recherche */}
        <div className="flex flex-col md:flex-row gap-3 bg-white p-3 rounded-2xl shadow-lg w-full max-w-2xl">
          <select className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 focus:outline-none">
            <option value="">Toutes les villes</option>
            <option value="Brazzaville">Brazzaville</option>
            <option value="Pointe-Noire">Pointe-Noire</option>
            <option value="Dolisie">Dolisie</option>
            <option value="Ouesso">Ouesso</option>
          </select>
          <select className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 focus:outline-none">
            <option value="">Type de logement</option>
            <option value="villa">Villa</option>
            <option value="appartement">Appartement</option>
            <option value="studio">Studio</option>
            <option value="chambre">Chambre</option>
          </select>
          <Link
            href="/annonces"
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition text-center"
          >
            Rechercher
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="flex justify-center gap-8 md:gap-16 py-8 md:py-12">
        {[
          { label: "Annonces", value: "500+" },
          { label: "Villes", value: "4" },
          { label: "Propriétaires", value: "200+" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-3xl md:text-4xl font-extrabold text-green-600">{stat.value}</p>
            <p className="text-gray-500 mt-1 text-sm md:text-base">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* CTA Propriétaire */}
      <section className="flex justify-center px-4 py-8 md:py-12">
        <div className="bg-green-600 text-white rounded-2xl px-8 md:px-12 py-8 md:py-10 text-center w-full max-w-xl">
          <h3 className="text-xl md:text-2xl font-bold mb-3">Vous êtes propriétaire ?</h3>
          <p className="mb-6 text-green-100 text-sm md:text-base">
            Publiez votre annonce gratuitement et trouvez des locataires sérieux.
          </p>
          <Link
            href="/auth/inscription"
            className="px-6 py-3 bg-white text-green-700 rounded-xl font-semibold hover:bg-green-50 transition inline-block"
          >
            Publier une annonce
          </Link>
        </div>
      </section>
    </main>
  );
}