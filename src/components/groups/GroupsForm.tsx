"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createGroup } from '@/app/(app)/groups/actions'
import { supabase } from '@/lib/supabase/client'

type GroupType = 'private' | 'open' | 'moderated'

const TYPE_INFO = {
  private: { icon: '🔒', label: 'Privado', desc: 'Apenas por código de convite' },
  open: { icon: '🌐', label: 'Aberto', desc: 'Qualquer um pode entrar livremente' },
  moderated: { icon: '👋', label: 'Moderado', desc: 'Líder aprova cada entrada' },
}

export default function GroupsForm() {
  const [tab, setTab] = useState<'create' | 'join'>('create')
  const [groupName, setGroupName] = useState('')
  const [groupType, setGroupType] = useState<GroupType>('private')
  const [description, setDescription] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleCreate = async () => {
    if (!groupName.trim()) return setError('Digite um nome para o grupo.')
    setLoading(true)
    setError('')
    try {
      const group = await createGroup({
        name: groupName,
        type: groupType,
        description: description || undefined,
      })
      router.push(`/group/${group.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao criar grupo.')
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!inviteCode.trim()) return setError('Digite o código do grupo.')
    setLoading(true)
    setError('')
    try {
      const { data: group } = await supabase
        .from('groups')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .single()
      if (!group) return setError('Código inválido.')
      await supabase.from('group_members')
        .upsert({ group_id: group.id, user_id: (await supabase.auth.getUser()).data.user?.id })
      router.push(`/group/${group.id}`)
    } catch {
      setError('Erro ao entrar no grupo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex rounded-xl overflow-hidden border border-slate-200">
        <button onClick={() => setTab('create')}
          className={`flex-1 py-2.5 text-sm font-bebas tracking-wider transition-colors ${tab === 'create' ? 'bg-green-500 text-white' : 'text-slate-400'}`}>
          + CRIAR GRUPO
        </button>
        <button onClick={() => setTab('join')}
          className={`flex-1 py-2.5 text-sm font-bebas tracking-wider transition-colors ${tab === 'join' ? 'bg-green-500 text-white' : 'text-slate-400'}`}>
          🔑 ENTRAR COM CÓDIGO
        </button>
      </div>

      {tab === 'create' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
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

          {/* Tipo do grupo */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tipo do Grupo</p>
            <div className="space-y-2">
              {(Object.entries(TYPE_INFO) as [GroupType, typeof TYPE_INFO[GroupType]][]).map(([type, info]) => (
                <button
                  key={type}
                  onClick={() => setGroupType(type)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-colors ${
                    groupType === type
                      ? 'border-green-500 bg-green-50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <span className="text-xl">{info.icon}</span>
                  <div>
                    <p className={`font-bold text-sm ${groupType === type ? 'text-green-700' : 'text-slate-700'}`}>
                      {info.label}
                    </p>
                    <p className="text-xs text-slate-400">{info.desc}</p>
                  </div>
                  {groupType === type && <span className="ml-auto text-green-500">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full bg-green-500 text-white font-bebas text-lg tracking-widest rounded-xl py-3 disabled:opacity-50"
          >
            {loading ? 'CRIANDO...' : 'CRIAR GRUPO'}
          </button>
        </div>
      )}

      {tab === 'join' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <input
            placeholder="Ex: HEXA26"
            value={inviteCode}
            onChange={e => setInviteCode(e.target.value.toUpperCase())}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500 uppercase font-mono"
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full bg-blue-900 text-yellow-400 font-bebas text-lg tracking-widest rounded-xl py-3 disabled:opacity-50"
          >
            {loading ? 'ENTRANDO...' : 'ENTRAR'}
          </button>
        </div>
      )}
    </div>
  )
}
