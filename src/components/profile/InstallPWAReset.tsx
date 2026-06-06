"use client"

export default function InstallPWAReset() {
  return (
    <button
      onClick={() => {
        localStorage.removeItem('pwa-dismissed')
        alert('Banner de instalação reativado!')
      }}
      className="text-xs text-blue-500 underline mt-2 block w-full text-center"
    >
      Reativar banner de instalação do app
    </button>
  )
}
