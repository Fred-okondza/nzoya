"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import Navbar from "@/components/Navbar";

interface Conversation {
  id: number;
  annonce: { id: number; titre: string; prix: number; ville: string };
  locataire: { id: number; nom: string };
  proprietaire: { id: number; nom: string };
  messages: { contenu: string; created_at: string }[];
  created_at: string;
}

export default function Messages() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push("/auth/connexion");
      return;
    }
    chargerConversations();
  }, [token]);

  const chargerConversations = async () => {
    try {
      const { data } = await api.get("/chat/conversations");
      setConversations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          💬 Mes messages
        </h1>

        {loading ? (
          <div className="text-center text-gray-500 py-20">
            Chargement...
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            <p className="text-4xl mb-4">💬</p>
            <p>Aucune conversation pour le moment.</p>
            <Link
              href="/annonces"
              className="mt-4 inline-block text-green-600 font-medium hover:underline"
            >
              Parcourir les annonces
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {conversations.map((conv) => {
              const interlocuteur = user?.role === "locataire"
                ? conv.proprietaire
                : conv.locataire;
              const dernierMessage = conv.messages[conv.messages.length - 1];

              return (
                <Link key={conv.id} href={`/messages/${conv.id}`}>
                  <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">
                          {interlocuteur.nom.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {interlocuteur.nom}
                          </p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {dernierMessage
                              ? dernierMessage.contenu
                              : "Conversation démarrée"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">
                          {new Date(conv.created_at).toLocaleDateString("fr-FR")}
                        </p>
                        <p className="text-xs text-green-600 mt-1 truncate max-w-32">
                          🏠 {conv.annonce.titre}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}