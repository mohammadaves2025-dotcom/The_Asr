import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

// In dev, VITE_API_URL=/api/v1 (proxied). In production use full URL.
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Single-flight refresh ────────────────────────────────────────────────────
// On first load, Header + HomePage (or Header + CategoryPage, etc.) fire
// several requests in parallel. If the token is expired, EVERY one of them
// used to hit /auth/refresh independently and at the same time. Sharing one
// in-flight promise means the first 401 triggers the refresh and every other
// concurrent 401 just waits on that same result instead of racing it.
let refreshPromise: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true })
      .then(({ data }) => {
        const newToken = data.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        return newToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const newToken = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
