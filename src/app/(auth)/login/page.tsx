"use client"
import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import HCaptcha from '@hcaptcha/react-hcaptcha'

type Mode = 'login' | 'register' | 'forgot'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const captchaRef = useRef<HCaptcha>(null)
  const router = useRouter()

  const resetCaptcha = () => {
    captchaRef.current?.resetCaptcha()
    setCaptchaToken(null)
  }

  const handleForgotPassword = async () => {
    if (loading) return
    setError('')
    if (!email) {
      setError('Digite seu email para recuperar a senha.')
      return
    }
    if (!captchaToken) {
      setError('Confirme que você não é um robô.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
      captchaToken,
    })
    resetCaptcha()
    setLoading(false)
    if (error) {
      setError('Não foi possível enviar o email. Verifique o endereço e tente novamente.')
    } else {
      setResetSent(true)
    }
  }

  const handleSubmit = async () => {
    if (loading) return
    setError('')

    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.')
      return
    }

    if (!captchaToken) {
      setError('Confirme que você não é um robô.')
      return
    }

    setLoading(true)

    if (mode === 'register') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          captchaToken
        }
      })
      resetCaptcha()
      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        setError('Verifique seu email para confirmar o cadastro.')
        setLoading(false)
      }
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken }
    })
    resetCaptcha()
    if (error) {
      setError('Email ou senha incorretos.')
      setLoading(false)
      return
    }

    setSuccess(true)
    router.push('/dashboard')
    router.refresh()
  }

  if (success) return (
    <div className="max-w-[390px] mx-auto min-h-screen flex flex-col items-center justify-center"
      style={{ background: '#22c55e', backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.12) 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }}>
      <div className="flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center animate-bounce">
          <span className="text-4xl">⚽</span>
        </div>
        <div className="text-center">
          <p className="font-bebas text-3xl text-yellow-400 tracking-widest"
            style={{ textShadow: '2px 2px 0 #1e3a8a' }}>
            ENTRANDO...
          </p>
          <p className="text-white text-sm mt-2 opacity-80">Preparando seu bolão</p>
        </div>
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 bg-white rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-[390px] mx-auto min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: '#22c55e', backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.12) 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }}>

      <h1 className="font-bebas text-5xl text-yellow-400 tracking-widest mb-2"
        style={{ textShadow: '2px 2px 0 #1e3a8a' }}>
        PalpiteCup
      </h1>
      <p className="text-white text-sm mb-10 tracking-wide">O bolão da Copa do Mundo 2026</p>

      {mode === 'forgot' ? (
        <div className="w-full bg-white rounded-2xl p-6 flex flex-col gap-3">
          <button
            onClick={() => { setMode('login'); setError(''); setResetSent(false); resetCaptcha() }}
            className="text-slate-400 text-sm text-left flex items-center gap-1 mb-1"
          >
            ‹ Voltar ao login
          </button>

          <p className="font-bebas text-xl tracking-wider text-slate-800">🔑 RECUPERAR SENHA</p>
          <p className="text-xs text-slate-500">
            Digite seu email e enviaremos um link para você criar uma nova senha.
          </p>

          {resetSent ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-green-700 font-bold text-sm">✅ Email enviado!</p>
              <p className="text-green-600 text-xs mt-1">
                Verifique sua caixa de entrada e clique no link para redefinir sua senha.
              </p>
            </div>
          ) : (
            <>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleForgotPassword()}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500"
              />

              <div className="flex justify-center">
                <HCaptcha
                  ref={captchaRef}
                  sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
                  onVerify={token => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken(null)}
                />
              </div>

              {error && (
                <p className="text-sm text-center text-red-500">{error}</p>
              )}

              <button
                onClick={handleForgotPassword}
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
                    ENVIANDO...
                  </span>
                ) : 'ENVIAR LINK'}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="w-full bg-white rounded-2xl p-6 flex flex-col gap-3">
          <div className="flex rounded-xl overflow-hidden border border-slate-200 mb-2">
            <button
              onClick={() => { setMode('login'); resetCaptcha(); setError('') }}
              className={`flex-1 py-2 text-sm font-bebas tracking-wider transition-colors ${mode === 'login' ? 'bg-green-500 text-white' : 'text-slate-400'}`}
            >
              ENTRAR
            </button>
            <button
              onClick={() => { setMode('register'); resetCaptcha(); setError('') }}
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
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500"
          />

          <input
            type="password"
            placeholder="Senha (mín. 8 caracteres)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500"
          />

          {mode === 'login' && (
            <button
              onClick={() => { setMode('forgot'); setError('') }}
              className="text-xs text-slate-400 text-right hover:text-green-600 transition-colors -mt-1"
            >
              Esqueci minha senha
            </button>
          )}

          <div className="flex justify-center">
            <HCaptcha
              ref={captchaRef}
              sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
              onVerify={token => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken(null)}
            />
          </div>

          {error && (
            <p className="text-sm text-center text-red-500">{error}</p>
          )}

          <button
            onClick={handleSubmit}
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
                AGUARDE...
              </span>
            ) : mode === 'login' ? 'ENTRAR' : 'CADASTRAR'}
          </button>
        </div>
      )}
    </div>
  )
}
