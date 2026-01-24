import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { LayoutDashboard, Sun, Moon } from 'lucide-react'

export default function Navbar({ theme, toggleTheme }) {
  const { user } = useAuth()
  const initial = (user?.name || user?.username || user?.email || 'U')
    .charAt(0)
    .toUpperCase()

  return (
    <header className="relative flex items-center justify-between p-4 border-b border-slate-800 dark:border-slate-1 bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] dark:bg-[linear-gradient(transparent_50%,rgba(255,255,255,0.05)_50%)] bg-[length:100%_4px]" />

      {/* Titre */}
      <div className="relative z-10 flex items-center gap-2">
        <LayoutDashboard size={20} className="text-green-500 dark:text-green-300" />
        <div className="text-lg font-semibold tracking-wide">Dashboard</div>
         {/* Bouton toggle thème */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md border border-slate-400 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* User + Theme toggle */}
      <div className="relative z-10 flex items-center gap-3">
        

        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-black dark:text-white animate-avatar-hue shadow-[0_0_14px_rgba(37,211,102,0.9)]">
          {initial}
        </div>

        <div className="leading-tight">
          <div className="text-sm font-semibold">{user?.name || user?.username || 'Utilisateur'}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</div>
        </div>
      </div>

      <style>{`
        @keyframes avatar-hue {
          0%   { background: #22c55e; }
          25%  { background: #06b6d4; }
          50%  { background: #8b5cf6; }
          75%  { background: #ec4899; }
          100% { background: #22c55e; }
        }
        .animate-avatar-hue {
          animation: avatar-hue 6s linear infinite;
        }
      `}</style>
    </header>
  )
}
