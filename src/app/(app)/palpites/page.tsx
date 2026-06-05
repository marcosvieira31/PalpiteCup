import { createClient } from '@/lib/supabase/server'
import PalpitarClient from '@/components/palpites/PalpitarClient'

export default async function PalpitarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date().toISOString()

  const { data: games } = await supabase
    .from('games')
    .select('*')
    .eq('status', 'scheduled')
    .gt('kickoff_at', now)
    .not('home_team', 'is', null)
    .not('away_team', 'is', null)
    .order('kickoff_at')
    .limit(20)

  const { data: bets } = await supabase
    .from('bets')
    .select('*')
    .eq('user_id', user?.id ?? '')
    .in('game_id', (games ?? []).map(g => g.id))

  return (
    <PalpitarClient
      games={games ?? []}
      existingBets={bets ?? []}
    />
  )
}
