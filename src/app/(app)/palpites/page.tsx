import { createClient } from '@/lib/supabase/server'
import PalpitarClient from '@/components/palpites/PalpitarClient'

export default async function PalpitarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: allGames } = await supabase
    .from('games')
    .select('*')
    .eq('status', 'scheduled')
    .not('home_team', 'is', null)
    .not('away_team', 'is', null)
    .not('round_number', 'is', null)
    .order('kickoff_at')

  // Pega o menor round_number disponível
  const nextRoundNumber = allGames?.[0]?.round_number ?? 1

  // Filtra apenas jogos dessa rodada
  const games = (allGames ?? []).filter(g => g.round_number === nextRoundNumber)

  // Busca palpites existentes do usuário para esses jogos
  const { data: bets } = games.length > 0
    ? await supabase
        .from('bets')
        .select('*')
        .eq('user_id', user?.id ?? '')
        .in('game_id', games.map(g => g.id))
    : { data: [] }

  const roundName = games[0]?.round_number
    ? `${games[0].round_number}ª Rodada — Fase de Grupos`
    : games[0]?.group_stage ?? 'Próxima Fase'

  return (
    <PalpitarClient
      games={games ?? []}
      existingBets={bets ?? []}
      roundName={roundName}
    />
  )
}
