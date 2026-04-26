import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:6600/api",
});

axiosInstance.interceptors.request.use((config) => {
  const session = localStorage.getItem("docshield_session");
  if (session) {
    try {
      const parsed = JSON.parse(session);
      if (parsed?.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    } catch {
      // ignore bad local state
    }
  }
  return config;
});

export default axiosInstance;
