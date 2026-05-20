"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import Navbar from "@/components/Navbar";

interface Message {
  id: number;
  contenu: string;
  expediteur_id: number;
  conversation_id: number;
  created_at: string;
  lu: boolean;
}

interface Conversation {
  id: number;
  annonce: { id: number; titre: string; prix: number; ville: string };
  locataire: { id: number; nom: string };
  proprietaire: { id: number; nom: string };
  messages: Message[];
}

export default function Chat() {
  const { id } = useParams();
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contenu, setContenu] = useState("");
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) {
      router.push("/auth/connexion");
      return;
    }
    chargerConversation();
  }, [token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const chargerConversation = async () => {
    try {
      const { data } = await api.get(`/chat/conversations/${id}`);
      setConversation(data);
      setMessages(data.messages);

      // Connexion WebSocket
      if (user) {
        const ws = new WebSocket(
          `ws://127.0.0.1:8000/chat/ws/${id}/${user.id}`
        );
        ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          setMessages((prev) => {
            const existe = prev.find((m) => m.id === message.id);
            if (existe) return prev;
            return [...prev, message];
          });
        };
        wsRef.current = ws;
      }
    } catch {
      router.push("/messages");
    } finally {
      setLoading(false);
    }
  };

  const envoyerMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contenu.trim()) return;

    try {
      await api.post(`/chat/conversations/${id}/messages`, { contenu });
      setContenu("");
    } catch (err) {
      console.error(err);
    }
  };

  // Cleanup WebSocket
  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  if (!conversation) return null;

  const interlocuteur = user?.role === "locataire"
    ? conversation.proprietaire
    : conversation.locataire;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Header conversation */}
      <div className="bg-white border-b px-8 py-4 flex items-center gap-4">
        <button
          onClick={() => router.push("/messages")}
          className="text-green-600 hover:underline text-sm"
        >
          ← Retour
        </button>
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">
          {interlocuteur.nom.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{interlocuteur.nom}</p>
          <p className="text-xs text-gray-500">
            🏠 {conversation.annonce.titre} —{" "}
            {conversation.annonce.prix.toLocaleString()} FCFA/mois
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-3 max-h-[calc(100vh-250px)]">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            Commencez la conversation !
          </div>
        ) : (
          messages.map((message) => {
            const estMoi = message.expediteur_id === user?.id;
            return (
              <div
                key={message.id}
                className={`flex ${estMoi ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-2xl text-sm ${
                    estMoi
                      ? "bg-green-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 shadow-sm rounded-bl-none"
                  }`}
                >
                  <p>{message.contenu}</p>
                  <p
                    className={`text-xs mt-1 ${
                      estMoi ? "text-green-100" : "text-gray-400"
                    }`}
                  >
                    {new Date(message.created_at).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input message */}
      <div className="bg-white border-t px-8 py-4">
        <form onSubmit={envoyerMessage} className="flex gap-3">
          <input
            type="text"
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            placeholder="Écrire un message..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            disabled={!contenu.trim()}
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50"
          >
            Envoyer
          </button>
        </form>
      </div>
    </main>
  );
}