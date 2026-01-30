import axios from 'axios';

// Create an Axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api'),
    withCredentials: true, // Send cookies with requests
    headers: {
        'Content-Type': 'application/json'
    }
});

// For Google Auth Redirection (since it's a window location change, not an AJAX request)
export const GOOGLE_AUTH_URL = `${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000')}/api/auth/google`;

export default api;
