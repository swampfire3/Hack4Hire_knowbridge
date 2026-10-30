import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const ChatPage: React.FC = () => {
  const {
    currentUser,
    chatHistory,
    activeCitations,
    chatSessions,
    activeSessionId,
    selectSession,
    createNewChat,
    addChatMessage,
    clearChat,
    documents,
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [showHistoryPanel, setShowHistoryPanel] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  if (!currentUser) return null;

  // Filter client's active documents
  const clientDocs = documents.filter(
    (d) => d.clientId === currentUser.assignedClientId && d.status === 'indexed'
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    addChatMessage(inputText.trim());
    setInputText('');
  };

  const samplePrompts = [
    {
      title: 'Summarize a procedure',
      prompt: 'Summarize the main procedure in my assigned client documents.',
    },
    {
      title: 'Cross-Tenant Access Test',
      prompt: 'Can you retrieve a document belonging to a different client?',
    },
    {
      title: 'Conflict Detection Test',
      prompt: 'Do my assigned client documents contain conflicting requirements?',
    },
    {
      title: 'Out-of-Scope (Refusal Test)',
      prompt: 'What is the capital of France and what is the weather today?',
    },
  ];

  const filteredSessions = chatSessions.filter(
    (s) =>
      s.clientId === currentUser.assignedClientId &&
      s.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-[#1C1714] selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Top Context & Sub-navigation Strip */}
      <div className="w-full h-14 bg-[#241D19] border-b border-[#3D3027] flex items-center justify-between px-6 flex-shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#342923] border border-[#58483B] flex items-center justify-center font-bold text-xs text-[#D99A5E]">
            {currentUser.assignedClientName[0]}
          </div>
          <div className="flex flex-col">
            <span className="text-xs md:text-sm font-bold text-[#F3E8D5] leading-tight">
              {currentUser.assignedClientName}
            </span>
            <span className="text-[10px] text-[#8F7B68]">Client Workspace Scope</span>
          </div>
          <span className="ml-2 px-2.5 py-0.5 rounded-lg bg-[#1C1714] text-[#C9B9A5] text-[11px] border border-[#3D3027] font-medium">
            {currentUser.assignedClientTier} Tier
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowHistoryPanel(!showHistoryPanel)}
            aria-pressed={showHistoryPanel}
            className={`h-9 px-3.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showHistoryPanel
                ? 'bg-[#342923] text-[#D99A5E] border-[#58483B]'
                : 'bg-[#1C1714] text-[#C9B9A5] border-[#3D3027] hover:bg-[#2A211B]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">history</span>
            <span>Chat history</span>
          </button>
          <button
            onClick={clearChat}
            aria-label="Clear messages in the current chat"
            className="h-9 px-3.5 rounded-xl border border-[#3D3027] bg-[#1C1714] hover:bg-[#2A211B] text-[#C9B9A5] hover:text-[#F3E8D5] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* 3-Column Layout: Left (Sources) | Center (Chat Stream) | Right (History Panel) */}
      <div className="flex flex-1 w-full min-h-0 overflow-hidden relative">
        {/* LEFT PANEL: Sources & Documents for this answer */}
        <aside className="w-80 flex-shrink-0 bg-[#241D19] border-r border-[#3D3027] flex flex-col h-full overflow-y-auto p-4 gap-4">
          {/* Active Citations */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-[11px] font-bold text-[#8F7B68] uppercase tracking-wider">
                Sources for this answer
              </h2>
              <span className="text-[11px] text-[#C9B9A5] font-semibold">
                {activeCitations.length} active
              </span>
            </div>

            {activeCitations.length === 0 ? (
              <div className="p-5 bg-[#1C1714] border border-[#3D3027] rounded-2xl text-center text-xs text-[#8F7B68]">
                <span className="material-symbols-outlined text-2xl text-[#8F7B68] mb-1.5 block">menu_book</span>
                No active source citations yet. Ask a client question below or trigger a test scenario.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {activeCitations.map((cit) => (
                  <div
                    key={cit.id}
                    className="bg-[#1C1714] border border-[#3D3027] rounded-2xl p-3.5 flex flex-col gap-2 shadow-sm"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded bg-[#C8874A] text-[#241D19] text-xs flex items-center justify-center font-bold flex-shrink-0">
                        {cit.id}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-[#F3E8D5] leading-snug truncate">
                          {cit.title}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#8F7B68]">
                          <span>{cit.version}</span>
                          <span className="w-1 h-1 rounded-full bg-[#8F7B68]"></span>
                          <span>{cit.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#C9B9A5] bg-[#241D19] p-2.5 rounded-xl border border-[#3D3027] italic leading-relaxed">
                      &ldquo;{cit.excerpt}&rdquo;
                    </div>

                    <div className="text-[10px] text-[#B5C99F] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                      <span>Verified Client Match</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Client Document Corpus */}
          <div className="mt-2">
            <h2 className="text-[11px] font-bold text-[#8F7B68] uppercase tracking-wider mb-2.5">
              Available Client Docs ({clientDocs.length})
            </h2>
            {clientDocs.length === 0 ? (
              <div className="text-xs text-[#8F7B68] italic p-3 bg-[#1C1714] rounded-xl border border-[#3D3027]">
                No indexed files in this client namespace.
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {clientDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-2.5 rounded-xl bg-[#1C1714] border border-[#3D3027] flex items-center gap-2.5 text-xs"
                  >
                    <span className="material-symbols-outlined text-[#D99A5E] text-[16px]">description</span>
                    <span className="truncate text-[#F3E8D5] font-medium flex-1">{doc.name}</span>
                    <span className="text-[10px] text-[#8F7B68]">{doc.version}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sample Prompts */}
          <div className="mt-2 pt-3 border-t border-[#3D3027]">
            <h2 className="text-[11px] font-bold text-[#8F7B68] uppercase tracking-wider mb-2">
              Test Prompts
            </h2>
            <div className="flex flex-col gap-1.5">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputText(p.prompt)}
                  className="p-2 rounded-xl bg-[#1C1714] border border-[#3D3027] hover:border-[#58483B] text-left transition-colors cursor-pointer"
                >
                  <div className="text-xs font-semibold text-[#D99A5E]">{p.title}</div>
                  <div className="text-[11px] text-[#8F7B68] truncate mt-0.5">{p.prompt}</div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* CENTER: Main Chat Stream */}
        <main className="flex-1 flex flex-col h-full bg-[#1C1714] overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 md:px-10 py-6 space-y-6">
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${
                  msg.sender === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-[#C8874A] flex items-center justify-center text-[#241D19] flex-shrink-0 mt-0.5 shadow-md">
                    <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                  </div>
                )}

                <div
                  className={`flex flex-col gap-1.5 ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`p-4 rounded-3xl text-xs md:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#C8874A] text-[#241D19] font-medium rounded-br-none shadow-md'
                        : msg.isRefusal
                        ? 'bg-[#403323] text-[#E4BD72] border border-[#755B36] rounded-bl-none shadow-sm'
                        : 'bg-[#241D19] text-[#F3E8D5] border border-[#3D3027] rounded-bl-none shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>

                    {/* Citations pill */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#3D3027] flex flex-wrap gap-1.5 items-center">
                        <span className="text-[11px] text-[#8F7B68] font-semibold">Citations:</span>
                        {msg.citations.map((c) => (
                          <span
                            key={c.id}
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#1C1714] text-[#D99A5E] font-medium text-[11px] border border-[#3D3027]"
                          >
                            <span className="w-3.5 h-3.5 rounded-full bg-[#C8874A] text-[#241D19] text-[9px] flex items-center justify-center font-bold">
                              {c.id}
                            </span>
                            <span>
                              {c.title.split(' ')[0]} {c.version}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-[#8F7B68] px-1">{msg.timestamp}</span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-[#342923] border border-[#58483B] text-[#D99A5E] flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                    {currentUser.avatarInitials}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 md:p-6 bg-[#241D19] border-t border-[#3D3027]">
            <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Ask a question grounded in ${currentUser.assignedClientName} documents...`}
                  className="w-full h-12 pl-4 pr-10 rounded-2xl border border-[#44362D] bg-[#1C1714] text-[#F3E8D5] placeholder:text-[#8F7B68] focus:outline-none focus:border-[#C8874A] text-xs md:text-sm transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="h-12 px-6 rounded-2xl bg-[#C8874A] text-[#241D19] font-bold text-xs md:text-sm flex items-center gap-2 hover:bg-[#D99A5E] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
              >
                <span>Send</span>
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </form>
            <div className="text-center mt-2.5">
              <span className="text-[11px] text-[#8F7B68]">
                Strict tenant isolation active • Cross-tenant queries are blocked and recorded in audit log
              </span>
            </div>
          </div>
        </main>

        {/* RIGHT: Chat History Slide-Over Panel */}
        {showHistoryPanel && (
          <aside className="w-80 flex-shrink-0 bg-[#241D19] border-l border-[#3D3027] flex flex-col h-full z-30 transition-all">
            {/* Slide-over Header */}
            <div className="h-14 px-4 border-b border-[#3D3027] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#D99A5E] text-[20px]">history</span>
                <h2 className="text-sm font-bold text-[#F3E8D5]">Chat History</h2>
              </div>
              <button
                onClick={() => setShowHistoryPanel(false)}
                className="w-8 h-8 rounded-lg hover:bg-[#342923] text-[#8F7B68] hover:text-[#F3E8D5] flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Action & Search */}
            <div className="p-3.5 flex flex-col gap-2.5 border-b border-[#3D3027] flex-shrink-0">
              <button
                onClick={createNewChat}
                className="w-full h-10 rounded-xl bg-[#C8874A] text-[#241D19] hover:bg-[#D99A5E] flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>New chat</span>
              </button>

              <div className="relative w-full flex items-center">
                <span className="material-symbols-outlined absolute left-2.5 text-[#8F7B68] text-[16px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full h-8 pl-8 pr-2.5 bg-[#1C1714] border border-[#3D3027] rounded-lg text-xs text-[#F3E8D5] placeholder:text-[#8F7B68] focus:outline-none focus:border-[#C8874A]"
                />
              </div>
            </div>

            {/* Past Sessions List */}
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
              {filteredSessions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => selectSession(s.id)}
                  className={`flex flex-col gap-0.5 px-3 py-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                    s.id === activeSessionId
                      ? 'bg-[#342923] border-[#58483B] font-semibold text-[#D99A5E]'
                      : 'hover:bg-[#2A211B] border-transparent text-[#C9B9A5]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate max-w-[180px]">{s.title}</span>
                    {s.id === activeSessionId && (
                      <span className="text-[10px] text-[#D99A5E] font-bold">Active</span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#8F7B68] font-normal">{s.timestamp}</span>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};