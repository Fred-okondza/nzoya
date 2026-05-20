import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// Intercepteur — ajoute le token JWT automatiquement
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Ne pas forcer le Content-Type pour FormData
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

export default api;