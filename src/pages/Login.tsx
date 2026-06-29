import { useState } from 'react'
import { useAuthStore } from '../store/auth'
import { Button } from '../components/Button'
import { Mail, CheckCircle } from 'lucide-react'

export default function Login() {
  const { sendMagicLink } = useAuthStore()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Ingresá un email válido'); return
    }
    setLoading(true)
    const { error: err } = await sendMagicLink(email.trim())
    setLoading(false)
    if (err) { setError(err); return }
    setSent(true)
  }

  if (sent) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-white">
      <CheckCircle size={40} className="text-emerald-500 mb-4" />
      <h1 className="text-lg font-semibold text-zinc-900 mb-2">Revisá tu email</h1>
      <p className="text-sm text-zinc-500">
        Te enviamos un link a <span className="font-medium text-zinc-700">{email}</span>.
        Hacé click en el link para entrar.
      </p>
      <button
        onClick={() => { setSent(false); setEmail('') }}
        className="mt-6 text-xs text-zinc-400 underline cursor-pointer"
      >
        Usar otro email
      </button>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center">
            <span className="text-white text-xl font-bold">B</span>
          </div>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-zinc-900">Billetera</h1>
            <p className="text-xs text-zinc-400 mt-0.5">Tus cuentas, siempre a mano</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Email</label>
            <input
              type="email"
              placeholder="vos@email.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 focus:border-zinc-400 focus:bg-white px-3 py-2.5 text-sm outline-none transition-all"
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
          <Button className="w-full justify-center" onClick={handleSubmit} disabled={loading}>
            <Mail size={15} />
            {loading ? 'Enviando...' : 'Entrar con magic link'}
          </Button>
        </div>

        <p className="text-center text-xs text-zinc-400">
          Sin contraseña. Te mandamos un link al email.
        </p>
      </div>
    </div>
  )
}
