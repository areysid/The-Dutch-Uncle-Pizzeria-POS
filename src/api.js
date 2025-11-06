import axios from 'axios';

// ✅ Use environment variable if available, else default to localhost
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : 'http://localhost:4000/api',
});

export default api;
