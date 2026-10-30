/** Base URL for the local FastAPI service. No tenant identifier belongs here. */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
