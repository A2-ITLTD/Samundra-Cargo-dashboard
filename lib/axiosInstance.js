// lib/axios.js - Optimized axios instance
import axios from "axios";
import { getAuthToken, logout } from "@/utils/SessionHelper";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  timeout: 45000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    config.metadata = { startedAt: Date.now() };
    if (typeof window !== "undefined") {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    const duration = Date.now() - (response.config.metadata?.startedAt || Date.now());
    if (duration >= 3000) {
      const url = response.config.url?.split('?')[0];
      console.warn(`[API slow] ${response.config.method?.toUpperCase()} ${url} took ${duration}ms`);
    }
    return response;
  },
  (error) => {
    const duration = Date.now() - (error.config?.metadata?.startedAt || Date.now());
    if (error.config) {
      const url = error.config.url?.split('?')[0];
      const detail = error.response?.data?.message || error.response?.data?.error || error.code || error.message;
      console.error(`[API failed] ${error.config.method?.toUpperCase()} ${url} after ${duration}ms (HTTP ${error.response?.status || 'network'})`, detail);
    }
    const status = error.response?.status;

    if (status === 401 && typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      if (currentPath !== "/") {
        logout();
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
