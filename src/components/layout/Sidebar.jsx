import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Home, CreditCard, Calendar, Wifi, Tag, Settings,Cloud } from "lucide-react"
import { useAuth } from '../../contexts/AuthContext'

const nav = [
  { to: '/super', label: 'Super Dashboard', role: 'SUPER_ADMIN', icon: Home },
  { to: '/owner', label: 'Owner Dashboard', role: 'BUSINESS_OWNER', icon: Home },
  { to: '/staff', label: 'Staff Dashboard', role: 'STAFF', icon: Home },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/sessions', label: 'Sessions', icon: Calendar },
  { to: '/routers', label: 'Routers', icon: Wifi },
  { to: '/pricing', label: 'Pricing', icon: Tag },
  { to: '/settings', label: 'Settings', icon: Settings }
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    const confirmed = window.confirm("Would you really sure for you logout ?")
    if (confirmed) {
      logout()
      navigate('/')
    }
  }

  return (
    <aside className="w-64 bg-[rgba(10,15,25,0.97)] p-4 border-r border-slate-800 flex flex-col relative overflow-hidden">
      {/* subtle background scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[linear-gradient(transparent_50%,rgba(255,255,255,0.1)_50%)] bg-[length:100%_4px]" />

      <div className="mb-6 relative z-10">
        <div className="flex items-center  text-2xl font-bold text-green-400 drop-shadow-[0_0_12px_rgba(37,211,102,0.9)]">
          <Cloud
            size={30}
            className="text-green-400 drop-shadow-[0_0_10px_rgba(37,211,102,1)]"
          />
          <span>reenHatah Cloud</span>
        </div>

        <div className="text-xs tracking-widest text-slate-400 uppercase">
          Wi-Fi Hotspot SaaS
        </div>
      </div>

      <nav className="flex-1 relative z-10">
        {nav.map((n) => {
          if (n.role && (!user || user.role !== n.role)) return null
          const Icon = n.icon

          return (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `group relative flex items-center px-3 py-2.5 rounded-lg mb-2 text-sm gap-3 transition-all duration-300
                ${isActive
                  ? 'bg-[rgba(20,30,45,0.8)] border border-green-400/30 shadow-[0_0_20px_rgba(37,211,102,0.9)] animate-border-flicker'
                  : 'text-slate-300 hover:bg-[rgba(20,30,45,0.5)] hover:shadow-[0_0_10px_rgba(37,211,102,0.4)]'}`
              }
            >
              {/* Glow line */}
              <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-transparent via-green-400/20 to-transparent" />

              {/* Icon */}
              <Icon
                size={20}
                className="relative z-10 flex-shrink-0 text-green-400 opacity-80
                group-hover:opacity-100 group-hover:drop-shadow-[0_0_10px_rgba(37,211,102,0.9)]
                animate-icon-pulse"
              />

              {/* Label */}
              <span
                className="relative z-10 font-medium tracking-wide bg-clip-text text-transparent
                bg-gradient-to-r from-green-300 via-green-100 to-green-300
                animate-text-glow"
              >
                {n.label}
              </span>
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-6 relative z-10">
        {user ? (
          <div>
            <div className="text-xs text-slate-400 mb-1">Signed in as</div>
            <div className="font-medium mb-2">
              {user.name || user.username}{" "}
              <span className="text-slate-400 text-xs">({user.role})</span>
            </div>

            <div
              onClick={handleLogout}
              className="
                mt-3 w-full flex items-center justify-center gap-3
                text-red-500
                py-2 rounded-lg text-sm
                border border-red-500/30
                cursor-pointer select-none
                hover:shadow-[0_0_14px_rgba(255,0,0,0.9)]
                transition-all duration-300
              "
            >
              <LogOut size={18} />
              <span>Logout</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-500 cursor-pointer">
            <span className="text-sm font-medium">Not Sign in</span>
          </div>
        )}
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes icon-pulse {
          0%,100% { filter: drop-shadow(0 0 6px rgba(37,211,102,.6)); }
          50% { filter: drop-shadow(0 0 14px rgba(37,211,102,1)); }
        }

        @keyframes text-glow {
          0%,100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes border-flicker {
          0%,100% { box-shadow: 0 0 12px rgba(37,211,102,.8); }
          40% { box-shadow: 0 0 20px rgba(37,211,102,1); }
          60% { box-shadow: 0 0 8px rgba(37,211,102,.5); }
        }

        .animate-icon-pulse {
          animation: icon-pulse 2s infinite;
        }

        .animate-text-glow {
          background-size: 200% 200%;
          animation: text-glow 3s ease infinite;
        }

        .animate-border-flicker {
          animation: border-flicker 1.5s infinite;
        }
      `}</style>
    </aside>
  )
}
