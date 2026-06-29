import { useRef, useState, useEffect, useCallback } from 'react'
import { X, Camera, Check, RefreshCw, Zap } from 'lucide-react'
import { useClipboard } from '../hooks/useClipboard'

interface QRScannerProps {
  open: boolean
  onClose: () => void
}

type State = 'camera' | 'processing' | 'result' | 'error'

export function QRScanner({ open, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const { copy, copied } = useClipboard()

  const [state, setState] = useState<State>('camera')
  const [result, setResult] = useState<{ alias?: string; cbu?: string; raw: string } | null>(null)
  const [error, setError] = useState('')
  const [cameraReady, setCameraReady] = useState(false)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => setCameraReady(true)
      }
    } catch {
      setError('No se pudo acceder a la cámara. Verificá los permisos.')
      setState('error')
    }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setCameraReady(false)
  }, [])

  useEffect(() => {
    if (open) { setState('camera'); setResult(null); setError(''); startCamera() }
    else stopCamera()
    return () => stopCamera()
  }, [open])

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')!.drawImage(video, 0, 0)
    const base64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1]

    setState('processing')

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 200,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: 'image/jpeg', data: base64 }
              },
              {
                type: 'text',
                text: `Analizá esta imagen y extraé datos bancarios argentinos. Buscá:
1. ALIAS: texto con formato PALABRA.PALABRA.PALABRA (puede tener 2-4 palabras separadas por puntos, solo letras y números)
2. CBU: número de exactamente 22 dígitos

Respondé SOLO en JSON sin markdown, ejemplo:
{"alias":"JUAN.GARCIA.BANCO","cbu":"0000003100012345678901"}

Si no encontrás alguno, omití ese campo. Si no hay nada bancario, respondé: {"raw":"no encontrado"}`
              }
            ]
          }]
        })
      })

      const data = await response.json()
      const text = data.content?.find((b: { type: string }) => b.type === 'text')?.text ?? ''

      let parsed: { alias?: string; cbu?: string; raw?: string } = { raw: text }
      try {
        const clean = text.replace(/```json|```/g, '').trim()
        parsed = JSON.parse(clean)
      } catch { /* use raw */ }

      if (parsed.alias || parsed.cbu) {
        setResult({ alias: parsed.alias, cbu: parsed.cbu, raw: text })
        setState('result')
      } else {
        setError('No encontré alias ni CBU en la imagen. Intentá de nuevo con mejor iluminación.')
        setState('error')
      }
    } catch {
      setError('Error al analizar la imagen. Verificá tu conexión.')
      setState('error')
    }
  }

  const retry = () => {
    setState('camera')
    setResult(null)
    setError('')
    startCamera()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-yellow-400" />
          <span className="text-white text-sm font-medium">Leer alias con IA</span>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl bg-white/10 text-white cursor-pointer">
          <X size={18} />
        </button>
      </div>

      {/* Camera / Result area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-4">

        {/* Camera view */}
        {(state === 'camera' || state === 'processing') && (
          <div className="relative w-full max-w-sm">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-2xl object-cover aspect-square"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Scanning frame overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-56 relative">
                {/* Corner marks */}
                {['top-0 left-0 border-t-2 border-l-2', 'top-0 right-0 border-t-2 border-r-2',
                  'bottom-0 left-0 border-b-2 border-l-2', 'bottom-0 right-0 border-b-2 border-r-2'].map((cls, i) => (
                  <div key={i} className={`absolute w-8 h-8 border-white rounded-sm ${cls}`} />
                ))}
              </div>
            </div>

            {state === 'processing' && (
              <div className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-white text-sm font-medium">Analizando imagen…</p>
              </div>
            )}
          </div>
        )}

        {/* Result */}
        {state === 'result' && result && (
          <div className="w-full max-w-sm space-y-3 animate-slide-up">
            <div className="text-center mb-2">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Check size={24} className="text-white" />
              </div>
              <p className="text-white font-medium">¡Datos encontrados!</p>
            </div>

            {result.alias && (
              <div className="bg-white/10 rounded-2xl p-4">
                <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Alias</p>
                <p className="text-white font-mono font-medium text-lg mb-3">{result.alias}</p>
                <button
                  onClick={() => copy(result.alias!, 'alias')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-zinc-900 text-sm font-medium cursor-pointer"
                >
                  {copied === 'alias' ? <><Check size={15} className="text-emerald-500" /> Copiado al portapapeles</> : <><Camera size={15} /> Copiar alias</>}
                </button>
              </div>
            )}

            {result.cbu && (
              <div className="bg-white/10 rounded-2xl p-4">
                <p className="text-xs text-white/50 uppercase tracking-widest mb-1">CBU</p>
                <p className="text-white font-mono text-sm mb-3 break-all">{result.cbu}</p>
                <button
                  onClick={() => copy(result.cbu!, 'cbu')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-zinc-900 text-sm font-medium cursor-pointer"
                >
                  {copied === 'cbu' ? <><Check size={15} className="text-emerald-500" /> Copiado al portapapeles</> : <><Camera size={15} /> Copiar CBU</>}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {state === 'error' && (
          <div className="w-full max-w-sm text-center space-y-3">
            <p className="text-white/70 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Bottom action */}
      <div className="px-4 pb-12 pt-4 flex flex-col items-center gap-3">
        {state === 'camera' && (
          <>
            <p className="text-white/50 text-xs text-center">
              Apuntá la cámara al alias o CBU impreso y presioná capturar
            </p>
            <button
              onClick={captureAndAnalyze}
              disabled={!cameraReady}
              className="w-16 h-16 rounded-full bg-white flex items-center justify-center cursor-pointer disabled:opacity-40 active:scale-95 transition-transform"
            >
              <Camera size={28} className="text-zinc-900" />
            </button>
          </>
        )}

        {(state === 'error' || state === 'result') && (
          <button
            onClick={retry}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/15 text-white text-sm font-medium cursor-pointer"
          >
            <RefreshCw size={15} /> Escanear de nuevo
          </button>
        )}
      </div>
    </div>
  )
}
