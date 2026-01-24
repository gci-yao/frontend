import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function Layout() {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'dark'
  )

  useEffect(() => {
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))

  return (
    <div className="flex h-screen relative">
      <Sidebar />
      <div className="flex-1 flex flex-col relative">
        <Navbar theme={theme} toggleTheme={toggleTheme} />

        {/* ✅ Overlay global pour le thème */}
        <div
          className={`absolute inset-0 pointer-events-none transition-all duration-500 ${
            theme === 'dark' ? 'bg-black/60' : 'bg-white/5'
          }`}
        ></div>

        <main className="p-6 overflow-auto relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
