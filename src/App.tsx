import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { seedCategories } from './db'
import { useAuthStore } from './store/auth'
import { pullFromCloud } from './lib/sync'
import { syncEnabled } from './lib/supabase'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Wallets from './pages/Wallets'
import Transactions from './pages/Transactions'
import Login from './pages/Login'

export default function App() {
  const { user, loading, init } = useAuthStore()

  useEffect(() => {
    seedCategories()
    init()
  }, [])

  // Pull cloud data on login
  useEffect(() => {
    if (user) {
      pullFromCloud(user.id).catch(console.error)
    }
  }, [user?.id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  // If sync is enabled, require login
  if (syncEnabled && !user) return <Login />

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="wallets" element={<Wallets />} />
          <Route path="transactions" element={<Transactions />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
