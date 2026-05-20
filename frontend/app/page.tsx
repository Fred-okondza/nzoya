import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-green-700">NzoYa 🏠</h1>
        <div className="flex gap-4">
          <Link
            href="/auth/connexion"
            className="px-4 py-2 text-green-700 font-medium hover:underline"
          >
            Connexion
          </Link>
          <Link
            href="/auth/inscription"
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
          >
            S'inscrire
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-24">
        <h2 className="text-5xl font-extrabold text-gray-800 mb-4">
          Trouvez votre maison <br />
          <span className="text-green-600">au Congo 🇨🇬</span>
        </h2>
        <p className="text-xl text-gray-500 mb-10 max-w-xl">
          NzoYa connecte propriétaires et locataires à Brazzaville,
          Pointe-Noire et partout au Congo.
        </p>

        {/* Barre de recherche */}
        <div className="flex gap-3 bg-white p-3 rounded-2xl shadow-lg w-full max-w-2xl">
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
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
          >
            Rechercher
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="flex justify-center gap-16 py-12">
        {[
          { label: "Annonces", value: "500+" },
          { label: "Villes", value: "4" },
          { label: "Propriétaires", value: "200+" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-4xl font-extrabold text-green-600">{stat.value}</p>
            <p className="text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* CTA Propriétaire */}
      <section className="flex justify-center py-12">
        <div className="bg-green-600 text-white rounded-2xl px-12 py-10 text-center max-w-xl">
          <h3 className="text-2xl font-bold mb-3">Vous êtes propriétaire ?</h3>
          <p className="mb-6 text-green-100">
            Publiez votre annonce gratuitement et trouvez des locataires sérieux.
          </p>
          <Link
            href="/auth/inscription"
            className="px-6 py-3 bg-white text-green-700 rounded-xl font-semibold hover:bg-green-50 transition"
          >
            Publier une annonce
          </Link>
        </div>
      </section>
    </main>
  );
}