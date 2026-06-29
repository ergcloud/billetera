import { Copy, Check, Trash2, Building2 } from 'lucide-react'
import { useClipboard } from '../hooks/useClipboard'
import type { Wallet } from '../types'

const colorMap: Record<string, { bg: string; dot: string; text: string }> = {
  slate:   { bg: 'bg-slate-50',   dot: 'bg-slate-400',   text: 'text-slate-700' },
  violet:  { bg: 'bg-violet-50',  dot: 'bg-violet-500',  text: 'text-violet-700' },
  emerald: { bg: 'bg-emerald-50', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  amber:   { bg: 'bg-amber-50',   dot: 'bg-amber-500',   text: 'text-amber-700' },
  rose:    { bg: 'bg-rose-50',    dot: 'bg-rose-500',    text: 'text-rose-700' },
  sky:     { bg: 'bg-sky-50',     dot: 'bg-sky-500',     text: 'text-sky-700' },
}

interface WalletCardProps {
  wallet: Wallet
  onDelete: (id: number) => void
}

export function WalletCard({ wallet, onDelete }: WalletCardProps) {
  const { copy, copied } = useClipboard()
  const c = colorMap[wallet.color] ?? colorMap.slate

  return (
    <div className={`${c.bg} rounded-2xl p-4 space-y-3`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
          <span className={`text-sm font-semibold ${c.text}`}>{wallet.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="flex items-center gap-1 text-xs text-zinc-400">
            <Building2 size={11} />{wallet.bank}
          </span>
          <button
            onClick={() => onDelete(wallet.id!)}
            className="ml-2 p-1 rounded-lg hover:bg-red-100 text-zinc-300 hover:text-red-400 transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Alias */}
      <div className="flex items-center justify-between bg-white/70 rounded-xl px-3 py-2.5">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium mb-0.5">Alias</p>
          <p className="text-sm font-mono font-medium text-zinc-800">{wallet.alias}</p>
        </div>
        <button
          onClick={() => copy(wallet.alias, `alias-${wallet.id}`)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800 text-xs font-medium transition-all cursor-pointer"
        >
          {copied === `alias-${wallet.id}` ? <><Check size={13} className="text-emerald-500" /> Copiado</> : <><Copy size={13} /> Copiar</>}
        </button>
      </div>

      {/* CBU */}
      <div className="flex items-center justify-between bg-white/70 rounded-xl px-3 py-2.5">
        <div className="min-w-0 mr-2">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium mb-0.5">CBU</p>
          <p className="text-xs font-mono text-zinc-600 truncate">{wallet.cbu}</p>
        </div>
        <button
          onClick={() => copy(wallet.cbu, `cbu-${wallet.id}`)}
          className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800 text-xs font-medium transition-all cursor-pointer"
        >
          {copied === `cbu-${wallet.id}` ? <><Check size={13} className="text-emerald-500" /> Copiado</> : <><Copy size={13} /> Copiar</>}
        </button>
      </div>
    </div>
  )
}
