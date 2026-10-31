export type UserRole = 'staff' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarInitials: string;
  assignedClientId: string;
  assignedClientName: string;
  assignedClientTier: string;
  department?: string;
  status?: 'active' | 'suspended';
}

export interface Client {
  id: string;
  name: string;
  tier: string;
  logoInitial: string;
  activeDocumentsCount: number;
  lastUpdated: string;
}

export interface DocumentSource {
  id: string;
  title: string;
  version: string;
  page?: number | string;
  section?: string;
  client: string;
  excerpt?: string;
  isSuperseded?: boolean;
}

export interface Citation {
  id: number;
  title: string;
  version: string;
  location: string;
  excerpt: string;
  client: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  citations?: Citation[];
  hasConflict?: boolean;
  conflictDetails?: string;
  isRefusal?: boolean;
  auditLogId?: string;
  feedback?: 'thumbs_up' | 'thumbs_down';
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  messages: ChatMessage[];
  activeCitations: Citation[];
  clientId: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  userRole: string;
  clientScope: string;
  query: string;
  retrievedSources: string[];
  status: 'allowed' | 'blocked' | 'refused' | 'error';
  feedback?: 'thumbs_up' | 'thumbs_down' | null;
  executionTimeMs?: number;
}

export interface DocumentItem {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  version: string;
  type: 'PDF' | 'DOCX';
  fileSize: string;
  indexedChunks: number;
  status: 'indexed' | 'processing' | 'failed' | 'superseded';
  uploadedAt: string;
  uploadedBy: string;
}
