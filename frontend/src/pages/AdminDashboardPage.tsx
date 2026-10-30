import React from 'react';
import { useApp } from '../context/AppContext';

export const AdminDashboardPage: React.FC = () => {
  const { clients, documents, users, auditLogs, setActiveTab } = useApp();

  const totalClients = clients.length;
  const totalDocs = documents.length;
  const activeStaff = users.filter((u) => u.role === 'staff').length;
  const totalQueries = auditLogs.length;

  const recentUploads = documents.slice(0, 4);
  const recentLogs = auditLogs.slice(0, 4);

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-8 selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-3 border-b border-[#3D3027]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8F7B68] mb-1">
            <span>KnowBridge Admin</span>
            <span>/</span>
            <span className="text-[#C9B9A5]">Platform Overview</span>
          </div>
          <h1 className="text-3xl font-bold text-[#F3E8D5] tracking-tight">Platform Dashboard</h1>
          <p className="text-xs md:text-sm text-[#C9B9A5] mt-1">
            Real-time multi-tenant health, document chunk indexing, and tenant isolation metrics
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#241D19] border border-[#3D3027] text-xs font-medium text-[#F3E8D5]">
            <span className="w-2 h-2 rounded-full bg-[#91A982] animate-pulse"></span>
            <span>Local RAG Engine Active</span>
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#342923] border border-[#58483B] text-[#D99A5E] text-xs font-bold">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Multi-Tenant Enforced</span>
          </div>
        </div>
      </div>

      {/* 4 Quick Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total clients */}
        <div className="bg-[#241D19] rounded-2xl p-6 border border-[#3D3027] flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8F7B68] uppercase tracking-wider">Authorized Clients</span>
            <span className="w-10 h-10 rounded-xl bg-[#342923] border border-[#44362D] flex items-center justify-center text-[#D99A5E]">
              <span className="material-symbols-outlined text-[20px]">domain</span>
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#F3E8D5] leading-none">{totalClients}</div>
            <div className="mt-2 text-[11px] text-[#B5C99F] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              <span>{totalClients === 0 ? 'Create a client to begin' : `${totalClients} active client tenant${totalClients === 1 ? '' : 's'}`}</span>
            </div>
          </div>
        </div>

        {/* Total documents */}
        <div className="bg-[#241D19] rounded-2xl p-6 border border-[#3D3027] flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8F7B68] uppercase tracking-wider">Indexed Documents</span>
            <span className="w-10 h-10 rounded-xl bg-[#342923] border border-[#44362D] flex items-center justify-center text-[#D99A5E]">
              <span className="material-symbols-outlined text-[20px]">description</span>
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#F3E8D5] leading-none">{totalDocs}</div>
            <div className="mt-2 text-[11px] text-[#D99A5E] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">auto_stories</span>
              <span>Digital PDF & DOCX corpus</span>
            </div>
          </div>
        </div>

        {/* Active Staff */}
        <div className="bg-[#241D19] rounded-2xl p-6 border border-[#3D3027] flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8F7B68] uppercase tracking-wider">Internal Staff</span>
            <span className="w-10 h-10 rounded-xl bg-[#342923] border border-[#44362D] flex items-center justify-center text-[#D99A5E]">
              <span className="material-symbols-outlined text-[20px]">group</span>
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#F3E8D5] leading-none">{activeStaff}</div>
            <div className="mt-2 text-[11px] text-[#C9B9A5] font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              <span>Bound to discrete client tenants</span>
            </div>
          </div>
        </div>

        {/* Total Queries & Audit */}
        <div className="bg-[#241D19] rounded-2xl p-6 border border-[#3D3027] flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8F7B68] uppercase tracking-wider">Audited Queries</span>
            <span className="w-10 h-10 rounded-xl bg-[#342923] border border-[#44362D] flex items-center justify-center text-[#D99A5E]">
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#F3E8D5] leading-none">{totalQueries}</div>
            <div className="mt-2 text-[11px] text-[#B5C99F] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">shield</span>
              <span>100% tenant boundary verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2 Column Section: Recent Uploads & Latest Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Uploaded Documents */}
        <div className="bg-[#241D19] border border-[#3D3027] rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#D99A5E] text-[20px]">folder</span>
                <h2 className="text-base font-bold text-[#F3E8D5]">Recent Ingested Documents</h2>
              </div>
              <button
                onClick={() => setActiveTab('documents')}
                className="text-xs font-bold text-[#D99A5E] hover:text-[#E0B765] transition-colors"
              >
                View all →
              </button>
            </div>

            {recentUploads.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#8F7B68]">
                No documents uploaded yet. Upload client procedures in the Documents tab.
              </div>
            ) : (
              <div className="space-y-3">
                {recentUploads.map((d) => (
                  <div
                    key={d.id}
                    className="p-3.5 rounded-2xl bg-[#1C1714] border border-[#342923] flex items-center justify-between hover:border-[#44362D] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#342923] text-[#D99A5E] flex items-center justify-center font-bold text-[10px] shrink-0">
                        {d.type}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#F3E8D5] truncate">{d.name}</div>
                        <div className="text-[11px] text-[#8F7B68] flex items-center gap-2 mt-0.5">
                          <span>{d.clientName}</span>
                          <span>•</span>
                          <span>{d.version}</span>
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#2A211B] text-[#B5C99F] border border-[#53684B]/40 shrink-0">
                      {d.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-[#342923] flex items-center justify-between text-xs text-[#8F7B68]">
            <span>Supported: Text-based PDF and DOCX files</span>
            <span>Target: Qdrant Vector Collection</span>
          </div>
        </div>

        {/* Latest Audit Logs */}
        <div className="bg-[#241D19] border border-[#3D3027] rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#D99A5E] text-[20px]">receipt_long</span>
                <h2 className="text-base font-bold text-[#F3E8D5]">Recent Audit Activity</h2>
              </div>
              <button
                onClick={() => setActiveTab('audit')}
                className="text-xs font-bold text-[#D99A5E] hover:text-[#E0B765] transition-colors"
              >
                Full logs →
              </button>
            </div>

            {recentLogs.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#8F7B68]">
                No query logs recorded yet. Questions asked in chat will be logged here with boundary status.
              </div>
            ) : (
              <div className="space-y-3">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-[#1C1714] border border-[#342923] flex items-center justify-between hover:border-[#44362D] transition-colors"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="text-xs font-semibold text-[#F3E8D5] truncate">&ldquo;{log.query}&rdquo;</div>
                      <div className="text-[11px] text-[#8F7B68] flex items-center gap-2 mt-0.5">
                        <span>{log.user} ({log.userRole})</span>
                        <span>•</span>
                        <span>Scope: {log.clientScope}</span>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                        log.status === 'allowed'
                          ? 'bg-[#2D3A2D] text-[#B5C99F] border-[#53684B]'
                          : log.status === 'blocked'
                          ? 'bg-[#402A25] text-[#E8A394] border-[#70473D]'
                          : 'bg-[#403323] text-[#E4BD72] border-[#755B36]'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-[#342923] flex items-center justify-between text-xs text-[#8F7B68]">
            <span>Audit trail is immutable & appended in PostgreSQL</span>
            <span>Tenant filtered</span>
          </div>
        </div>
      </div>
    </div>
  );
};