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

  const nextRoundNumber = allGames?.[0]?.round_number ?? 1
  const games = (allGames ?? []).filter(g => g.round_number === nextRoundNumber)

  const { data: bets } = await supabase
    .from('bets')
    .select('*')
    .eq('user_id', user?.id ?? '')
    .in('game_id', games.map(g => g.id))

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

  const { data: bracketPicks } = await supabase
    .from('bracket_picks')
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
      allTeams={allTeams}
      groupPredictions={groupPredictions ?? []}
      bracketPicks={bracketPicks ?? []}
      journeyPredictions={journeyPredictions ?? []}
      userId={user?.id ?? ''}
    />
  )
}
