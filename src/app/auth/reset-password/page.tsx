"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Supabase processa o token do link automaticamente via hash na URL
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleReset = async () => {
    if (loading) return
    setError('')

    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setError('Não foi possível redefinir a senha. O link pode ter expirado.')
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    }
  }

  return (
    <div className="max-w-[390px] mx-auto min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: '#22c55e', backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.12) 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }}>

      <h1 className="font-bebas text-5xl text-yellow-400 tracking-widest mb-2"
        style={{ textShadow: '2px 2px 0 #1e3a8a' }}>
        PalpiteCup
      </h1>
      <p className="text-white text-sm mb-10 tracking-wide">O bolão da Copa do Mundo 2026</p>

      <div className="w-full bg-white rounded-2xl p-6 flex flex-col gap-3">
        <p className="font-bebas text-xl tracking-wider text-slate-800">🔑 NOVA SENHA</p>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-green-700 font-bold text-sm">✅ Senha redefinida!</p>
            <p className="text-green-600 text-xs mt-1">Redirecionando para o app...</p>
          </div>
        ) : !ready ? (
          <div className="text-center py-4">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Verificando link de recuperação...</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-500">Digite sua nova senha abaixo.</p>

            <input
              type="password"
              placeholder="Nova senha (mín. 8 caracteres)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500"
            />

            <input
              type="password"
              placeholder="Confirmar nova senha"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleReset()}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500"
            />

            {error && (
              <p className="text-sm text-center text-red-500">{error}</p>
            )}

            <button
              onClick={handleReset}
              disabled={loading}
              className={`w-full font-bebas text-xl tracking-widest rounded-xl py-4 transition-all ${
                loading
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-yellow-400 text-blue-900 active:scale-95'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
                  SALVANDO...
                </span>
              ) : 'SALVAR NOVA SENHA'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
