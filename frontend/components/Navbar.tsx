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
  const [notifOuvert, setNotifOuvert] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [nonLues, setNonLues] = useState(0);

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

  useEffect(() => {
    if (token) {
      chargerNotifications();
      // Rafraîchir toutes les 30 secondes
      const interval = setInterval(chargerNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const chargerNotifications = async () => {
    try {
      const [notifs, count] = await Promise.all([
        api.get("/notifications/"),
        api.get("/notifications/non-lues"),
      ]);
      setNotifications(notifs.data);
      setNonLues(count.data.count);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    setMenuOuvert(false);
    router.push("/");
  };

  const marquerToutLu = async () => {
    try {
      await api.put("/notifications/lire-tout");
      setNonLues(0);
      setNotifications(notifications.map((n) => ({ ...n, lu: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="bg-white shadow-sm relative">
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

              {/* Cloche notifications */}
              <div className="relative">
                <button
                  onClick={() => {
                    setNotifOuvert(!notifOuvert);
                    setMenuOuvert(false);
                  }}
                  className="relative p-2 text-gray-600 hover:text-green-700 transition"
                >
                  🔔
                  {nonLues > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {nonLues > 9 ? "9+" : nonLues}
                    </span>
                  )}
                </button>

                {/* Dropdown notifications */}
                {notifOuvert && (
                  <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <h3 className="font-bold text-gray-800">Notifications</h3>
                      {nonLues > 0 && (
                        <button
                          onClick={marquerToutLu}
                          className="text-xs text-green-600 hover:underline"
                        >
                          Tout marquer lu
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">
                          Aucune notification
                        </p>
                      ) : (
                        notifications.map((notif) => (
                          <Link
                            key={notif.id}
                            href={notif.lien || "/messages"}
                            onClick={() => setNotifOuvert(false)}
                          >
                            <div
                              className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-50 transition ${
                                !notif.lu ? "bg-green-50" : ""
                              }`}
                            >
                              <p className="text-sm font-medium text-gray-800">
                                {notif.titre}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 truncate">
                                {notif.contenu}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notif.created_at).toLocaleTimeString(
                                  "fr-FR",
                                  { hour: "2-digit", minute: "2-digit" }
                                )}
                              </p>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/profil"
                className="text-gray-600 text-sm hover:text-green-700 transition"
              >
                Bonjour,{" "}
                <span className="font-semibold text-green-700">{user.nom}</span>
              </Link>
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

        {/* Mobile — cloche + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          {user && (
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOuvert(!notifOuvert);
                  setMenuOuvert(false);
                }}
                className="relative p-2 text-gray-600"
              >
                🔔
                {nonLues > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {nonLues > 9 ? "9+" : nonLues}
                  </span>
                )}
              </button>

              {/* Dropdown mobile */}
              {notifOuvert && (
                <div className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">Notifications</h3>
                    {nonLues > 0 && (
                      <button
                        onClick={marquerToutLu}
                        className="text-xs text-green-600 hover:underline"
                      >
                        Tout marquer lu
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-8">
                        Aucune notification
                      </p>
                    ) : (
                      notifications.map((notif) => (
                        <Link
                          key={notif.id}
                          href={notif.lien || "/messages"}
                          onClick={() => setNotifOuvert(false)}
                        >
                          <div
                            className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-50 transition ${
                              !notif.lu ? "bg-green-50" : ""
                            }`}
                          >
                            <p className="text-sm font-medium text-gray-800">
                              {notif.titre}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {notif.contenu}
                            </p>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => {
              setMenuOuvert(!menuOuvert);
              setNotifOuvert(false);
            }}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
          >
            {menuOuvert ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOuvert && (
        <div className="md:hidden border-t border-gray-100 px-4 py-4 flex flex-col gap-3">
          {user ? (
            <>
              <Link
                href="/profil"
                onClick={() => setMenuOuvert(false)}
                className="text-gray-600 text-sm font-medium"
              >
                Bonjour,{" "}
                <span className="font-semibold text-green-700">{user.nom}</span>
              </Link>
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
              <Link
                href="/profil"
                onClick={() => setMenuOuvert(false)}
                className="px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium text-center"
              >
                👤 Mon profil
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