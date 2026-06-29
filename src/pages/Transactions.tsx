import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, SlidersHorizontal } from 'lucide-react'
import { useTransactionStore, useWalletStore } from '../store'
import { AddTransactionModal } from '../components/AddTransactionModal'
import { Button } from '../components/Button'
import type { TransactionType } from '../types'

function formatARS(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d))
}

export default function Transactions() {
  const { transactions, fetchTransactions, addTransaction, deleteTransaction } = useTransactionStore()
  const { wallets, fetchWallets } = useWalletStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all')
  const [filterMonth, setFilterMonth] = useState(() => new Date().toISOString().slice(0, 7))

  useEffect(() => { fetchTransactions(); fetchWallets() }, [])

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date)
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      return (filterType === 'all' || t.type === filterType) && month === filterMonth
    })
  }, [transactions, filterType, filterMonth])

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const walletName = (id: number) => wallets.find(w => w.id === id)?.name ?? '—'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-zinc-900">Movimientos</h1>
          <p className="text-xs text-zinc-400">{filtered.length} registros</p>
        </div>
        <Button onClick={() => setModalOpen(true)} size="sm">
          <Plus size={15} /> Nuevo
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 items-center">
        <SlidersHorizontal size={14} className="text-zinc-300 flex-shrink-0" />
        <input
          type="month"
          value={filterMonth}
          onChange={e => setFilterMonth(e.target.value)}
          className="rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs outline-none focus:border-zinc-400"
        />
        <div className="flex bg-zinc-100 rounded-xl p-0.5 gap-0.5">
          {([['all', 'Todo'], ['income', 'Ingresos'], ['expense', 'Gastos']] as const).map(([v, l]) => (
            <button
              key={v}
              onClick={() => setFilterType(v)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${filterType === v ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Summary bar */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-emerald-50 rounded-xl px-3 py-2">
            <p className="text-[10px] text-emerald-600 uppercase tracking-wider font-medium">Ingresos</p>
            <p className="text-sm font-semibold text-emerald-700">{formatARS(totalIncome)}</p>
          </div>
          <div className="bg-rose-50 rounded-xl px-3 py-2">
            <p className="text-[10px] text-rose-600 uppercase tracking-wider font-medium">Gastos</p>
            <p className="text-sm font-semibold text-rose-600">{formatARS(totalExpense)}</p>
          </div>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-14 text-zinc-300">
          <p className="text-sm">Sin movimientos en este período</p>
          <p className="text-xs mt-1">Cambiá el filtro o registrá uno nuevo</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(t => (
            <div key={t.id} className="flex items-center justify-between bg-zinc-50 hover:bg-zinc-100 rounded-xl px-3.5 py-3 transition-colors group">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.type === 'income' ? 'bg-emerald-500' : 'bg-rose-400'}`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-800 truncate">{t.category}</p>
                  <p className="text-[10px] text-zinc-400 truncate">
                    {t.note ? `${t.note} · ` : ''}{walletName(t.walletId)} · {formatDate(t.date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatARS(t.amount)}
                </span>
                <button
                  onClick={() => deleteTransaction(t.id!)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-100 text-zinc-300 hover:text-red-400 transition-all cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddTransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={addTransaction}
      />
    </div>
  )
}
