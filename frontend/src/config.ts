// API URL configuration
export const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://filmify-ai-webservice.onrender.com" // Production backend URL
    : "http://localhost:5000"; // Development backend URL
