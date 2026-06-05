'use server'
import { createClient } from '@/lib/supabase/server'

export async function submitBet(gameId: number | string, home: number, away: number, joker: boolean) {
  // Validação de input
  if (typeof gameId === 'string' && gameId.startsWith('mock-')) return
  if (!Number.isInteger(home) || !Number.isInteger(away)) {
    throw new Error('Palpite inválido: valores devem ser inteiros.')
  }
  if (home < 0 || away < 0 || home > 99 || away > 99) {
    throw new Error('Palpite inválido: valores devem estar entre 0 e 99.')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuário não autenticado.')
  }

  // Upsert the bet. The unique constraint on user_id and game_id handles the logic.
  const { error } = await supabase.from('bets').upsert({
    user_id: user.id,
    game_id: String(gameId),
    home_bet: home,
    away_bet: away,
    used_joker: joker
  }, { onConflict: 'user_id,game_id' })

  if (error) {
    throw new Error(error.message);
  }

  // Call check badges
  const { checkBadges } = await import('@/lib/badges/check-badges');
  await checkBadges(user.id);
}
