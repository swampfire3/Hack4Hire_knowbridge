import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const UserManagementPage: React.FC = () => {
  const { users, clients, addUser, addClient } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'staff' | 'admin'>('staff');
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [clientName, setClientName] = useState('');
  const [clientTier, setClientTier] = useState('Standard');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password || !clientId) return;
    setSaving(true);
    setFeedback(null);
    const result = await addUser({
      name: name.trim(),
      email: email.trim(),
      role,
      password,
      clientId,
    });
    setSaving(false);
    if (!result.success) {
      setFeedback(result.message || 'Unable to create account.');
      return;
    }

    setName('');
    setEmail('');
    setPassword('');
    setFeedback('Account created and saved.');
    setShowAddModal(false);
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientTier.trim()) return;
    setSaving(true);
    setFeedback(null);
    const result = await addClient({ name: clientName.trim(), tier: clientTier.trim() });
    setSaving(false);
    if (!result.success) {
      setFeedback(result.message || 'Unable to create client.');
      return;
    }
    setClientName('');
    setClientTier('Standard');
    setFeedback('Client created and assigned to your admin account.');
    if (result.clientId) setClientId(result.clientId);
    setShowClientModal(false);
    setShowAddModal(true);
  };

  const totalStaff = users.filter((u) => u.role === 'staff').length;
  const totalAdmins = users.filter((u) => u.role === 'admin').length;

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.assignedClientName.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-7 selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#F3E8D5] tracking-tight">User Management</h1>
          <p className="text-xs md:text-sm text-[#C9B9A5] mt-1">
            Manage internal staff and administrator credentials, active directory status, and security roles.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => setShowClientModal(true)}
            className="px-4 py-2.5 rounded-xl border border-[#44362D] bg-[#241D19] text-[#F3E8D5] font-semibold text-xs flex items-center gap-2 hover:bg-[#2A211B] hover:border-[#58483B] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-[#C9B9A5]">domain</span>
            <span>Add Client</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            disabled={clients.length === 0}
            className="px-4 py-2.5 rounded-xl bg-[#C8874A] text-[#241D19] font-bold text-xs flex items-center gap-2 hover:bg-[#D99A5E] shadow-md transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Add User</span>
          </button>
        </div>
      </div>

      {feedback && (
        <p role="status" className="rounded-2xl border border-[#58483B] bg-[#342923] px-4 py-3 text-xs md:text-sm text-[#F3E8D5]">
          {feedback}
        </p>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Accounts */}
        <div className="bg-[#241D19] rounded-2xl p-6 border border-[#3D3027] flex items-center justify-between shadow-md">
          <div>
            <span className="text-[11px] font-bold text-[#8F7B68] uppercase tracking-wider">
              Total Accounts
            </span>
            <div className="text-3xl font-extrabold text-[#F3E8D5] mt-1">{users.length}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#342923] border border-[#44362D] flex items-center justify-center text-[#D99A5E]">
            <span className="material-symbols-outlined text-[22px]">group</span>
          </div>
        </div>

        {/* Active Staff */}
        <div className="bg-[#241D19] rounded-2xl p-6 border border-[#3D3027] flex items-center justify-between shadow-md">
          <div>
            <span className="text-[11px] font-bold text-[#8F7B68] uppercase tracking-wider">
              Active Staff
            </span>
            <div className="text-3xl font-extrabold text-[#F3E8D5] mt-1">{totalStaff}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#342923] border border-[#44362D] flex items-center justify-center text-[#D99A5E]">
            <span className="material-symbols-outlined text-[22px]">badge</span>
          </div>
        </div>

        {/* System Administrators */}
        <div className="bg-[#241D19] rounded-2xl p-6 border border-[#3D3027] flex items-center justify-between shadow-md">
          <div>
            <span className="text-[11px] font-bold text-[#8F7B68] uppercase tracking-wider">
              System Administrators
            </span>
            <div className="text-3xl font-extrabold text-[#F3E8D5] mt-1">{totalAdmins}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#342923] border border-[#44362D] flex items-center justify-center text-[#D99A5E]">
            <span className="material-symbols-outlined text-[22px]">verified_user</span>
          </div>
        </div>
      </div>

      {/* User Table Card */}
      <div className="bg-[#241D19] border border-[#3D3027] rounded-3xl overflow-hidden shadow-xl">
        {/* Search and count bar */}
        <div className="p-5 md:p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full max-w-xs">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8F7B68] flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-[18px]">search</span>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search accounts..."
              className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-[#44362D] bg-[#1C1714] text-[#F3E8D5] text-xs placeholder:text-[#8F7B68] focus:outline-none focus:border-[#C8874A] transition-colors"
            />
          </div>
          <span className="text-xs text-[#8F7B68] font-medium self-end sm:self-auto">
            Displaying {filteredUsers.length} of {users.length} members
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="border-t border-b border-[#342923] text-[11px] font-bold text-[#8F7B68] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Assigned Client Scope</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#342923]">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#2A211B]/60 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#44362D] border border-[#58483B] text-[#D99A5E] flex items-center justify-center font-bold text-xs shadow-sm">
                      {u.avatarInitials}
                    </div>
                    <div>
                      <div className="font-bold text-[#F3E8D5] text-xs md:text-sm flex items-center gap-1.5">
                        <span>{u.name}</span>
                        {u.role === 'admin' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-[#342923] text-[#D99A5E] border border-[#58483B]">
                            SUPER
                          </span>
                        )}
                      </div>
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
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B5C99F]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#91A982]"></span>
                      <span>Active</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      className="p-1 text-[#8F7B68] hover:text-[#F3E8D5] transition-colors rounded-lg cursor-pointer"
                      title="User Actions"
                    >
                      <span className="material-symbols-outlined text-[18px]">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Card Footer */}
        <div className="px-6 py-4 border-t border-[#342923] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#8F7B68]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#91A982]"></span>
            <span>Role and client privileges are verified by the authentication gateway</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="hover:text-[#C9B9A5] cursor-pointer">Security Policies</span>
            <span className="hover:text-[#C9B9A5] cursor-pointer">Role Assignment Rules</span>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#342923] rounded-3xl border border-[#58483B] max-w-md w-full p-6 md:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#F3E8D5]">Add User Account</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#8F7B68] hover:text-[#F3E8D5] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#E9DCC9] block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rachel Adams"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-[#58483B] bg-[#241D19] px-3.5 py-2.5 text-[#F3E8D5] focus:outline-none focus:border-[#C8874A]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#E9DCC9] block mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs rounded-xl border border-[#58483B] bg-[#241D19] px-3.5 py-2.5 text-[#F3E8D5] focus:outline-none focus:border-[#C8874A]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#E9DCC9] block mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  minLength={12}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs rounded-xl border border-[#58483B] bg-[#241D19] px-3.5 py-2.5 text-[#F3E8D5] focus:outline-none focus:border-[#C8874A]"
                />
                <p className="mt-1 text-[11px] text-[#8F7B68]">Use at least 12 characters. Only the password hash is stored.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#E9DCC9] block mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'staff' | 'admin')}
                    className="w-full text-xs rounded-xl border border-[#58483B] bg-[#241D19] px-3 py-2.5 text-[#F3E8D5] focus:outline-none focus:border-[#C8874A]"
                  >
                    <option value="staff">Staff (Chat only)</option>
                    <option value="admin">Admin (Full Access)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#E9DCC9] block mb-1">
                    Client Assignment
                  </label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full text-xs rounded-xl border border-[#58483B] bg-[#241D19] px-3 py-2.5 text-[#F3E8D5] focus:outline-none focus:border-[#C8874A]"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.tier})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#44362D]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#58483B] text-xs text-[#C9B9A5] hover:bg-[#241D19] font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || clients.length === 0}
                  className="px-4 py-2 rounded-xl bg-[#C8874A] text-[#241D19] text-xs font-bold hover:bg-[#D99A5E] disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Creating…' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showClientModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#342923] rounded-3xl border border-[#58483B] max-w-md w-full p-6 md:p-8 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-[#F3E8D5]">Create Client</h2>
            <form onSubmit={handleAddClient} className="space-y-4">
              <label className="block text-xs font-semibold text-[#E9DCC9]">
                Client name
                <input
                  required
                  maxLength={120}
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="mt-1 w-full text-xs rounded-xl border border-[#58483B] bg-[#241D19] px-3.5 py-2.5 text-[#F3E8D5] focus:outline-none focus:border-[#C8874A]"
                />
              </label>
              <label className="block text-xs font-semibold text-[#E9DCC9]">
                Service tier
                <input
                  required
                  maxLength={120}
                  value={clientTier}
                  onChange={(e) => setClientTier(e.target.value)}
                  className="mt-1 w-full text-xs rounded-xl border border-[#58483B] bg-[#241D19] px-3.5 py-2.5 text-[#F3E8D5] focus:outline-none focus:border-[#C8874A]"
                />
              </label>
              <p className="text-xs text-[#8F7B68]">The new client is stored in PostgreSQL and assigned to your admin account.</p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClientModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#58483B] text-xs text-[#C9B9A5] hover:bg-[#241D19] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-[#C8874A] text-[#241D19] text-xs font-bold hover:bg-[#D99A5E] disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving…' : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};