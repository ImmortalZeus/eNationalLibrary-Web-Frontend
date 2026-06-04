// src/services/api.ts
import axios from "axios";

const api = axios.create({
  // Backend mounts every route under the global "api" prefix (main.ts: setGlobalPrefix('api'))
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
});

// Attach token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the server returns 401, clear the stored token
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("accessToken");
    }
    return Promise.reject(err);
  }
);

export default api;