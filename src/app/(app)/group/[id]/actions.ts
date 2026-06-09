"use server"
import { createClient } from '@/lib/supabase/server'

export async function getFilteredPoints(
  groupId: number,
  filterTeams: string[],
  filterPhases: string[]
) {
  const supabase = await createClient()

  const { data: members } = await supabase
    .from('group_members')
    .select('user_id, users(username, avatar_url)')
    .eq('group_id', groupId)

  if (!members) return []

  const results = await Promise.all(members.map(async (member) => {
    let query = supabase
      .from('bets')
      .select('points_earned, games(home_team, away_team, group_stage)')
      .eq('user_id', member.user_id)

    const { data: bets } = await query

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
