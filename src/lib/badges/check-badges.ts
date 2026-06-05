import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function checkBadges(userId: string) {
  const { data: bets } = await supabase
    .from('bets')
    .select('*, games(*)')
    .eq('user_id', userId)

  if (!bets) return

  // Vidente: 3 placares exatos na mesma rodada
  const exactBets = bets.filter(b => 
    b.home_bet === b.games?.home_score && 
    b.away_bet === b.games?.away_score
  )
  if (exactBets.length >= 3) {
    await supabase.from('badges')
      .upsert({ user_id: userId, slug: 'vidente' }, { onConflict: 'user_id,slug' })
  }

  // Atrasildo: palpite enviado faltando menos de 5 min para o jogo
  const lastMinuteBets = bets.filter(b => {
    if (!b.games?.kickoff_at) return false;
    const diff = new Date(b.games.kickoff_at).getTime() - new Date(b.submitted_at).getTime()
    return diff <= 5 * 60 * 1000 && diff > 0
  })
  if (lastMinuteBets.length >= 1) {
    await supabase.from('badges')
      .upsert({ user_id: userId, slug: 'atrasildo' }, { onConflict: 'user_id,slug' })
  }
}
