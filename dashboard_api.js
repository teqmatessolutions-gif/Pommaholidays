// src/services/api.js
import axios from "axios";

export const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }

  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    const path = window.location.pathname || "";

    if (path.startsWith("/admin")) {
      return `${origin}/resortapi/api`;
    }

    if (path.startsWith("/pommaadmin")) {
      return `${origin}/pommaapi/api`;
    }
  }

  return process.env.NODE_ENV === "production"
    ? "https://www.teqmates.com/resortapi/api"
    : "http://localhost:8000/api";
};

// Set your backend API base URL
const API = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000, // 30 second timeout
});

// Automatically add token to headers
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Response interceptor to handle errors gracefully
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle timeout errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error("Request timeout:", error.config?.url);
      return Promise.reject({
        ...error,
        message: "Request timed out. The server is taking too long to respond.",
        isTimeout: true,
      });
    }
    
    // Handle network errors
    if (!error.response) {
      console.error("Network error:", error.message);
      return Promise.reject({
        ...error,
        message: "Network error. Please check your connection.",
        isNetworkError: true,
      });
    }
    
    // Handle 503 (Service Unavailable) - database connection issues
    if (error.response?.status === 503) {
      console.error("Service unavailable:", error.response?.data);
      return Promise.reject({
        ...error,
        message: "Service temporarily unavailable. Please try again in a moment.",
        isServiceUnavailable: true,
      });
    }
    
    // For other errors, return as-is
    return Promise.reject(error);
  }
);

export default API;

