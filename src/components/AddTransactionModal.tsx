import { useState, useEffect } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { db } from '../db'
import { useWalletStore } from '../store'
import type { Transaction, TransactionType, Category } from '../types'

interface AddTransactionModalProps {
  open: boolean
  onClose: () => void
  onSave: (t: Omit<Transaction, 'id'>) => void
  defaultType?: TransactionType
}

export function AddTransactionModal({ open, onClose, onSave, defaultType = 'expense' }: AddTransactionModalProps) {
  const { wallets } = useWalletStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [type, setType] = useState<TransactionType>(defaultType)
  const [form, setForm] = useState({
    walletId: '',
    category: '',
    amount: '',
    note: '',
    date: new Date().toISOString().slice(0, 10),
  })
  const [error, setError] = useState('')

  useEffect(() => {
    db.categories.where('type').equals(type).toArray().then(setCategories)
    setForm(f => ({ ...f, category: '' }))
  }, [type])

  useEffect(() => {
    if (wallets.length > 0 && !form.walletId) {
      setForm(f => ({ ...f, walletId: String(wallets[0].id) }))
    }
  }, [wallets])

  const handleSubmit = () => {
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setError('Ingresá un monto válido'); return
    }
    if (!form.category) { setError('Seleccioná una categoría'); return }
    if (!form.walletId) { setError('Seleccioná una billetera'); return }
    setError('')
    onSave({
      walletId: Number(form.walletId),
      type,
      amount: Number(form.amount),
      category: form.category,
      note: form.note,
      date: new Date(form.date + 'T12:00:00'),
    })
    setForm({ walletId: String(wallets[0]?.id ?? ''), category: '', amount: '', note: '', date: new Date().toISOString().slice(0, 10) })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo movimiento">
      <div className="space-y-3">
        {/* Type toggle */}
        <div className="flex bg-zinc-100 rounded-xl p-1">
          {(['expense', 'income'] as TransactionType[]).map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${type === t ? t === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'bg-white text-emerald-600 shadow-sm' : 'text-zinc-400'}`}
            >
              {t === 'expense' ? '↑ Gasto' : '↓ Ingreso'}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Monto</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium">$</span>
            <input
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 focus:border-zinc-400 focus:bg-white pl-7 pr-3 py-2.5 text-sm outline-none transition-all"
              placeholder="0.00"
              inputMode="decimal"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            />
          </div>
        </div>

        {/* Wallet */}
        <div>
          <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Billetera</label>
          <select
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 focus:border-zinc-400 focus:bg-white px-3 py-2.5 text-sm outline-none transition-all"
            value={form.walletId}
            onChange={e => setForm(f => ({ ...f, walletId: e.target.value }))}
          >
            {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Categoría</label>
          <div className="grid grid-cols-4 gap-1.5">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setForm(f => ({ ...f, category: cat.name }))}
                className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-xs transition-all cursor-pointer ${form.category === cat.name ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 hover:border-zinc-300 text-zinc-600'}`}
              >
                <span className="text-base">{cat.icon}</span>
                <span className="leading-tight text-center">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Note & Date */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Nota (opcional)</label>
            <input
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 focus:border-zinc-400 focus:bg-white px-3 py-2.5 text-sm outline-none transition-all"
              placeholder="Ej: almuerzo"
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Fecha</label>
            <input
              type="date"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 focus:border-zinc-400 focus:bg-white px-3 py-2.5 text-sm outline-none transition-all"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            />
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-2 pt-1">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1" onClick={handleSubmit}>Registrar</Button>
        </div>
      </div>
    </Modal>
  )
}
