import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { currentUser, activeTab, setActiveTab, logoutUser } = useApp();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  if (!currentUser) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1C1714] border-b border-[#3D3027] h-16 px-6 md:px-10 flex items-center justify-between shadow-[0_4px_20px_rgba(8,6,4,0.4)]">
      {/* Left: Brand & Scope */}
      <div className="flex items-center gap-4 md:gap-5">
        <button
          type="button"
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setActiveTab(currentUser.role === 'admin' ? 'dashboard' : 'chat')}
        >
          <div className="w-9 h-9 rounded-2xl bg-[#C8874A] flex items-center justify-center shadow-md group-hover:bg-[#D99A5E] transition-colors">
            <svg className="w-4.5 h-4.5 text-[#241D19]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
              <path d="M4 12C4 7.58 7.58 4 12 4s8 3.58 8 8-3.58 8-8 8c-1.5 0-3-.4-4.2-1.1L4 20l1.1-3.8C4.4 15 4 13.5 4 12z" />
              <circle cx="9.5" cy="12" r="1" fill="#241D19" />
              <circle cx="12" cy="12" r="1" fill="#241D19" />
              <circle cx="14.5" cy="12" r="1" fill="#241D19" />
            </svg>
          </div>
          <span className="font-bold text-lg md:text-xl text-[#F3E8D5] tracking-tight">KnowBridge</span>
        </button>

        <div className="hidden md:block h-5 w-[1px] bg-[#3D3027]"></div>

        {/* Client Scope Pill */}
        <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 bg-[#241D19] rounded-xl border border-[#44362D] text-xs font-medium text-[#C9B9A5]">
          <span className="w-2 h-2 rounded-full bg-[#91A982] animate-pulse"></span>
          <span>{currentUser.assignedClientName}</span>
          <span className="text-[#8F7B68] text-[11px]">({currentUser.assignedClientTier})</span>
        </div>
      </div>

      {/* Center Nav tabs */}
      <nav className="flex items-center gap-1.5">
        {currentUser.role === 'admin' ? (
          <>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-[#D99A5E] text-[#241D19] shadow-md font-bold'
                  : 'text-[#C9B9A5] hover:text-[#F3E8D5] hover:bg-[#2A211B]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'documents'
                  ? 'bg-[#D99A5E] text-[#241D19] shadow-md font-bold'
                  : 'text-[#C9B9A5] hover:text-[#F3E8D5] hover:bg-[#2A211B]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">folder</span>
              <span>Documents</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'users'
                  ? 'bg-[#D99A5E] text-[#241D19] shadow-md font-bold'
                  : 'text-[#C9B9A5] hover:text-[#F3E8D5] hover:bg-[#2A211B]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">group</span>
              <span>Users</span>
            </button>
            <button
              onClick={() => setActiveTab('access')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'access'
                  ? 'bg-[#D99A5E] text-[#241D19] shadow-md font-bold'
                  : 'text-[#C9B9A5] hover:text-[#F3E8D5] hover:bg-[#2A211B]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">lock</span>
              <span>Access Control</span>
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'audit'
                  ? 'bg-[#D99A5E] text-[#241D19] shadow-md font-bold'
                  : 'text-[#C9B9A5] hover:text-[#F3E8D5] hover:bg-[#2A211B]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">description</span>
              <span>Audit Logs</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'bg-[#D99A5E] text-[#241D19] shadow-md font-bold'
                  : 'text-[#C9B9A5] hover:text-[#F3E8D5] hover:bg-[#2A211B]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
              <span>Test Chat</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'bg-[#D99A5E] text-[#241D19] shadow-md font-bold'
                  : 'text-[#C9B9A5] hover:text-[#F3E8D5] hover:bg-[#2A211B]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
              <span>Knowledge Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'documents'
                  ? 'bg-[#D99A5E] text-[#241D19] shadow-md font-bold'
                  : 'text-[#C9B9A5] hover:text-[#F3E8D5] hover:bg-[#2A211B]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">folder</span>
              <span>Client Sources</span>
            </button>
          </>
        )}
      </nav>

      {/* Right User & Persona Switcher */}
      <div className="relative">
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          aria-expanded={showProfileMenu}
          aria-haspopup="menu"
          className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-2xl hover:bg-[#2A211B] transition-colors border border-transparent hover:border-[#44362D]"
        >
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-[#F3E8D5] leading-tight">
              {currentUser.role === 'admin' ? 'Secured Admin' : currentUser.name}
            </span>
            <span className="text-[11px] text-[#8F7B68] truncate max-w-[150px]">
              {currentUser.email}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#C8874A] text-[#241D19] flex items-center justify-center font-bold text-xs shadow-sm">
            {currentUser.avatarInitials}
          </div>
        </button>

        {showProfileMenu && (
          <div className="absolute right-0 mt-2 w-72 bg-[#342923] border border-[#58483B] rounded-2xl shadow-2xl p-2.5 z-50">
            <div className="px-3 py-2 border-b border-[#44362D] mb-2">
              <p className="text-xs font-semibold text-[#F3E8D5]">{currentUser.name}</p>
              <p className="text-[11px] text-[#C9B9A5] truncate">{currentUser.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#44362D] text-[#D99A5E] border border-[#72543B]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#91A982]"></span>
                Authorized: {currentUser.assignedClientName}
              </div>
            </div>

            <button
              onClick={() => {
                logoutUser();
                setShowProfileMenu(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#D47D68] hover:bg-[#4A2D27]/40 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Sign out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
