import { useEffect, useMemo, useState } from 'react'
import { TrendingUp, TrendingDown, Wallet, Plus } from 'lucide-react'
import { useWalletStore, useTransactionStore } from '../store'
import { AddTransactionModal } from '../components/AddTransactionModal'
import type { TransactionType } from '../types'

function formatARS(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short' }).format(new Date(d))
}

export default function Dashboard() {
  const { wallets, fetchWallets } = useWalletStore()
  const { transactions, fetchTransactions, addTransaction } = useTransactionStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<TransactionType>('expense')

  useEffect(() => { fetchWallets(); fetchTransactions() }, [])

  const thisMonth = useMemo(() => {
    const now = new Date()
    return transactions.filter(t => {
      const d = new Date(t.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
  }, [transactions])

  const income = thisMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = thisMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance = income - expense

  const recent = transactions.slice(0, 8)

  const walletName = (id: number) => wallets.find(w => w.id === id)?.name ?? '—'

  const openModal = (type: TransactionType) => { setModalType(type); setModalOpen(true) }

  return (
    <div className="space-y-6">
      {/* Balance card */}
      <div className="bg-zinc-900 rounded-2xl p-5 text-white">
        <p className="text-xs text-zinc-400 uppercase tracking-widest font-medium mb-1">Balance del mes</p>
        <p className={`text-3xl font-semibold tracking-tight ${balance >= 0 ? 'text-white' : 'text-rose-400'}`}>
          {formatARS(balance)}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => openModal('income')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl px-3 py-2.5 transition-all cursor-pointer"
          >
            <TrendingDown size={15} className="text-emerald-400" />
            <div className="text-left">
              <p className="text-[10px] text-zinc-400">Ingresos</p>
              <p className="text-sm font-medium text-emerald-400">{formatARS(income)}</p>
            </div>
          </button>
          <button
            onClick={() => openModal('expense')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl px-3 py-2.5 transition-all cursor-pointer"
          >
            <TrendingUp size={15} className="text-rose-400" />
            <div className="text-left">
              <p className="text-[10px] text-zinc-400">Gastos</p>
              <p className="text-sm font-medium text-rose-400">{formatARS(expense)}</p>
            </div>
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => openModal('income')}
          className="flex items-center gap-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-2xl px-4 py-3 transition-all cursor-pointer text-left"
        >
          <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Plus size={16} className="text-white" />
          </div>
          <span className="text-sm font-medium text-emerald-800">Ingreso</span>
        </button>
        <button
          onClick={() => openModal('expense')}
          className="flex items-center gap-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-2xl px-4 py-3 transition-all cursor-pointer text-left"
        >
          <div className="w-8 h-8 bg-rose-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Plus size={16} className="text-white" />
          </div>
          <span className="text-sm font-medium text-rose-800">Gasto</span>
        </button>
      </div>

      {/* Wallets summary */}
      {wallets.length > 0 && (
        <div>
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-2.5">Billeteras</p>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {wallets.map(w => (
              <div key={w.id} className="flex-shrink-0 bg-zinc-50 border border-zinc-100 rounded-xl px-3 py-2">
                <p className="text-xs font-medium text-zinc-700 whitespace-nowrap">{w.name}</p>
                <p className="text-[10px] text-zinc-400 font-mono whitespace-nowrap">{w.alias}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent transactions */}
      <div>
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-2.5">Últimos movimientos</p>
        {recent.length === 0 ? (
          <div className="text-center py-10 text-zinc-300">
            <Wallet size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Todavía no hay movimientos</p>
            <p className="text-xs mt-1">Registrá tu primer ingreso o gasto</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {recent.map(t => (
              <div key={t.id} className="flex items-center justify-between bg-zinc-50 rounded-xl px-3.5 py-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.type === 'income' ? 'bg-emerald-500' : 'bg-rose-400'}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-800 truncate">{t.category}</p>
                    <p className="text-[10px] text-zinc-400">{walletName(t.walletId)} · {formatDate(t.date)}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold flex-shrink-0 ml-2 ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatARS(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddTransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={addTransaction}
        defaultType={modalType}
      />
    </div>
  )
}
