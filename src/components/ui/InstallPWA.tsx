"use client"
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPWA() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)

  const handleDismiss = () => {
    localStorage.setItem('pwa-dismissed', 'true')
    setShow(false)
  }

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      // Store prompt globally for the profile button
      ;(window as any).deferredPrompt = e

      if (localStorage.getItem('pwa-dismissed') === 'true') return

      setPrompt(e as BeforeInstallPromptEvent)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!show) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-50 bg-blue-900 rounded-2xl p-4 shadow-xl max-w-[390px] mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚽</span>
          <div>
            <p className="font-bebas text-yellow-400 tracking-wider text-sm">
              INSTALAR PALPITECUP
            </p>
            <p className="text-blue-200 text-xs">Adicione à tela inicial!</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className="text-blue-300 text-xs px-2 py-1"
          >
            Agora não
          </button>
          <button
            onClick={async () => {
              if (prompt) {
                await prompt.prompt()
                setShow(false)
              }
            }}
            className="bg-yellow-400 text-blue-900 font-bebas tracking-wider text-sm px-3 py-1.5 rounded-xl"
          >
            INSTALAR
          </button>
        </div>
      </div>
    </div>
  )
}
