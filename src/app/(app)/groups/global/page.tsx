import { createClient } from '@/lib/supabase/server'
import RankingGlobal from '@/components/ranking/RankingGlobal'

export default async function GroupsGlobalPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: players } = await supabase
    .from('users')
    .select('id, username, points_total, avatar_url')
    .order('points_total', { ascending: false })
    .order('username', { ascending: true })
    .limit(50)

  const { data: liveGames } = await supabase
    .from('games')
    .select('id, home_score, away_score, status')
    .eq('status', 'live')

  const liveGameIds = (liveGames ?? []).map(g => g.id)

  const { data: liveBets } = liveGameIds.length > 0
    ? await supabase
        .from('bets')
        .select('user_id, game_id, home_bet, away_bet')
        .in('game_id', liveGameIds)
    : { data: [] }

  const { data: liveJokerPicks } = liveGameIds.length > 0
    ? await supabase
        .from('joker_picks')
        .select('user_id, game_id')
        .in('game_id', liveGameIds)
    : { data: [] }

  const liveJokerSet = new Set(
    (liveJokerPicks ?? []).map(jp => `${jp.user_id}-${jp.game_id}`)
  )

  const liveBetsWithJoker = (liveBets ?? []).map(b => ({
    ...b,
    has_joker: liveJokerSet.has(`${b.user_id}-${b.game_id}`)
  }))

  return (
    <RankingGlobal
      players={players ?? []}
      currentUserId={user?.id ?? ''}
      initialLiveGames={liveGames ?? []}
      initialLiveBets={liveBetsWithJoker}
    />
  )
}
