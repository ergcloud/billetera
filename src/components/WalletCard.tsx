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

// WhatsApp SVG icon (lucide doesn't have it)
function WhatsAppIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

interface WalletCardProps {
  wallet: Wallet
  onDelete: (id: number) => void
  appUrl?: string
}

export function WalletCard({ wallet, onDelete, appUrl }: WalletCardProps) {
  const { copy, copied } = useClipboard()
  const c = colorMap[wallet.color] ?? colorMap.slate

  const shareOnWhatsApp = () => {
    const lines = [
      `💳 *${wallet.name}* (${wallet.bank})`,
      ``,
      `*Alias:* \`${wallet.alias}\``,
      `*CBU:* \`${wallet.cbu}\``,
    ]
    if (appUrl) {
      lines.push(``, `_Compartido desde ${appUrl}_`)
    }
    const text = encodeURIComponent(lines.join('\n'))
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

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

      {/* WhatsApp share */}
      <button
        onClick={shareOnWhatsApp}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] text-xs font-medium transition-all cursor-pointer"
      >
        <WhatsAppIcon size={14} />
        Compartir por WhatsApp
      </button>
    </div>
  )
}
