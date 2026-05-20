"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { useEffect } from "react";
import api from "@/lib/api";

export default function Navbar() {
  const router = useRouter();
  const { user, token, setUser, logout } = useAuthStore();

  // Charger le profil si token présent mais user absent
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
    router.push("/");
  };

  return (
    <nav className="flex items-center justify-between px-8 py-5 bg-white shadow-sm">
      <Link href="/" className="text-2xl font-bold text-green-700">
        NzoYa 🏠
      </Link>

      <div className="flex items-center gap-4">
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
              href="/publier"
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
            >
              + Publier
            </Link>
            <Link
              href="/auth/connexion"
              className="px-4 py-2 text-green-700 font-medium hover:underline"
            >
              Connexion
            </Link>
            <Link
              href="/auth/inscription"
              className="px-4 py-2 border border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 transition"
            >
              S'inscrire
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}