"use client";

import dynamic from "next/dynamic";

const Carte = dynamic(() => import("./Carte"), {
  ssr: false,
  loading: () => (
    <div
      className="bg-gray-100 rounded-xl flex items-center justify-center"
      style={{ height: "400px" }}
    >
      <p className="text-gray-400">Chargement de la carte...</p>
    </div>
  ),
});

export default Carte;