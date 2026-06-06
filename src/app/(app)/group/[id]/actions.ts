'use server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const filterSchema = z.object({
  groupId: z.number().int().positive(),
  filterTeams: z.array(z.string()).max(48),
  filterPhases: z.array(z.string()).max(10),
})

export async function saveGroupFilter(
  groupId: number | string,
  filterTeams: string[],
  filterPhases: string[]
) {
  const parsed = filterSchema.safeParse({
    groupId: Number(groupId),
    filterTeams,
    filterPhases
  })
  if (!parsed.success) throw new Error('Dados inválidos.')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado.')

  const { data: group } = await supabase
    .from('groups')
    .select('owner_id, filter_locked')
    .eq('id', groupId)
    .single()

  if (!group) throw new Error('Grupo não encontrado.')
  if (group.owner_id !== user.id) throw new Error('Apenas o líder pode configurar.')
  if (group.filter_locked) throw new Error('Filtro travado — jogos já iniciaram.')

  const { error } = await supabase
    .from('groups')
    .update({
      filter_teams: filterTeams,
      filter_phases: filterPhases
    })
    .eq('id', groupId)

  if (error) throw new Error(error.message)
}
