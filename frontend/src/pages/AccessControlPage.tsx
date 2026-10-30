import React from 'react';
import { useApp } from '../context/AppContext';

export const AccessControlPage: React.FC = () => {
  const { users, clients, updateUserClientAssignment } = useApp();

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-7 selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#F3E8D5] tracking-tight">Access Control & Client Assignments</h1>
          <p className="text-xs md:text-sm text-[#C9B9A5] mt-1">
            Server-side user-to-client bindings that dictate retrieval tenant scope for RAG queries
          </p>
        </div>
      </div>

      {/* Security Rule Card */}
      <div className="bg-[#241D19] border border-[#3D3027] rounded-3xl p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#342923] border border-[#58483B] flex items-center justify-center text-[#D99A5E] shrink-0">
            <span className="material-symbols-outlined text-[22px]">security</span>
          </div>
          <div>
            <span className="font-bold text-[#F3E8D5] text-sm">Rule 1 & Rule 2 Multi-Tenant Enforcement</span>
            <p className="mt-1 text-xs text-[#C9B9A5] leading-relaxed">
              Users cannot change their authorized client boundary in the browser chat request. The backend strictly resolves the authenticated user's ID against these assignments to apply tenant filters to Qdrant vector retrieval.
            </p>
          </div>
        </div>
      </div>

      {/* Assignment Table Card */}
      <div className="bg-[#241D19] border border-[#3D3027] rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="border-b border-[#342923] text-[11px] font-bold text-[#8F7B68] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Current Client Scope</th>
                <th className="px-6 py-4">Service Tier</th>
                <th className="px-6 py-4">Reassign Client</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#342923]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#2A211B]/60 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#44362D] border border-[#58483B] text-[#D99A5E] flex items-center justify-center font-bold text-xs shadow-sm">
                      {u.avatarInitials}
                    </div>
                    <div>
                      <div className="font-bold text-[#F3E8D5] text-xs md:text-sm">{u.name}</div>
                      <div className="text-[11px] text-[#8F7B68]">{u.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-xl text-[11px] font-semibold border ${
                        u.role === 'admin'
                          ? 'bg-[#342923] text-[#D99A5E] border-[#58483B]'
                          : 'bg-[#2A211B] text-[#C9B9A5] border-[#3D3027]'
                      }`}
                    >
                      {u.role === 'admin' ? 'Admin' : 'Staff'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#1C1714] border border-[#3D3027] text-[#C9B9A5]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C8874A]"></span>
                      {u.assignedClientName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-[#8F7B68]">
                    {u.assignedClientTier}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={u.assignedClientId}
                      onChange={(e) => updateUserClientAssignment(u.id, e.target.value)}
                      className="text-xs rounded-xl border border-[#44362D] bg-[#1C1714] px-3 py-2 text-[#F3E8D5] focus:outline-none focus:border-[#C8874A] cursor-pointer"
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.tier})
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-[#342923] flex items-center justify-between text-xs text-[#8F7B68]">
          <span>Assignments are stored in PostgreSQL relational identity store</span>
          <span>Instant cache sync</span>
        </div>
      </div>
    </div>
  );
};