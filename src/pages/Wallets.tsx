import { useEffect, useState } from 'react'
import { Plus, Wallet } from 'lucide-react'
import { useWalletStore } from '../store'
import { WalletCard } from '../components/WalletCard'
import { AddWalletModal } from '../components/AddWalletModal'
import { Button } from '../components/Button'

// Cambiá esto por tu URL de Vercel cuando hagas deploy
const APP_URL = import.meta.env.VITE_APP_URL ?? window.location.origin

export default function Wallets() {
  const { wallets, fetchWallets, addWallet, deleteWallet } = useWalletStore()
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => { fetchWallets() }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-zinc-900">Billeteras</h1>
          <p className="text-xs text-zinc-400">{wallets.length} {wallets.length === 1 ? 'cuenta' : 'cuentas'}</p>
        </div>
        <Button onClick={() => setModalOpen(true)} size="sm">
          <Plus size={15} /> Nueva
        </Button>
      </div>

      {wallets.length === 0 ? (
        <div className="text-center py-16">
          <Wallet size={36} className="mx-auto mb-3 text-zinc-200" />
          <p className="text-sm font-medium text-zinc-400">Agregá tu primera billetera</p>
          <p className="text-xs text-zinc-300 mt-1">Guardá tu alias y CBU para compartirlos rápido</p>
          <Button className="mt-4" onClick={() => setModalOpen(true)}>
            <Plus size={15} /> Agregar billetera
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {wallets.map(w => (
            <WalletCard
              key={w.id}
              wallet={w}
              onDelete={deleteWallet}
              appUrl={APP_URL}
            />
          ))}
        </div>
      )}

      <AddWalletModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={addWallet}
      />
    </div>
  )
}
