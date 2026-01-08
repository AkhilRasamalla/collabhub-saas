import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + "/api",
  withCredentials: true,
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject({
        message: "Server not reachable. Is backend running?",
      });
    }
    return Promise.reject(error);
  }
);

export default API;
