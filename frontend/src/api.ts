import { API_BASE_URL } from './config';

let accessToken: string | null = null;

type ApiError = Error & { status?: number };

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData) && init.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });
  if (!response.ok) {
    const error = new Error((await response.json().catch(() => null))?.detail || 'Request failed') as ApiError;
    error.status = response.status;
    throw error;
  }
  return response.status === 204 ? (undefined as T) : response.json() as Promise<T>;
}

export interface ApiIdentity { id: string; email: string; display_name: string; role: 'staff' | 'admin'; capabilities: string[]; clients: Array<{ id: string; name: string; tier: string }>; }
export interface ApiCitation { id: string; document_name: string; version: string; page?: number; section?: string; excerpt?: string; }
export interface ApiChatResponse { state: 'answered' | 'insufficient_evidence' | 'error'; answer: string; citations: ApiCitation[]; conflict_detected: boolean; }
export interface ApiDocument { id: string; name: string; client_id: string; version: string; media_type: string; status: string; is_active: boolean; chunk_count: number; created_at?: string | null; }
export interface ApiUser { id: string; email: string; display_name: string; role: 'staff' | 'admin'; active: boolean; clients: Array<{ id: string; name: string; tier: string }>; }
export interface ApiAuditLog { id: string; timestamp: string; user: string; user_role: string; client_scope: string; query: string; retrieved_sources: string[]; status: string; }

export async function login(email: string, password: string): Promise<ApiIdentity> {
  const token = await request<{ access_token: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  accessToken = token.access_token;
  try { return await request<ApiIdentity>('/me'); } catch (error) { accessToken = null; throw error; }
}
export async function logout(): Promise<void> { try { if (accessToken) await request<void>('/auth/logout', { method: 'POST' }); } finally { accessToken = null; } }
export const askQuestion = (question: string) => request<ApiChatResponse>('/chat/query', { method: 'POST', body: JSON.stringify({ question }) });
export const getDocuments = () => request<ApiDocument[]>('/documents');
export const getUsers = () => request<ApiUser[]>('/users');
export const getAuditLogs = () => request<ApiAuditLog[]>('/audit');
export const createClient = (name: string, tier: string) => request<ApiIdentity['clients'][number]>('/clients', {
  method: 'POST', body: JSON.stringify({ name, tier }),
});
export const createUser = (input: { email: string; display_name: string; role: 'staff' | 'admin'; password: string; client_ids: string[] }) =>
  request<ApiUser>('/users', { method: 'POST', body: JSON.stringify(input) });
export const updateUserAssignments = (userId: string, clientIds: string[]) =>
  request<ApiUser>(`/users/${encodeURIComponent(userId)}/assignments`, {
    method: 'PUT', body: JSON.stringify({ client_ids: clientIds }),
  });
export function uploadDocument(file: File, clientId: string, version: string) {
  const form = new FormData();
  form.append('file', file);
  const params = new URLSearchParams({ client_id: clientId, version });
  return request<ApiDocument>(`/documents/upload?${params.toString()}`, { method: 'POST', body: form });
}
