import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import MatchLive from '@/components/game/MatchLive'

export default async function GamePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: game } = await supabase
    .from('games')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!game) notFound()

  // Busca palpite do usuário para esse jogo
  const { data: { user } } = await supabase.auth.getUser()
  const { data: bet } = await supabase
    .from('bets')
    .select('*')
    .eq('user_id', user?.id ?? '')
    .eq('game_id', game.id)
    .single()

  return <MatchLive game={game} bet={bet} />
}
