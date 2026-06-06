"use client"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
  interface Window {
    deferredPrompt: BeforeInstallPromptEvent | null
  }
}

export default function InstallPWAReset() {
  const handleInstall = async () => {
    const promptEvent = window.deferredPrompt;
    if (!promptEvent) {
      alert('Seu navegador não suporta a instalação direta ou o app já está instalado/sendo usado.');
      return;
    }
    
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      window.deferredPrompt = null;
    }
  }

  return (
    <div onClick={handleInstall} className="bg-white rounded-2xl border border-slate-200 p-4 flex justify-between items-center cursor-pointer active:scale-95 transition-transform">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
          <span className="text-xl">📱</span>
        </div>
        <div>
          <p className="font-bold text-slate-800 text-sm">Instalar App</p>
          <p className="text-xs text-slate-400">Adicione à sua tela inicial</p>
        </div>
      </div>
      <span className="text-slate-300 text-lg">›</span>
    </div>
  )
}
