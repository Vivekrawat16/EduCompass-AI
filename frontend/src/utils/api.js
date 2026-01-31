import axios from 'axios';

// Create an Axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api'),
    withCredentials: true, // Send cookies with requests
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;
