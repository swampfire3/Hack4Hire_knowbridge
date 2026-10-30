import React from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { ChatPage } from './pages/ChatPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { AccessControlPage } from './pages/AccessControlPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { LoginPage } from './pages/LoginPage';

export const App: React.FC = () => {
  const { isAuthenticated, activeTab } = useApp();

  // If not authenticated or on login tab, strictly show the Login Page
  if (!isAuthenticated || activeTab === 'login') {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#1C1714] text-[#F3E8D5] flex flex-col">
      <Header />
      <main className="pt-16 flex-1 flex flex-col bg-[#1C1714]">
        {activeTab === 'dashboard' && <AdminDashboardPage />}
        {activeTab === 'chat' && <ChatPage />}
        {activeTab === 'documents' && <DocumentsPage />}
        {activeTab === 'users' && <UserManagementPage />}
        {activeTab === 'access' && <AccessControlPage />}
        {activeTab === 'audit' && <AuditLogsPage />}
      </main>
    </div>
  );
};

export default App;
