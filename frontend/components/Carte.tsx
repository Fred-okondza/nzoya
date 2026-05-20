"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix icône Leaflet
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface MarkerData {
  lat: number;
  lng: number;
  titre?: string;
  prix?: number;
}

interface CarteProps {
  centre?: [number, number];
  zoom?: number;
  markers?: MarkerData[];
  onClic?: (lat: number, lng: number) => void;
  hauteur?: string;
}

// Composant pour gérer les clics sur la carte
function GestionClic({ onClic }: { onClic?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onClic) {
        onClic(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function Carte({
  centre = [-4.2634, 15.2429], // Brazzaville par défaut
  zoom = 13,
  markers = [],
  onClic,
  hauteur = "400px",
}: CarteProps) {
  return (
    <MapContainer
      center={centre}
      zoom={zoom}
      style={{ height: hauteur, width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GestionClic onClic={onClic} />
      {markers.map((marker, index) => (
        <Marker key={index} position={[marker.lat, marker.lng]} icon={icon}>
          {(marker.titre || marker.prix) && (
            <Popup>
              {marker.titre && <p className="font-bold">{marker.titre}</p>}
              {marker.prix && (
                <p className="text-green-600">
                  {marker.prix.toLocaleString()} FCFA/mois
                </p>
              )}
            </Popup>
          )}
        </Marker>
      ))}
    </MapContainer>
  );
}