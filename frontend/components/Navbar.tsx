"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function Navbar() {
  const router = useRouter();
  const { user, token, setUser, logout } = useAuthStore();
  const [menuOuvert, setMenuOuvert] = useState(false);

  useEffect(() => {
    const chargerProfil = async () => {
      if (token && !user) {
        try {
          const { data } = await api.get("/auth/profil");
          setUser(data);
        } catch {
          logout();
        }
      }
    };
    chargerProfil();
  }, [token]);

  const handleLogout = () => {
    logout();
    setMenuOuvert(false);
    router.push("/");
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-8 py-4">
        {/* Logo */}
        <Link href="/" className="text-xl md:text-2xl font-bold text-green-700">
          NzoYa 🏠
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              {user.role === "proprietaire" && (
                <Link
                  href="/publier"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                >
                  + Publier
                </Link>
              )}
              <Link
                href="/messages"
                className="px-4 py-2 text-gray-600 font-medium hover:text-green-700 transition"
              >
                💬 Messages
              </Link>
              <span className="text-gray-600 text-sm">
                Bonjour, <span className="font-semibold text-green-700">{user.nom}</span>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOuvert(!menuOuvert)}
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
        >
          {menuOuvert ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOuvert && (
        <div className="md:hidden border-t border-gray-100 px-4 py-4 flex flex-col gap-3">
          {user ? (
            <>
              <p className="text-gray-600 text-sm">
                Bonjour, <span className="font-semibold text-green-700">{user.nom}</span>
              </p>
              {user.role === "proprietaire" && (
                <Link
                  href="/publier"
                  onClick={() => setMenuOuvert(false)}
                  className="px-4 py-3 bg-green-600 text-white rounded-xl font-medium text-center"
                >
                  + Publier une annonce
                </Link>
              )}
              <Link
                href="/messages"
                onClick={() => setMenuOuvert(false)}
                className="px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium text-center"
              >
                💬 Mes messages
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-3 border border-red-200 text-red-600 rounded-xl font-medium"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/connexion"
                onClick={() => setMenuOuvert(false)}
                className="px-4 py-3 border border-green-600 text-green-600 rounded-xl font-medium text-center"
              >
                Connexion
              </Link>
              <Link
                href="/auth/inscription"
                onClick={() => setMenuOuvert(false)}
                className="px-4 py-3 bg-green-600 text-white rounded-xl font-medium text-center"
              >
                S'inscrire gratuitement
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}