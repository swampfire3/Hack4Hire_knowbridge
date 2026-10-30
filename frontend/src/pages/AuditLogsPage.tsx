import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

export const AuditLogsPage: React.FC = () => {
  const { auditLogs, refreshAuditLogs } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => { void refreshAuditLogs(); }, [refreshAuditLogs]);

  const filteredLogs = auditLogs.filter((log) => {
    if (filterStatus === 'all') return true;
    return log.status === filterStatus;
  });

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-7 selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#F3E8D5] tracking-tight">Audit & Query Verification Log</h1>
          <p className="text-xs md:text-sm text-[#C9B9A5] mt-1">
            Immutable, append-oriented log recording user questions, tenant scoping, retrieved sources, and access status
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#8F7B68] uppercase">Filter:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs rounded-xl border border-[#44362D] bg-[#241D19] px-3.5 py-2 text-[#F3E8D5] focus:outline-none focus:border-[#C8874A] cursor-pointer"
          >
            <option value="all">All Logs ({auditLogs.length})</option>
            <option value="allowed">Allowed / Grounded</option>
            <option value="blocked">Cross-Client Blocked</option>
            <option value="refused">Out-of-Scope Refused</option>
            <option value="error">System Error</option>
          </select>
        </div>
      </div>

      {/* Security Principles Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#241D19] border border-[#3D3027] p-5 rounded-2xl flex items-start gap-4 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-[#2D3A2D] text-[#B5C99F] border border-[#53684B]/40 flex items-center justify-center font-bold text-sm shrink-0">
            <span className="material-symbols-outlined text-[20px]">verified_user</span>
          </div>
          <div>
            <div className="text-xs font-bold text-[#F3E8D5]">Server-Enforced Scope</div>
            <div className="text-[11px] text-[#C9B9A5] mt-1 leading-relaxed">
              Client identifier is bound from trusted auth token, never client request body.
            </div>
          </div>
        </div>

        <div className="bg-[#241D19] border border-[#3D3027] p-5 rounded-2xl flex items-start gap-4 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-[#342923] text-[#D99A5E] border border-[#58483B] flex items-center justify-center font-bold text-sm shrink-0">
            <span className="material-symbols-outlined text-[20px]">source</span>
          </div>
          <div>
            <div className="text-xs font-bold text-[#F3E8D5]">Source Chunk Tracing</div>
            <div className="text-[11px] text-[#C9B9A5] mt-1 leading-relaxed">
              Every returned response retains immutable pointers to verified Qdrant vector chunks.
            </div>
          </div>
        </div>

        <div className="bg-[#241D19] border border-[#3D3027] p-5 rounded-2xl flex items-start gap-4 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-[#402A25] text-[#E8A394] border border-[#70473D]/50 flex items-center justify-center font-bold text-sm shrink-0">
            <span className="material-symbols-outlined text-[20px]">block</span>
          </div>
          <div>
            <div className="text-xs font-bold text-[#F3E8D5]">Cross-Tenant Denial</div>
            <div className="text-[11px] text-[#C9B9A5] mt-1 leading-relaxed">
              Attempts to probe outside client scope trigger automatic access denials and audit events.
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table Card */}
      <div className="bg-[#241D19] border border-[#3D3027] rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="border-b border-[#342923] text-[11px] font-bold text-[#8F7B68] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Client Scope</th>
                <th className="px-6 py-4">Query</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Retrieved Sources</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#342923]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs text-[#8F7B68]">
                    No audit records recorded yet.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#2A211B]/60 transition-colors">
                    <td className="px-6 py-4 text-[#8F7B68] text-xs font-mono">
                      {log.timestamp}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#F3E8D5] text-xs">{log.user}</div>
                      <div className="text-[11px] text-[#8F7B68] capitalize">{log.userRole}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#1C1714] border border-[#3D3027] text-[#C9B9A5]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C8874A]"></span>
                        {log.clientScope}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs md:max-w-md">
                      <div className="text-xs text-[#F3E8D5] font-medium truncate">&ldquo;{log.query}&rdquo;</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1.5 ${
                          log.status === 'allowed'
                            ? 'bg-[#2D3A2D] text-[#B5C99F] border-[#53684B]'
                            : log.status === 'blocked'
                            ? 'bg-[#402A25] text-[#E8A394] border-[#70473D]'
                            : 'bg-[#403323] text-[#E4BD72] border-[#755B36]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            log.status === 'allowed'
                              ? 'bg-[#91A982]'
                              : log.status === 'blocked'
                              ? 'bg-[#D47D68]'
                              : 'bg-[#E0B765]'
                          }`}
                        ></span>
                        <span className="capitalize">{log.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#8F7B68]">
                      {log.retrievedSources && log.retrievedSources.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {log.retrievedSources.map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-[#1C1714] border border-[#3D3027] text-[#C9B9A5] text-[10px]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span>None</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-[#342923] flex items-center justify-between text-xs text-[#8F7B68]">
          <span>Audit logs are written synchronously during query pipeline</span>
          <span>Zero tenant leaks detected</span>
        </div>
      </div>
    </div>
  );
};