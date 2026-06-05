'use server'
import { createClient } from '@/lib/supabase/server'

export async function submitBet(gameId: string, home: number, away: number, joker: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  if (typeof gameId === 'string' && gameId.startsWith('mock-')) {
    return { success: true }
  }

  // Upsert the bet. The unique constraint on user_id and game_id handles the logic.
  const { error } = await supabase.from('bets').upsert({
    user_id: user.id,
    game_id: gameId,
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
