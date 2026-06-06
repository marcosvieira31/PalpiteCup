'use server'
import { createClient } from '@/lib/supabase/server'
import { betSchema } from '@/lib/validations'

export async function submitBet(
  gameId: number | string,
  home: number,
  away: number,
  joker: boolean
) {
  if (typeof gameId === 'string' && gameId.startsWith('mock-')) return

  const parsed = betSchema.safeParse({
    gameId: Number(gameId),
    home,
    away,
    joker
  })

  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado.')

  const { data: game } = await supabase
    .from('games')
    .select('kickoff_at, status')
    .eq('id', parsed.data.gameId)
    .single()

  if (!game) throw new Error('Jogo não encontrado.')
  if (new Date() >= new Date(game.kickoff_at)) {
    throw new Error('Prazo de palpite encerrado.')
  }
  if (game.status !== 'scheduled') {
    throw new Error('Jogo já iniciado.')
  }

  const { error } = await supabase.from('bets').upsert({
    user_id: user.id,
    game_id: parsed.data.gameId,
    home_bet: parsed.data.home,
    away_bet: parsed.data.away,
    used_joker: parsed.data.joker
  }, { onConflict: 'user_id,game_id' })

  if (error) throw new Error(error.message)

  // Call check badges
  const { checkBadges } = await import('@/lib/badges/check-badges');
  await checkBadges(user.id);
}
