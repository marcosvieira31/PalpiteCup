"use client"
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function GroupsForm() {
  const [groupName, setGroupName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const router = useRouter()

  const createGroup = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    const code = Math.random().toString(36).substring(2, 8).toUpperCase()

    const { data: group, error } = await supabase
      .from('groups')
      .insert({ name: groupName, invite_code: code, owner_id: user?.id })
      .select()
      .single()

    if (error || !group) {
      return alert(`Erro: ${error?.message} | Code: ${error?.code} | Details: ${error?.details}`)
    }

    await supabase.from('group_members')
      .insert({ group_id: group.id, user_id: user?.id })

    router.push(`/group/${group.id}`)
  }

  const joinGroup = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    const { data: group } = await supabase
      .from('groups')
      .select('*')
      .eq('invite_code', inviteCode.toUpperCase())
      .single()

    if (!group) return alert('Código inválido!')

    await supabase.from('group_members')
      .upsert({ group_id: group.id, user_id: user?.id })

    router.push(`/group/${group.id}`)
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4 shadow-sm">
        <h2 className="font-bebas text-xl tracking-wider text-slate-700 mb-3">Criar Grupo</h2>
        <input
          placeholder="Nome do grupo"
          value={groupName}
          onChange={e => setGroupName(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500 mb-3"
        />
        <button
          onClick={createGroup}
          className="w-full bg-green-500 text-white font-bebas text-lg tracking-widest rounded-xl py-3 active:scale-95 transition-transform"
        >
          CRIAR
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h2 className="font-bebas text-xl tracking-wider text-slate-700 mb-3">Entrar com Código</h2>
        <input
          placeholder="Ex: HEXA26"
          value={inviteCode}
          onChange={e => setInviteCode(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500 mb-3 uppercase"
        />
        <button
          onClick={joinGroup}
          className="w-full bg-blue-900 text-yellow-400 font-bebas text-lg tracking-widest rounded-xl py-3 active:scale-95 transition-transform"
        >
          ENTRAR
        </button>
      </div>
    </>
  )
}
