import { useState } from 'react'

export function useClipboard(timeout = 1800) {
  const [copied, setCopied] = useState<string | null>(null)

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      setTimeout(() => setCopied(null), timeout)
    } catch {
      // fallback for older browsers
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(label)
      setTimeout(() => setCopied(null), timeout)
    }
  }

  return { copy, copied }
}
