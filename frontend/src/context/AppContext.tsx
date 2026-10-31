import React, { createContext, useCallback, useContext, useState } from 'react';
import { User, Client, DocumentItem, AuditLogItem, ChatMessage, Citation, ChatSession } from '../types';
import { API_BASE_URL } from '../config';
import {
  askQuestion,
  sendFeedback,
  createClient as createClientRequest,
  createUser as createUserRequest,
  getDocuments,
  getAuditLogs,
  getUsers,
  login,
  logout,
  updateUserAssignments,
  uploadDocument,
  type ApiDocument,
  type ApiAuditLog,
  type ApiIdentity,
  type ApiUser,
} from '../api';

interface AppContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  loginUser: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logoutUser: () => Promise<void>;
  users: User[];
  clients: Client[];
  documents: DocumentItem[];
  auditLogs: AuditLogItem[];
  chatHistory: ChatMessage[];
  activeCitations: Citation[];
  chatSessions: ChatSession[];
  activeSessionId: string;
  selectSession: (sessionId: string) => void;
  createNewChat: () => void;
  addChatMessage: (text: string) => Promise<void>;
  submitFeedback: (messageId: string, auditLogId: string, feedback: 'thumbs_up' | 'thumbs_down') => Promise<void>;
  clearChat: () => void;
  refreshAuditLogs: () => Promise<void>;
  addDocument: (file: File, clientId: string, version: string) => Promise<{ success: boolean; message: string }>;
  updateUserClientAssignment: (userId: string, clientId: string) => Promise<{ success: boolean; message?: string }>;
  addUser: (userData: { name: string; email: string; role: 'staff' | 'admin'; password: string; clientId: string }) => Promise<{ success: boolean; message?: string }>;
  addClient: (clientData: { name: string; tier: string }) => Promise<{ success: boolean; message?: string; clientId?: string }>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function mapApiDocument(document: ApiDocument, clients: Client[], uploadedBy: string): DocumentItem {
  const client = clients.find((item) => item.id === document.client_id);
  const extension = document.name.split('.').pop()?.toUpperCase();
  const status = document.status === 'indexed' && !document.is_active
    ? 'superseded'
    : document.status === 'indexed' || document.status === 'processing' || document.status === 'failed'
      ? document.status
      : 'failed';
  return {
    id: document.id,
    name: document.name,
    clientId: document.client_id,
    clientName: client?.name || 'Authorized client',
    version: document.version,
    type: extension === 'DOCX' ? 'DOCX' : 'PDF',
    fileSize: 'Stored securely',
    indexedChunks: document.chunk_count,
    status,
    uploadedAt: document.created_at ? new Date(document.created_at).toLocaleDateString() : 'Recently',
    uploadedBy,
  };
}

function mapApiUser(account: ApiUser): User {
  const client = account.clients[0];
  return {
    id: account.id,
    name: account.display_name,
    email: account.email,
    role: account.role,
    avatarInitials: account.display_name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
    assignedClientId: client?.id || '',
    assignedClientName: account.clients.map((item) => item.name).join(', ') || 'No client assigned',
    assignedClientTier: client?.tier || '—',
    status: account.active ? 'active' : 'suspended',
  };
}

function mapApiAuditLog(log: ApiAuditLog): AuditLogItem {
  return {
    id: log.id,
    timestamp: new Date(log.timestamp).toLocaleString(),
    user: log.user,
    userRole: log.user_role,
    clientScope: log.client_scope,
    query: log.query,
    retrievedSources: log.retrieved_sources,
    status: log.status === 'answered' || log.status === 'allowed'
      ? 'allowed'
      : log.status === 'blocked'
        ? 'blocked'
        : log.status === 'error'
          ? 'error'
          : 'refused',
    feedback: log.feedback || null,
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('login');

  // Chat sessions state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [activeCitations, setActiveCitations] = useState<Citation[]>([]);

  const refreshAuditLogs = useCallback(async () => {
    if (currentUser?.role !== 'admin') return;
    try {
      setAuditLogs((await getAuditLogs()).map(mapApiAuditLog));
    } catch {
      setAuditLogs([]);
    }
  }, [currentUser]);

  // The current FastAPI service exposes only / and /health. Authentication must
  // not be simulated in the browser: a local identity, role, or client is not authority.
  const loginUser = async (email: string, password: string) => {
    try {
      const identity: ApiIdentity = await login(email, password);
      const assignedClients = identity.clients.map((client) => ({
        id: client.id,
        name: client.name,
        tier: client.tier,
        logoInitial: client.name.slice(0, 1).toUpperCase(),
        activeDocumentsCount: 0,
        lastUpdated: '—',
      }));
      const client = assignedClients[0];
      if (!client && identity.role !== 'admin') {
        await logout();
        return { success: false, error: 'Your account has no client assignment.' };
      }
      setClients(assignedClients);
      const serverDocuments = await getDocuments();
      setDocuments(serverDocuments.map((document) => mapApiDocument(document, assignedClients, identity.display_name)));
      if (identity.role === 'admin') {
        const [serverUsers, serverAuditLogs] = await Promise.all([getUsers(), getAuditLogs()]);
        setUsers(serverUsers.map(mapApiUser));
        setAuditLogs(serverAuditLogs.map(mapApiAuditLog));
      } else {
        setUsers([]);
        setAuditLogs([]);
      }
      const user: User = { id: identity.id, name: identity.display_name, email: identity.email, role: identity.role,
        avatarInitials: identity.display_name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
        assignedClientId: client?.id || '', assignedClientName: client?.name || 'No client assigned', assignedClientTier: client?.tier || '—' };
      setCurrentUser(user);
      setAuditLogs([]);
      setChatSessions([]);
      setActiveTab(identity.role === 'admin' ? 'dashboard' : 'chat');
      setChatHistory([]); setActiveCitations([]); setActiveSessionId('');
      return { success: true };
    } catch (error) {
      await logout();
      return { success: false, error: error instanceof Error ? error.message : `Unable to sign in to ${API_BASE_URL}` };
    }
  };

  const logoutUser = async () => {
    await logout();
    setCurrentUser(null);
    setActiveTab('login');
    setUsers([]); setClients([]); setDocuments([]); setAuditLogs([]);
  };

  const selectSession = (sessionId: string) => {
    const sess = chatSessions.find((s) => s.id === sessionId);
    if (sess && sess.clientId === currentUser?.assignedClientId) {
      setActiveSessionId(sess.id);
      setChatHistory(sess.messages);
      setActiveCitations(sess.activeCitations);
    }
  };

  const createNewChat = () => {
    const newId = `sess-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: 'New Conversation',
      timestamp: 'Just now',
      clientId: currentUser?.assignedClientId || '',
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          timestamp: 'Just now',
          text: `Hello ${currentUser?.name || 'there'}! I am KnowBridge Assistant. Ask me any procedural or contractual questions grounded in **${currentUser?.assignedClientName}** documents.`,
        },
      ],
      activeCitations: [],
    };
    setChatSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setChatHistory(newSession.messages);
    setActiveCitations([]);
  };

  const updateUserClientAssignment = async (userId: string, clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return { success: false, message: 'Select an authorized client.' };
    try {
      const updated = mapApiUser(await updateUserAssignments(userId, [clientId]));
      setUsers((previous) => previous.map((account) => account.id === updated.id ? updated : account));
      if (currentUser?.id === userId) setCurrentUser(updated);
      return { success: true };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Assignment update failed.' };
    }
  };

  const addUser = async (userData: { name: string; email: string; role: 'staff' | 'admin'; password: string; clientId: string }) => {
    try {
      const created = mapApiUser(await createUserRequest({
        email: userData.email,
        display_name: userData.name,
        role: userData.role,
        password: userData.password,
        client_ids: [userData.clientId],
      }));
      setUsers((previous) => [created, ...previous.filter((account) => account.id !== created.id)]);
      return { success: true };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'User creation failed.' };
    }
  };

  const addClient = async (clientData: { name: string; tier: string }) => {
    try {
      const created = await createClientRequest(clientData.name, clientData.tier);
      const client: Client = { ...created, logoInitial: created.name.slice(0, 1).toUpperCase(), activeDocumentsCount: 0, lastUpdated: 'Just added' };
      setClients((previous) => [...previous, client]);
      if (currentUser?.role === 'admin' && !currentUser.assignedClientId) {
        setCurrentUser({ ...currentUser, assignedClientId: client.id, assignedClientName: client.name, assignedClientTier: client.tier });
      }
      setUsers((await getUsers()).map(mapApiUser));
      return { success: true, clientId: client.id };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Client creation failed.' };
    }
  };

  const addDocument = async (file: File, clientId: string, version: string) => {
    try {
      const record = await uploadDocument(file, clientId, version);
      const uploaded = mapApiDocument(record, clients, currentUser?.name || 'Admin');
      setDocuments((previous) => [uploaded, ...previous.filter((item) => item.id !== uploaded.id)]);
      return { success: true, message: `Indexed ${uploaded.name} (${uploaded.indexedChunks} chunks).` };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Document upload failed.' };
    }
  };

  const clearChat = () => {
    setChatHistory([]);
    setActiveCitations([]);
    setChatSessions((sessions) =>
      sessions.map((session) =>
        session.id === activeSessionId
          ? { ...session, messages: [], activeCitations: [] }
          : session
      )
    );
  };

  const addChatMessage = async (query: string) => {
    if (!currentUser) return;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatHistory((history) => [...history, { id: `msg-${Date.now()}`, sender: 'user', timestamp, text: query }]);
    try {
      const result = await askQuestion(query);
      const citations = result.citations.map((citation, index) => ({ id: index + 1, title: citation.document_name,
        version: citation.version, location: [citation.page && `Page ${citation.page}`, citation.section].filter(Boolean).join(', ') || 'Location unavailable',
        excerpt: citation.excerpt || '', client: currentUser.assignedClientName }));
      const message: ChatMessage = { id: `msg-${Date.now()}`, sender: 'assistant', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: result.answer, citations, isRefusal: result.state === 'insufficient_evidence', hasConflict: result.conflict_detected, auditLogId: result.audit_log_id };
      setChatHistory((history) => [...history, message]); setActiveCitations(citations);
      if (currentUser.role === 'admin') await refreshAuditLogs();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to reach KnowBridge.';
      setChatHistory((history) => [...history, { id: `msg-${Date.now()}`, sender: 'assistant', timestamp, text: `Unable to answer: ${message}`, isRefusal: true }]);
      setActiveCitations([]);
      if (currentUser.role === 'admin') await refreshAuditLogs();
    }
  };

  const submitFeedback = async (messageId: string, auditLogId: string, feedback: 'thumbs_up' | 'thumbs_down') => {
    try {
      await sendFeedback(auditLogId, feedback);
      setChatHistory((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, feedback } : msg))
      );
      if (currentUser?.role === 'admin') await refreshAuditLogs();
    } catch (err) {
      console.error('Failed to submit feedback', err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated: currentUser !== null,
        loginUser,
        logoutUser,
        users,
        clients,
        documents,
        auditLogs,
        chatHistory,
        activeCitations,
        chatSessions,
        activeSessionId,
        selectSession,
        createNewChat,
        addChatMessage,
        submitFeedback,
         clearChat,
         refreshAuditLogs,
        addDocument,
         updateUserClientAssignment,
         addUser,
         addClient,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
