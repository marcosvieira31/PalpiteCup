import { createClient } from '@/lib/supabase/server'
import PalpitarClient from '@/components/palpites/PalpitarClient'

export default async function PalpitarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date().toISOString()

  // Busca a próxima rodada com jogos ainda não iniciados
  // Agrupa por group_stage e pega o menor kickoff_at futuro
  const { data: nextRoundGames } = await supabase
    .from('games')
    .select('*')
    .eq('status', 'scheduled')
    .not('home_team', 'is', null)
    .not('away_team', 'is', null)
    .order('kickoff_at')

  // Identifica a próxima rodada (group_stage com kickoff mais próximo)
  const nextRound = nextRoundGames?.[0]?.group_stage ?? null

  // Filtra apenas jogos dessa rodada
  const games = nextRound
    ? (nextRoundGames ?? []).filter(g => g.group_stage === nextRound)
    : []

  // Busca palpites existentes do usuário para esses jogos
  const { data: bets } = games.length > 0
    ? await supabase
        .from('bets')
        .select('*')
        .eq('user_id', user?.id ?? '')
        .in('game_id', games.map(g => g.id))
    : { data: [] }

  return (
    <PalpitarClient
      games={games ?? []}
      existingBets={bets ?? []}
      roundName={nextRound ?? 'Próxima Rodada'}
    />
  )
}
