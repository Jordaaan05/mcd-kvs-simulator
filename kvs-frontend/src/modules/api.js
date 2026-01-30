/**
 * Automatically assign the authentication token to each request to ensure that A) a secure transaction takes place and
 * B) so the user information can be securely accessed on the backend.
 */

import axios from "axios";

const api = axios.create({
    baseURL: `http://${process.env.REACT_APP_SERVER_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}`,
});

api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config
    },
    (error) => Promise.reject(error)
);

export default api;