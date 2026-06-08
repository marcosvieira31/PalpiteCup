"use client"
import { useState } from 'react'

interface Props {
  whatsapp: string
  telegram: string
  twitter: string
  text: string
  label?: string
}

export default function ShareButtons({ whatsapp, telegram, twitter, text, label }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <a href={whatsapp} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-green-500 text-white font-bebas tracking-wider rounded-xl py-3 text-sm active:scale-95 transition-transform">
          📱 WHATSAPP
        </a>
        <a href={telegram} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-blue-500 text-white font-bebas tracking-wider rounded-xl py-3 text-sm active:scale-95 transition-transform">
          ✈️ TELEGRAM
        </a>
        <a href={twitter} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-slate-800 text-white font-bebas tracking-wider rounded-xl py-3 text-sm active:scale-95 transition-transform">
          🐦 TWITTER/X
        </a>
        <button
          onClick={handleCopy}
          className={`flex items-center justify-center gap-2 font-bebas tracking-wider rounded-xl py-3 text-sm active:scale-95 transition-all ${
            copied ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
          }`}>
          {copied ? '✅ COPIADO!' : '📋 COPIAR'}
        </button>
      </div>
    </div>
  )
}
