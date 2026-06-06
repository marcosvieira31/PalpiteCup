'use server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const groupSchema = z.object({
  name: z.string().min(3).max(30).trim(),
  type: z.enum(['private', 'open', 'moderated']),
  description: z.string().max(100).optional(),
  maxMembers: z.number().int().min(2).max(100).optional(),
})

export async function createGroup(formData: {
  name: string
  type: 'private' | 'open' | 'moderated'
  description?: string
  maxMembers?: number
}) {
  const parsed = groupSchema.safeParse(formData)
  if (!parsed.success) throw new Error(parsed.error.errors[0].message)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado.')

  const code = Math.random().toString(36).substring(2, 8).toUpperCase()

  const { data: group, error } = await supabase
    .from('groups')
    .insert({
      name: parsed.data.name,
      invite_code: code,
      owner_id: user.id,
      type: parsed.data.type,
      description: parsed.data.description ?? null,
      max_members: parsed.data.maxMembers ?? null,
    })
    .select().single()

  if (error) throw new Error(error.message)

  await supabase.from('group_members')
    .insert({ group_id: group.id, user_id: user.id })

  return group
}

export async function joinGroup(groupId: string | number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado.')

  const { data: group } = await supabase
    .from('groups').select('*').eq('id', String(groupId)).single()
  if (!group) throw new Error('Grupo não encontrado.')

  // Verifica limite de membros
  if (group.max_members) {
    const { count } = await supabase
      .from('group_members')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', String(groupId))
    if ((count ?? 0) >= group.max_members) throw new Error('Grupo lotado.')
  }

  if (group.type === 'open') {
    await supabase.from('group_members')
      .upsert({ group_id: String(groupId), user_id: user.id })
    return { action: 'joined' }
  }

  if (group.type === 'moderated') {
    await supabase.from('group_requests')
      .upsert({ group_id: String(groupId), user_id: user.id, status: 'pending' },
        { onConflict: 'group_id,user_id' })

    // Notifica o líder
    await supabase.from('notifications').insert({
      user_id: group.owner_id,
      type: 'join_request',
      title: 'Nova solicitação',
      body: `Alguém quer entrar no grupo "${group.name}"`,
      data: { group_id: groupId, user_id: user.id }
    })
    return { action: 'requested' }
  }

  throw new Error('Grupo privado. Use o código de convite.')
}

export async function handleRequest(
  requestId: number,
  action: 'approved' | 'rejected'
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado.')

  const { data: request } = await supabase
    .from('group_requests')
    .select('*, groups(owner_id, name)')
    .eq('id', requestId).single()

  if (!request) throw new Error('Solicitação não encontrada.')
  const group = request.groups as unknown as { owner_id: string; name: string }
  if (group.owner_id !== user.id) throw new Error('Sem permissão.')

  await supabase.from('group_requests')
    .update({ status: action, updated_at: new Date().toISOString() })
    .eq('id', requestId)

  if (action === 'approved') {
    await supabase.from('group_members')
      .upsert({ group_id: request.group_id, user_id: request.user_id })

    await supabase.from('notifications').insert({
      user_id: request.user_id,
      type: 'request_approved',
      title: 'Solicitação aprovada!',
      body: `Você foi aprovado no grupo "${group.name}"`,
      data: { group_id: request.group_id }
    })
  } else {
    await supabase.from('notifications').insert({
      user_id: request.user_id,
      type: 'request_rejected',
      title: 'Solicitação recusada',
      body: `Sua solicitação para "${group.name}" foi recusada.`,
      data: { group_id: request.group_id }
    })
  }
}
