import axios from 'axios';
import useStore from '../store/useStore';

const envUrl = import.meta.env?.VITE_BACKEND_URL;
const API_BASE = (envUrl && envUrl !== 'undefined') ? envUrl : 'http://localhost:4000';

const api = axios.create({
    baseURL: `${API_BASE}/api`,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

// Attach access token on every request
api.interceptors.request.use((config) => {
    const token = useStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 — logout on expired/invalid token
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;
        const currentPath = typeof window.location.pathname === 'string' ? window.location.pathname : '';

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const store = useStore.getState();
            store.logout();

            // Only redirect if not already on login page
            if (!currentPath.startsWith('/login')) {
                import('sonner').then(({ toast }) => {
                    toast.error('Session Expired', {
                        description: 'Your session has expired. Please log in again.',
                    });
                });
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export default api;
export { API_BASE };
