export type UserRole = "proprietaire" | "locataire";

export interface User {
  id: number;
  nom: string;
  email: string;
  telephone: string | null;
  role: UserRole;
  est_verifie: boolean;
  created_at: string;
}

export interface Photo {
  id: number;
  url: string;
}

export interface Annonce {
  id: number;
  titre: string;
  description: string | null;
  prix: number;
  ville: string;
  quartier: string | null;
  type_logement: string;
  nb_chambres: number;
  est_disponible: boolean;
  est_verifie: boolean;
  latitude: number | null;
  longitude: number | null;

  // Sanitaires
  toilette_interieure: boolean;
  douche_interieure: boolean;
  cuisine_interieure: boolean;

  // Eau & Electricité
  eau_courante: boolean;
  electricite: boolean;

  // Confort
  meuble: boolean;
  climatisation: boolean;
  parking: boolean;
  cloture: boolean;
  gardien: boolean;

  created_at: string;
  proprietaire_id: number;
  photos: Photo[];
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface AnnonceFilters {
  ville?: string;
  quartier?: string;
  prix_min?: number;
  prix_max?: number;
  nb_chambres?: number;
  type_logement?: string;
  meuble?: boolean;
  toilette_interieure?: boolean;
  douche_interieure?: boolean;
}