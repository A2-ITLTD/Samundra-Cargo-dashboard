export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const UPLOADS_URL = BASE_URL.replace(/\/api\/v1\/?$/, "");

export const uploadsImg = (path = "") =>
  `${UPLOADS_URL}/uploads/${String(path).replace(/^\/+/, "")}`;
