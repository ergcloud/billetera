import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import type { Wallet, WalletColor } from '../types'

const COLORS: WalletColor[] = ['slate', 'violet', 'emerald', 'amber', 'rose', 'sky']
const COLOR_LABELS: Record<WalletColor, string> = {
  slate: 'Gris', violet: 'Violeta', emerald: 'Verde', amber: 'Naranja', rose: 'Rosa', sky: 'Azul'
}
const DOT_CLASSES: Record<WalletColor, string> = {
  slate: 'bg-slate-400', violet: 'bg-violet-500', emerald: 'bg-emerald-500',
  amber: 'bg-amber-500', rose: 'bg-rose-500', sky: 'bg-sky-500',
}

interface AddWalletModalProps {
  open: boolean
  onClose: () => void
  onSave: (w: Omit<Wallet, 'id' | 'createdAt'>) => void
}

export function AddWalletModal({ open, onClose, onSave }: AddWalletModalProps) {
  const [form, setForm] = useState({ name: '', alias: '', cbu: '', bank: '', color: 'violet' as WalletColor })
  const [errors, setErrors] = useState<Partial<typeof form>>({})

  const validate = () => {
    const e: Partial<typeof form> = {}
    if (!form.name.trim()) e.name = 'Nombre requerido'
    if (!form.alias.trim()) e.alias = 'Alias requerido'
    if (!form.cbu.trim()) e.cbu = 'CBU requerido'
    else if (!/^\d{22}$/.test(form.cbu.trim())) e.cbu = 'CBU debe tener 22 dígitos'
    if (!form.bank.trim()) e.bank = 'Banco/billetera requerido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSave({ ...form, alias: form.alias.trim(), cbu: form.cbu.trim() })
    setForm({ name: '', alias: '', cbu: '', bank: '', color: 'violet' })
    setErrors({})
    onClose()
  }

  const field = (key: keyof typeof form, label: string, placeholder: string, extra?: object) => (
    <div>
      <label className="text-xs font-medium text-zinc-500 mb-1.5 block">{label}</label>
      <input
        className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all font-mono ${errors[key] ? 'border-red-300 bg-red-50' : 'border-zinc-200 bg-zinc-50 focus:border-zinc-400 focus:bg-white'}`}
        placeholder={placeholder}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        {...extra}
      />
      {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
    </div>
  )

  return (
    <Modal open={open} onClose={onClose} title="Nueva billetera">
      <div className="space-y-3">
        {field('name', 'Nombre', 'Mi cuenta en Mercado Pago')}
        {field('bank', 'Banco / Billetera', 'Mercado Pago, Uala, Brubank…')}
        {field('alias', 'Alias', 'NOMBRE.BANCO.ALGO')}
        {field('cbu', 'CBU', '22 dígitos', { maxLength: 22, inputMode: 'numeric' })}

        <div>
          <label className="text-xs font-medium text-zinc-500 mb-2 block">Color</label>
          <div className="flex gap-2">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setForm(f => ({ ...f, color: c }))}
                title={COLOR_LABELS[c]}
                className={`w-7 h-7 rounded-full ${DOT_CLASSES[c]} transition-all cursor-pointer ${form.color === c ? 'ring-2 ring-offset-2 ring-zinc-400 scale-110' : 'opacity-50 hover:opacity-80'}`}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1" onClick={handleSubmit}>Guardar</Button>
        </div>
      </div>
    </Modal>
  )
}
