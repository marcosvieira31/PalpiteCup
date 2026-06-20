import { createClient } from '@/lib/supabase/server'
import PalpitesLayout from '@/components/palpites/PalpitesLayout'

export default async function PalpitesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Jogos agendados para palpitar
  const { data: allGames } = await supabase
    .from('games')
    .select('*')
    .eq('status', 'scheduled')
    .not('home_team', 'is', null)
    .not('away_team', 'is', null)
    .order('kickoff_at')

  const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000
  const now = Date.now()

  const roundNumbers = [...new Set((allGames ?? []).map(g => g.round_number))].sort((a, b) => a - b)
  const currentRoundNumber = roundNumbers[0] ?? 1
  const nextRoundNumber = roundNumbers[1] ?? null

  let visibleRoundNumbers = [currentRoundNumber]

  if (nextRoundNumber !== null) {
    const nextRoundGames = (allGames ?? []).filter(g => g.round_number === nextRoundNumber)
    const firstKickoffNextRound = nextRoundGames.length > 0
      ? Math.min(...nextRoundGames.map(g => new Date(g.kickoff_at).getTime()))
      : null

    if (firstKickoffNextRound !== null && (firstKickoffNextRound - now) <= FIVE_DAYS_MS) {
      visibleRoundNumbers = [currentRoundNumber, nextRoundNumber]
    }
  }

  const games = (allGames ?? []).filter(g => visibleRoundNumbers.includes(g.round_number))

  const { data: bets } = await supabase
    .from('bets')
    .select('*')
    .eq('user_id', user?.id ?? '')
    .in('game_id', games.map(g => g.id))

  const { data: jokerPicks } = await supabase
    .from('joker_picks')
    .select('game_id, round_number')
    .eq('user_id', user?.id ?? '')

  // Todos os times
  const { data: allTeamsData } = await supabase
    .from('games')
    .select('home_team, away_team')
    .not('home_team', 'is', null)

  const allTeams = [...new Set(
    (allTeamsData ?? []).flatMap(g => [g.home_team, g.away_team]).filter(Boolean)
  )].sort() as string[]

  // Palpites existentes
  const { data: groupPredictions } = await supabase
    .from('group_predictions')
    .select('*')
    .eq('user_id', user?.id ?? '')

  const { data: journeyPredictions } = await supabase
    .from('team_journey_predictions')
    .select('*')
    .eq('user_id', user?.id ?? '')

  return (
    <PalpitesLayout
      games={games}
      existingBets={bets ?? []}
      jokerPicks={jokerPicks ?? []}
      allTeams={allTeams}
      groupPredictions={groupPredictions ?? []}
      journeyPredictions={journeyPredictions ?? []}
      userId={user?.id ?? ''}
    />
  )
}
