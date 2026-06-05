"use client"
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    setError('')
    
    if (mode === 'register' && password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.')
      return
    }

    setLoading(true)

    if (mode === 'register') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
          emailRedirectTo: `${location.origin}/dashboard`
        }
      })
      if (error) setError(error.message)
      else setError('Verifique seu email para confirmar o cadastro.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('Email ou senha incorretos.')
      else router.push('/dashboard')
    }

    setLoading(false)
  }

  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-green-500 flex flex-col items-center justify-center px-6"
      style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.12) 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }}>

      <h1 className="font-bebas text-5xl text-yellow-400 tracking-widest mb-2"
        style={{ textShadow: '2px 2px 0 #1e3a8a' }}>
        PalpiteCup
      </h1>
      <p className="text-white text-sm mb-10 tracking-wide">O bolão da Copa do Mundo</p>

      <div className="w-full bg-white rounded-2xl p-6 flex flex-col gap-3 shadow-md">
        <div className="flex rounded-xl overflow-hidden border border-slate-200 mb-2">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-sm font-bebas tracking-wider transition-colors ${mode === 'login' ? 'bg-green-500 text-white' : 'text-slate-400'}`}
          >
            ENTRAR
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2 text-sm font-bebas tracking-wider transition-colors ${mode === 'register' ? 'bg-green-500 text-white' : 'text-slate-400'}`}
          >
            CADASTRAR
          </button>
        </div>

        {mode === 'register' && (
          <input
            placeholder="Nome de usuário"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500"
          />
        )}

        <input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500"
        />

        <input
          type="password"
          placeholder="Senha (mín. 8 caracteres)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500"
        />

        {error && (
          <p className="text-sm text-center text-red-500 font-medium">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-yellow-400 text-blue-900 font-bebas text-xl tracking-widest rounded-xl py-4 disabled:opacity-50 mt-2 active:scale-95 transition-transform"
        >
          {loading ? 'AGUARDE...' : mode === 'login' ? 'ENTRAR' : 'CADASTRAR'}
        </button>
      </div>
    </div>
  )
}
