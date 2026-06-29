import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Wallet, ArrowLeftRight, LogOut, ScanLine } from 'lucide-react'
import { useAuthStore } from '../store/auth'
import { syncEnabled } from '../lib/supabase'
import { QRScanner } from './QRScanner'

const leftNav = [
  { to: '/',        icon: LayoutDashboard, label: 'Inicio' },
  { to: '/wallets', icon: Wallet,          label: 'Billeteras' },
]
const rightNav = [
  { to: '/transactions', icon: ArrowLeftRight, label: 'Movimientos' },
]

export default function Layout() {
  const { user, signOut } = useAuthStore()
  const [scannerOpen, setScannerOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto relative">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 border-b border-zinc-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-zinc-900 rounded-lg flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">B</span>
            </div>
            <span className="text-sm font-semibold text-zinc-900 tracking-tight">Billetera</span>
          </div>
          {syncEnabled && user && (
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
              title={user.email}
            >
              <span className="hidden sm:block truncate max-w-32">{user.email}</span>
              <LogOut size={14} />
            </button>
          )}
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 px-5 py-5 pb-28 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/90 backdrop-blur-md border-t border-zinc-100 px-4 py-3 safe-area-pb">
        <div className="flex items-center justify-around">
          {/* Left nav items */}
          {leftNav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${isActive ? 'text-zinc-900' : 'text-zinc-300 hover:text-zinc-500'}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                  <span className={`text-[10px] font-medium ${isActive ? 'text-zinc-900' : 'text-zinc-400'}`}>{label}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* Center QR button */}
          <button
            onClick={() => setScannerOpen(true)}
            className="flex flex-col items-center gap-1 -mt-6 cursor-pointer"
          >
            <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center shadow-lg shadow-zinc-900/20 active:scale-95 transition-transform">
              <ScanLine size={24} className="text-white" />
            </div>
            <span className="text-[10px] font-medium text-zinc-400">Leer alias</span>
          </button>

          {/* Right nav items */}
          {rightNav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${isActive ? 'text-zinc-900' : 'text-zinc-300 hover:text-zinc-500'}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                  <span className={`text-[10px] font-medium ${isActive ? 'text-zinc-900' : 'text-zinc-400'}`}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* QR Scanner fullscreen */}
      <QRScanner open={scannerOpen} onClose={() => setScannerOpen(false)} />
    </div>
  )
}
