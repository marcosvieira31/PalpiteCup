"use server"
import { createClient as createServiceClient } from '@supabase/supabase-js'
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

const supabaseAdmin = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getFilteredPoints(
  groupId: number,
  filterTeams: string[],
  filterPhases: string[]
) {
  const { data: members } = await supabaseAdmin
    .from('group_members')
    .select('user_id, users(username, avatar_url)')
    .eq('group_id', groupId)

  if (!members) return []

  const results = await Promise.all(members.map(async (member) => {
    const { data: bets } = await supabaseAdmin
      .from('bets')
      .select('points_earned, games(home_team, away_team, group_stage)')
      .eq('user_id', member.user_id)

    const filteredPoints = (bets ?? []).reduce((sum, bet) => {
      const game = bet.games as { home_team: string; away_team: string; group_stage: string } | null
      if (!game) return sum

      const teamMatch = filterTeams.length === 0 ||
        filterTeams.includes(game.home_team) ||
        filterTeams.includes(game.away_team)

      const phaseMatch = filterPhases.length === 0 ||
        filterPhases.includes(game.group_stage)

      if (teamMatch && phaseMatch) return sum + (bet.points_earned ?? 0)
      return sum
    }, 0)

    return {
      user_id: member.user_id,
      points_total: filteredPoints,
      users: member.users
    }
  }))

  return results.sort((a, b) => {
    if (b.points_total !== a.points_total) return b.points_total - a.points_total
    const aName = (a.users as { username: string } | null)?.username ?? ''
    const bName = (b.users as { username: string } | null)?.username ?? ''
    return aName.localeCompare(bName)
  })
}
