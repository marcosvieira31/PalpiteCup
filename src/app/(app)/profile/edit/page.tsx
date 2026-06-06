"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function EditProfilePage() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('users').select('username').eq('id', user.id).single()
        .then(({ data }) => { if (data) setUsername(data.username) })
    })
  }, [])

  const handleSave = async () => {
    if (!username.trim()) return setError('Nome de usuário não pode estar vazio.')
    if (username.length < 3) return setError('Mínimo 3 caracteres.')
    if (username.length > 20) return setError('Máximo 20 caracteres.')

    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('users')
      .update({ username: username.trim() })
      .eq('id', user.id)

    setLoading(false)

    if (error) {
      if (error.code === '23505') setError('Este nome de usuário já está em uso.')
      else setError('Erro ao salvar. Tente novamente.')
      return
    }

    setSaved(true)
    setTimeout(() => router.push('/profile'), 1500)
  }

  return (
    <div className="pb-24">
      <div className="bg-green-500 px-4 pt-6 pb-6"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.12) 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }}>
        <button onClick={() => router.back()} className="text-white/80 text-sm mb-3 flex items-center gap-1">
          ‹ Voltar
        </button>
        <h1 className="font-bebas text-4xl text-yellow-400 tracking-widest"
          style={{ textShadow: '2px 2px 0 #1e3a8a' }}>
          EDITAR PERFIL
        </h1>
      </div>

      <div className="px-4 mt-6 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
            Nome de Usuário
          </label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            maxLength={20}
            placeholder="Seu nome no bolão"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500"
          />
          <p className="text-xs text-slate-400 mt-1">{username.length}/20 caracteres</p>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          onClick={handleSave}
          disabled={loading || saved}
          className={`w-full font-bebas text-xl tracking-widest rounded-xl py-4 transition-all ${
            saved
              ? 'bg-green-500 text-white'
              : loading
              ? 'bg-slate-200 text-slate-400'
              : 'bg-yellow-400 text-blue-900 active:scale-95'
          }`}
        >
          {saved ? '✅ SALVO!' : loading ? 'SALVANDO...' : 'SALVAR'}
        </button>
      </div>
    </div>
  )
}
