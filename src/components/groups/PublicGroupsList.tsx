"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { joinGroup } from '@/app/(app)/groups/actions'

interface Group {
  id: string | number
  name: string
  description: string | null
  type: 'open' | 'moderated'
  group_members: { count: number }[]
}

interface Props {
  groups: Group[]
  myRequests: { group_id: string | number; status: string }[]
  myMemberships: { group_id: string | number }[]
  userId: string
}

export default function PublicGroupsList({ groups, myRequests, myMemberships, userId }: Props) {
  const [loading, setLoading] = useState<string | number | null>(null)
  const [feedback, setFeedback] = useState<Record<string | number, string>>({})
  const router = useRouter()

  const isMember = (groupId: string | number) => myMemberships.some(m => m.group_id === groupId)
  const getRequest = (groupId: string | number) => myRequests.find(r => r.group_id === groupId)

  const handleJoin = async (groupId: string | number) => {
    setLoading(groupId)
    try {
      const result = await joinGroup(groupId)
      if (result.action === 'joined') {
        router.push(`/group/${groupId}`)
      } else {
        setFeedback(prev => ({ ...prev, [groupId]: 'Solicitação enviada! Aguarde aprovação.' }))
      }
    } catch (e: unknown) {
      setFeedback(prev => ({ ...prev, [groupId]: e instanceof Error ? e.message : 'Erro.' }))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="pb-24">
      <div className="bg-green-500 px-4 pt-6 pb-6"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.12) 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }}>
        <h1 className="font-bebas text-4xl text-yellow-400 tracking-widest"
          style={{ textShadow: '2px 2px 0 #1e3a8a' }}>
          GRUPOS PÚBLICOS
        </h1>
        <p className="text-white text-sm mt-1">Encontre um grupo para participar</p>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {groups.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-slate-500 font-medium">Nenhum grupo público ainda.</p>
            <p className="text-slate-400 text-sm mt-1">Crie o primeiro!</p>
          </div>
        )}

        {groups.map(group => {
          const memberCount = group.group_members?.[0]?.count ?? 0
          const member = isMember(group.id)
          const request = getRequest(group.id)
          const fb = feedback[group.id]

          return (
            <div key={group.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span>{group.type === 'open' ? '🌐' : '👋'}</span>
                    <p className="font-bold text-slate-800">{group.name}</p>
                  </div>
                  {group.description && (
                    <p className="text-xs text-slate-400 mt-0.5 ml-6">{group.description}</p>
                  )}
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                  group.type === 'open'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {group.type === 'open' ? 'ABERTO' : 'MODERADO'}
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-3">👥 {memberCount} membro{memberCount !== 1 ? 's' : ''}</p>

              {fb && <p className="text-green-600 text-xs mb-2 text-center font-medium">{fb}</p>}

              {member ? (
                <button
                  onClick={() => router.push(`/group/${group.id}`)}
                  className="w-full bg-green-500 text-white font-bebas tracking-wider rounded-xl py-2.5 text-sm"
                >
                  ✅ JÁ SOU MEMBRO — ENTRAR
                </button>
              ) : request?.status === 'pending' ? (
                <div className="w-full bg-yellow-50 border border-yellow-200 rounded-xl py-2.5 text-center">
                  <p className="text-yellow-700 font-bebas tracking-wider text-sm">⏳ AGUARDANDO APROVAÇÃO</p>
                </div>
              ) : (
                <button
                  onClick={() => handleJoin(group.id)}
                  disabled={loading === group.id}
                  className={`w-full font-bebas tracking-wider rounded-xl py-2.5 text-sm ${
                    group.type === 'open'
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-900 text-yellow-400'
                  } disabled:opacity-50`}
                >
                  {loading === group.id
                    ? 'AGUARDE...'
                    : group.type === 'open'
                    ? '🌐 ENTRAR LIVREMENTE'
                    : '👋 SOLICITAR ENTRADA'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
