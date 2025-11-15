// src/services/api.js
import axios from "axios";

// Set your backend API base URL
const resolveBaseURL = () => {
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }

  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    const path = window.location.pathname || "";

    if (path.startsWith("/resort")) {
      return `${origin}/api`;
    }
  }

  return process.env.NODE_ENV === "production"
    ? "https://www.teqmates.com/api"
    : "http://localhost:8000/api";
};

const API = axios.create({
  baseURL: resolveBaseURL(),
});

// Automatically add token to headers
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;

