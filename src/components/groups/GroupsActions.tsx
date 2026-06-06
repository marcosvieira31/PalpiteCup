"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createGroup } from '@/app/(app)/groups/actions'
import { supabase } from '@/lib/supabase/client'

type GroupType = 'private' | 'open' | 'moderated'
type Modal = null | 'create' | 'join'

const TYPE_INFO = {
  private: { icon: '🔒', label: 'Privado', desc: 'Apenas por código de convite' },
  open: { icon: '🌐', label: 'Aberto', desc: 'Qualquer um pode entrar livremente' },
  moderated: { icon: '👋', label: 'Moderado', desc: 'Líder aprova cada entrada' },
}

export default function GroupsActions() {
  const [modal, setModal] = useState<Modal>(null)
  const [groupName, setGroupName] = useState('')
  const [groupType, setGroupType] = useState<GroupType>('private')
  const [description, setDescription] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const reset = () => {
    setGroupName('')
    setGroupType('private')
    setDescription('')
    setInviteCode('')
    setError('')
    setModal(null)
  }

  const handleCreate = async () => {
    if (!groupName.trim()) return setError('Digite um nome.')
    setLoading(true)
    setError('')
    try {
      const group = await createGroup({ name: groupName, type: groupType, description })
      router.push(`/group/${group.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao criar.')
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!inviteCode.trim()) return setError('Digite o código.')
    setLoading(true)
    setError('')
    try {
      const { data: group } = await supabase
        .from('groups').select('*')
        .eq('invite_code', inviteCode.toUpperCase()).single()
      if (!group) return setError('Código inválido.')
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('group_members')
        .upsert({ group_id: group.id, user_id: user?.id })
      router.push(`/group/${group.id}`)
    } catch {
      setError('Erro ao entrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* 3 botões de ação */}
      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => setModal('create')}
          className="bg-green-500 text-white rounded-2xl py-3 px-2 text-center active:scale-95 transition-transform">
          <p className="text-xl">➕</p>
          <p className="font-bebas text-xs tracking-wider mt-1">CRIAR</p>
        </button>
        <button onClick={() => setModal('join')}
          className="bg-blue-900 text-yellow-400 rounded-2xl py-3 px-2 text-center active:scale-95 transition-transform">
          <p className="text-xl">🔑</p>
          <p className="font-bebas text-xs tracking-wider mt-1">CÓDIGO</p>
        </button>
        <button onClick={() => router.push('/groups/public')}
          className="bg-white border-2 border-slate-200 text-slate-700 rounded-2xl py-3 px-2 text-center active:scale-95 transition-transform">
          <p className="text-xl">🌐</p>
          <p className="font-bebas text-xs tracking-wider mt-1">PÚBLICOS</p>
        </button>
      </div>

      {/* Modal Criar */}
      {modal === 'create' && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center"
          onClick={reset}>
          <div className="bg-white w-full max-w-[390px] rounded-t-3xl p-5 space-y-4"
            style={{ paddingBottom: '100px' }}
            onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto" />
            <p className="font-bebas text-2xl tracking-wider text-slate-800">➕ CRIAR GRUPO</p>

            <input
              placeholder="Nome do grupo"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              maxLength={30}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500"
            />

            <input
              placeholder="Descrição (opcional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={100}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500"
            />

            <div className="space-y-2">
              {(Object.entries(TYPE_INFO) as [GroupType, typeof TYPE_INFO[GroupType]][]).map(([type, info]) => (
                <button key={type} onClick={() => setGroupType(type)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-colors ${
                    groupType === type ? 'border-green-500 bg-green-50' : 'border-slate-200'
                  }`}>
                  <span className="text-xl">{info.icon}</span>
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${groupType === type ? 'text-green-700' : 'text-slate-700'}`}>
                      {info.label}
                    </p>
                    <p className="text-xs text-slate-400">{info.desc}</p>
                  </div>
                  {groupType === type && <span className="text-green-500 font-bold">✓</span>}
                </button>
              ))}
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <div className="flex gap-2 pb-4">
              <button onClick={reset}
                className="flex-1 bg-slate-100 text-slate-600 font-bebas tracking-wider rounded-xl py-3">
                CANCELAR
              </button>
              <button onClick={handleCreate} disabled={loading}
                className="flex-1 bg-green-500 text-white font-bebas tracking-wider rounded-xl py-3 disabled:opacity-50">
                {loading ? 'CRIANDO...' : 'CRIAR'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Entrar com Código */}
      {modal === 'join' && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center"
          onClick={reset}>
          <div className="bg-white w-full max-w-[390px] rounded-t-3xl p-5 space-y-4"
            style={{ paddingBottom: '100px' }}
            onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto" />
            <p className="font-bebas text-2xl tracking-wider text-slate-800">🔑 ENTRAR COM CÓDIGO</p>

            <input
              placeholder="Ex: HEXA26"
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value.toUpperCase())}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500 uppercase font-mono tracking-widest text-center text-lg"
            />

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <div className="flex gap-2 pb-4">
              <button onClick={reset}
                className="flex-1 bg-slate-100 text-slate-600 font-bebas tracking-wider rounded-xl py-3">
                CANCELAR
              </button>
              <button onClick={handleJoin} disabled={loading}
                className="flex-1 bg-blue-900 text-yellow-400 font-bebas tracking-wider rounded-xl py-3 disabled:opacity-50">
                {loading ? 'ENTRANDO...' : 'ENTRAR'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
