// lib/axios.js - Optimized axios instance
import axios from "axios";
import { getAuthToken, expireSession } from "@/utils/SessionHelper";
import { BASE_URL } from "@/utils/confiq";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  timeout: 120000, // 120 seconds for slower submit/quote/accept flows
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

    if (status === 401 && typeof window !== "undefined" && getAuthToken()) {
      const url = error.config?.url || "";
      const isPublicAuthCall = /(?:^|\/)(?:login|customer\/|forgot-password|reset-password|verify-reset-otp|resend-reset-otp|auth\/)/.test(url);
      if (!isPublicAuthCall) {
        expireSession();
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
