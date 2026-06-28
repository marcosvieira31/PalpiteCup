"use server"
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { DEADLINES } from '@/lib/deadlines'

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

export async function getGroupPoints(groupId: number) {
  // Busca configurações do grupo com a key normal ou admin, mas admin não quebra
  const { data: group } = await supabaseAdmin
    .from('groups')
    .select('filter_teams, filter_phases, scoring_bets, scoring_groups, scoring_journey, scoring_joker, scoring_groups_filter, scoring_journey_filter, scoring_start_date')
    .eq('id', groupId)
    .single()

  if (!group) return []
  console.log(`[getGroupPoints] groupId=${groupId} scoring_groups=${group.scoring_groups} scoring_journey=${group.scoring_journey}`)

  const cutoff = group.scoring_start_date ? new Date(group.scoring_start_date) : null

  const { data: members } = await supabaseAdmin
    .from('group_members')
    .select('user_id, users(username, avatar_url)')
    .eq('group_id', groupId)

  if (!members) return []

  const results = await Promise.all(members.map(async (member) => {
    let totalPoints = 0

    // 1. Pontos de partidas (com filtro de times/fases)
    if (group.scoring_bets !== false) {
      const { data: bets } = await supabaseAdmin
        .from('bets')
        .select('game_id, points_earned, games(home_team, away_team, group_stage, kickoff_at)')
        .eq('user_id', member.user_id)

      // Busca joker_picks do membro para este grupo (para desconto se scoring_joker=false)
      const jokerPickGameIds = new Set<number>()
      if (group.scoring_joker === false) {
        const { data: jokerPicks } = await supabaseAdmin
          .from('joker_picks')
          .select('game_id')
          .eq('user_id', member.user_id)
        ;(jokerPicks ?? []).forEach(jp => jokerPickGameIds.add(Number(jp.game_id)))
      }

      totalPoints += (bets ?? []).reduce((sum, bet) => {
        const game = bet.games as { home_team: string; away_team: string; group_stage: string; kickoff_at: string } | null
        if (!game) return sum

        if (cutoff && new Date(game.kickoff_at) < cutoff) return sum

        const hasTeamFilter = (group.filter_teams?.length ?? 0) > 0
        const hasPhaseFilter = (group.filter_phases?.length ?? 0) > 0

        const teamMatch = !hasTeamFilter ||
          group.filter_teams!.includes(game.home_team) ||
          group.filter_teams!.includes(game.away_team)

        const phaseMatch = !hasPhaseFilter ||
          group.filter_phases!.includes(game.group_stage)

        if (!teamMatch || !phaseMatch) return sum

        let points = bet.points_earned ?? 0

        // Se coringa desativado e esse palpite usou coringa, divide por 2 (remove o x2)
        if (group.scoring_joker === false && jokerPickGameIds.has(Number(bet.game_id))) {
          points = Math.floor(points / 2)
        }

        return sum + points
      }, 0)
    }

    // 2. Pontos de classificação dos grupos
    if (group.scoring_groups && !(cutoff && DEADLINES.groups < cutoff)) {
      const { data: groupPreds } = await supabaseAdmin
        .from('group_predictions')
        .select('points_earned, group_name')
        .eq('user_id', member.user_id)

      const hasGroupFilter = (group.scoring_groups_filter?.length ?? 0) > 0

      totalPoints += (groupPreds ?? []).reduce((sum, p) => {
        if (hasGroupFilter && !group.scoring_groups_filter!.includes(p.group_name)) return sum
        return sum + (p.points_earned ?? 0)
      }, 0)
    }

    // 4. Pontos de jornada
    if (group.scoring_journey && !(cutoff && DEADLINES.journey < cutoff)) {
      const { data: journeyPreds } = await supabaseAdmin
        .from('team_journey_predictions')
        .select('points_earned, team')
        .eq('user_id', member.user_id)

      const hasJourneyFilter = (group.scoring_journey_filter?.length ?? 0) > 0

      totalPoints += (journeyPreds ?? []).reduce((sum, p) => {
        if (hasJourneyFilter && !group.scoring_journey_filter!.includes(p.team)) return sum
        return sum + (p.points_earned ?? 0)
      }, 0)
    }

    return {
      user_id: member.user_id,
      points_total: totalPoints,
      users: member.users
    }
  }))

  console.log(`[getGroupPoints] results groupId=${groupId}`, results.map(r => ({ user_id: r.user_id, points_total: r.points_total })))
  return results.sort((a, b) => {
    if (b.points_total !== a.points_total) return b.points_total - a.points_total
    const aName = (a.users as { username: string } | null)?.username ?? ''
    const bName = (b.users as { username: string } | null)?.username ?? ''
    return aName.localeCompare(bName)
  })
}

const scoringStartDateSchema = z.object({
  groupId: z.number().int().positive(),
  scoringStartDate: z.string().nullable(),
})

export async function saveScoringStartDate(
  groupId: number | string,
  scoringStartDate: string | null
) {
  const parsed = scoringStartDateSchema.safeParse({
    groupId: Number(groupId),
    scoringStartDate,
  })
  if (!parsed.success) throw new Error('Dados inválidos.')

  if (scoringStartDate) {
    const date = new Date(scoringStartDate)
    const now = new Date()
    if (date < now) throw new Error('A data de corte não pode ser no passado.')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado.')

  const { data: group } = await supabase
    .from('groups')
    .select('owner_id')
    .eq('id', groupId)
    .single()

  if (!group) throw new Error('Grupo não encontrado.')
  if (group.owner_id !== user.id) throw new Error('Apenas o líder pode configurar.')

  const { error } = await supabase
    .from('groups')
    .update({ scoring_start_date: scoringStartDate })
    .eq('id', groupId)

  if (error) throw new Error(error.message)
}

const renameGroupSchema = z.object({
  groupId: z.number().int().positive(),
  name: z.string().trim().min(1).max(30),
})

export async function renameGroup(groupId: number | string, name: string) {
  const parsed = renameGroupSchema.safeParse({ groupId: Number(groupId), name })
  if (!parsed.success) throw new Error('Nome inválido. Use entre 1 e 30 caracteres.')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado.')

  const { data: group } = await supabase
    .from('groups')
    .select('owner_id')
    .eq('id', groupId)
    .single()

  if (!group) throw new Error('Grupo não encontrado.')
  if (group.owner_id !== user.id) throw new Error('Apenas o líder pode renomear o grupo.')

  const { error } = await supabase
    .from('groups')
    .update({ name: parsed.data.name })
    .eq('id', groupId)

  if (error) throw new Error(error.message)
}

export async function deleteGroup(groupId: number | string) {
  const id = Number(groupId)
  if (!Number.isInteger(id) || id <= 0) throw new Error('Grupo inválido.')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado.')

  const { data: group } = await supabase
    .from('groups')
    .select('owner_id')
    .eq('id', id)
    .single()

  if (!group) throw new Error('Grupo não encontrado.')
  if (group.owner_id !== user.id) throw new Error('Apenas o líder pode excluir o grupo.')

  // As tabelas relacionadas (group_members, messages, chat_read_status, group_requests)
  // têm "on delete cascade", então deletar o grupo já limpa tudo automaticamente.
  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

const scoringJokerSchema = z.object({
  groupId: z.number().int().positive(),
  scoringJoker: z.boolean(),
})

export async function saveScoringJoker(
  groupId: number | string,
  scoringJoker: boolean
) {
  const parsed = scoringJokerSchema.safeParse({
    groupId: Number(groupId),
    scoringJoker,
  })
  if (!parsed.success) throw new Error('Dados inválidos.')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado.')

  const { data: group } = await supabase
    .from('groups')
    .select('owner_id')
    .eq('id', groupId)
    .single()

  if (!group) throw new Error('Grupo não encontrado.')
  if (group.owner_id !== user.id) throw new Error('Apenas o líder pode configurar.')

  const { error } = await supabase
    .from('groups')
    .update({ scoring_joker: scoringJoker })
    .eq('id', groupId)

  if (error) throw new Error(error.message)
}

export async function getGroupPointsDetailed(groupId: number) {
  const { data: group } = await supabaseAdmin
    .from('groups')
    .select('filter_teams, filter_phases, scoring_bets, scoring_groups, scoring_journey, scoring_joker, scoring_groups_filter, scoring_journey_filter, scoring_start_date')
    .eq('id', groupId)
    .single()

  if (!group) return []

  const cutoff = group.scoring_start_date ? new Date(group.scoring_start_date) : null

  const { data: members } = await supabaseAdmin
    .from('group_members')
    .select('user_id, users(username, avatar_url)')
    .eq('group_id', groupId)

  if (!members) return []

  const results = await Promise.all(members.map(async (member) => {
    // --- PARTIDAS ---
    let betsPoints = 0
    const { data: bets } = await supabaseAdmin
      .from('bets')
      .select('game_id, points_earned, games(home_team, away_team, group_stage, kickoff_at)')
      .eq('user_id', member.user_id)

    const jokerPickGameIds = new Set<number>()
    if (group.scoring_joker === false) {
      const { data: jokerPicks } = await supabaseAdmin
        .from('joker_picks')
        .select('game_id')
        .eq('user_id', member.user_id)
      ;(jokerPicks ?? []).forEach(jp => jokerPickGameIds.add(Number(jp.game_id)))
    }

    if (group.scoring_bets !== false) {
      betsPoints = (bets ?? []).reduce((sum, bet) => {
        const game = bet.games as { home_team: string; away_team: string; group_stage: string; kickoff_at: string } | null
        if (!game) return sum
        if (cutoff && new Date(game.kickoff_at) < cutoff) return sum
        const hasTeamFilter = (group.filter_teams?.length ?? 0) > 0
        const hasPhaseFilter = (group.filter_phases?.length ?? 0) > 0
        const teamMatch = !hasTeamFilter || group.filter_teams!.includes(game.home_team) || group.filter_teams!.includes(game.away_team)
        const phaseMatch = !hasPhaseFilter || group.filter_phases!.includes(game.group_stage)
        if (!teamMatch || !phaseMatch) return sum
        let points = bet.points_earned ?? 0
        if (group.scoring_joker === false && jokerPickGameIds.has(Number(bet.game_id))) {
          points = Math.floor(points / 2)
        }
        return sum + points
      }, 0)
    }

    // --- GRUPOS ---
    let groupsPoints = 0
    const { data: groupPreds } = await supabaseAdmin
      .from('group_predictions')
      .select('group_name, position, predicted_team, points_earned')
      .eq('user_id', member.user_id)

    if (group.scoring_groups && !(cutoff && DEADLINES.groups < cutoff)) {
      const hasGroupFilter = (group.scoring_groups_filter?.length ?? 0) > 0
      groupsPoints = (groupPreds ?? []).reduce((sum, p) => {
        if (hasGroupFilter && !group.scoring_groups_filter!.includes(p.group_name)) return sum
        return sum + (p.points_earned ?? 0)
      }, 0)
    }

    // --- JORNADA ---
    let journeyPoints = 0
    const { data: journeyPreds } = await supabaseAdmin
      .from('team_journey_predictions')
      .select('team, predicted_phase, points_earned')
      .eq('user_id', member.user_id)

    if (group.scoring_journey && !(cutoff && DEADLINES.journey < cutoff)) {
      const hasJourneyFilter = (group.scoring_journey_filter?.length ?? 0) > 0
      journeyPoints = (journeyPreds ?? []).reduce((sum, p) => {
        if (hasJourneyFilter && !group.scoring_journey_filter!.includes(p.team)) return sum
        return sum + (p.points_earned ?? 0)
      }, 0)
    }

    return {
      user_id: member.user_id,
      users: member.users,
      points_total: betsPoints + groupsPoints + journeyPoints,
      points_bets: betsPoints,
      points_groups: groupsPoints,
      points_journey: journeyPoints,
      group_predictions: groupPreds ?? [],
      journey_predictions: journeyPreds ?? [],
    }
  }))

  return results.sort((a, b) => {
    if (b.points_total !== a.points_total) return b.points_total - a.points_total
    const aName = (a.users as { username: string } | null)?.username ?? ''
    const bName = (b.users as { username: string } | null)?.username ?? ''
    return aName.localeCompare(bName)
  })
}
