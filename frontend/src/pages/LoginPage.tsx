import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const LoginPage: React.FC = () => {
  const { loginUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const result = await loginUser(email, password);
    if (!result.success) setErrorMsg(result.error || 'Unable to sign in.');
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#1C1714] via-[#241D19] to-[#2A211B] selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Subtle radial ambient warm glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(circle at 50% 38%, rgba(110, 72, 43, 0.28) 0%, rgba(28, 23, 20, 0) 65%)',
        }}
      />

      {/* Decorative coffee bean motifs */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none opacity-20">
        {/* Top-left bean */}
        <svg
          className="absolute -left-12 top-28 w-72 h-72 text-[#D99A5E]"
          viewBox="0 0 160 160"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <ellipse cx="80" cy="80" rx="36" ry="60" transform="rotate(-35 80 80)" />
          <path d="M48 50c25 22 41 51 49 86" strokeLinecap="round" />
        </svg>

        {/* Bottom-right bean */}
        <svg
          className="absolute -right-8 bottom-24 w-80 h-80 text-[#D99A5E]"
          viewBox="0 0 160 160"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <ellipse cx="80" cy="80" rx="30" ry="52" transform="rotate(28 80 80)" />
          <path d="M56 50c20 16 35 39 42 66" strokeLinecap="round" />
        </svg>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full px-8 md:px-14 py-8 flex justify-between items-center">
        {/* Brand */}
        <div className="inline-flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#C8874A] flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-[#241D19]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
              <path d="M4 12C4 7.58 7.58 4 12 4s8 3.58 8 8-3.58 8-8 8c-1.5 0-3-.4-4.2-1.1L4 20l1.1-3.8C4.4 15 4 13.5 4 12z" />
              <circle cx="9.5" cy="12" r="1" fill="#241D19" />
              <circle cx="12" cy="12" r="1" fill="#241D19" />
              <circle cx="14.5" cy="12" r="1" fill="#241D19" />
            </svg>
          </div>
          <span className="font-bold text-xl md:text-2xl text-[#F3E8D5] tracking-tight">KnowBridge</span>
        </div>

        {/* Subtitle / tag */}
        <span className="text-[11px] md:text-xs font-semibold tracking-wider text-[#B8A590] uppercase">
          Internal Knowledge Portal
        </span>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-[440px] bg-[#342923] rounded-3xl border border-[#58483B] p-8 md:p-10 shadow-[0_18px_40px_rgba(8,6,4,0.55)]">
          {/* Top Chat Icon Badge */}
          <div className="flex flex-col items-center text-center mb-7">
            <div className="w-13 h-13 p-3 rounded-2xl bg-[#44362D] border border-[#72543B] flex items-center justify-center mb-4 shadow-inner text-[#D99A5E]">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
                <path d="M4 12C4 7.58 7.58 4 12 4s8 3.58 8 8-3.58 8-8 8c-1.5 0-3-.4-4.2-1.1L4 20l1.1-3.8C4.4 15 4 13.5 4 12z" />
                <circle cx="9.5" cy="12" r="1" fill="currentColor" />
                <circle cx="12" cy="12" r="1" fill="currentColor" />
                <circle cx="14.5" cy="12" r="1" fill="currentColor" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#F3E8D5] tracking-tight">Welcome back</h1>
            <p className="text-sm text-[#C9B9A5] mt-1.5">Sign in to your authorized client workspace</p>
          </div>

          {errorMsg && (
            <div role="alert" className="mb-5 p-3 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Credentials Form */}
          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            {/* Work email */}
            <div className="flex flex-col gap-2 text-left">
              <label className="text-xs font-semibold text-[#E9DCC9]" htmlFor="work-email">
                Work email
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[#B8A590] flex items-center pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="4" strokeLinecap="round" />
                    <path d="M5 20c0-4 3.5-6 7-6s7 2 7 6" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  className="w-full h-12 pl-10 pr-3.5 rounded-xl border border-[#665346] bg-[#241D19] text-[#F3E8D5] text-sm placeholder:text-[#9D8D7C] focus:outline-none focus:border-[#C8874A] focus:ring-1 focus:ring-[#C8874A] transition-colors"
                  id="work-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2 text-left">
              <label className="text-xs font-semibold text-[#E9DCC9]" htmlFor="password">
                Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[#B8A590] flex items-center pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                </span>
                <input
                  className="w-full h-12 pl-10 pr-3.5 rounded-xl border border-[#665346] bg-[#241D19] text-[#F3E8D5] text-sm placeholder:text-[#9D8D7C] focus:outline-none focus:border-[#C8874A] focus:ring-1 focus:ring-[#C8874A] transition-colors"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  type="password"
                  placeholder="••••••••••"
                />
              </div>
            </div>

            {/* Forgot password link */}
            <div className="flex justify-end -mt-1">
              <button
                type="button"
                className="text-xs font-semibold text-[#D99A5E] hover:text-[#E0B765] transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit button */}
            <button
              className="w-full h-12 mt-2 rounded-xl bg-[#C8874A] text-[#241D19] text-sm font-bold hover:bg-[#D99A5E] active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              type="submit"
            >
              <span>Sign in</span>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>

          {/* Bottom Card Footer */}
          <div className="mt-7 pt-5 border-t border-[#58483B] flex items-center justify-center gap-2 text-center">
            <span className="w-2 h-2 rounded-full bg-[#91A982] shrink-0"></span>
            <p className="text-[11px] text-[#B8A590]">
              Your role and client access are verified by the server
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-6 text-center text-[11px] md:text-xs font-medium tracking-wide text-[#8F7B68] uppercase">
        ESPRESSO BACKGROUND &bull; MOCHA SURFACES &bull; WARM CREAM TEXT &bull; CARAMEL ACCENTS
      </footer>
    </div>
  );
};
