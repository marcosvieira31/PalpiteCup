'use server'
import { createClient } from '@/lib/supabase/server'
import { betSchema } from '@/lib/validations'
import { z } from 'zod'

export async function submitBet(
  gameId: number | string,
  home: number,
  away: number,
) {
  if (typeof gameId === 'string' && gameId.startsWith('mock-')) return

  const parsed = betSchema.safeParse({
    gameId: Number(gameId),
    home,
    away,
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

  const TEN_MINUTES_MS = 10 * 60 * 1000
  const cutoff = new Date(new Date(game.kickoff_at).getTime() - TEN_MINUTES_MS)
  if (new Date() >= cutoff) {
    throw new Error('Prazo de palpite encerrado (10 minutos antes do início do jogo).')
  }
  if (game.status !== 'scheduled') {
    throw new Error('Jogo já iniciado.')
  }

  const { error } = await supabase.from('bets').upsert({
    user_id: user.id,
    game_id: parsed.data.gameId,
    home_bet: parsed.data.home,
    away_bet: parsed.data.away,
  }, { onConflict: 'user_id,game_id' })

  if (error) throw new Error(error.message)

  const { checkBadges } = await import('@/lib/badges/check-badges')
  await checkBadges(user.id)
}

const jokerSchema = z.object({
  gameId: z.number().int().positive(),
  roundNumber: z.number().int().positive(),
})

export async function toggleJoker(
  gameId: number,
  roundNumber: number,
  activate: boolean,
) {
  const parsed = jokerSchema.safeParse({ gameId, roundNumber })
  if (!parsed.success) {
    console.error('[toggleJoker] validation error:', parsed.error.errors, { gameId, roundNumber, activate })
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

  const TEN_MINUTES_MS = 10 * 60 * 1000
  const cutoff = new Date(new Date(game.kickoff_at).getTime() - TEN_MINUTES_MS)
  if (new Date() >= cutoff) {
    throw new Error('Prazo de palpite encerrado.')
  }

  try {
    if (activate) {
      const { error } = await supabase.from('joker_picks').upsert({
        user_id: user.id,
        game_id: parsed.data.gameId,
        round_number: parsed.data.roundNumber,
      }, { onConflict: 'user_id,round_number' })
      if (error) {
        console.error('[toggleJoker] upsert error:', error)
        throw new Error(error.message)
      }
    } else {
      const { error } = await supabase
        .from('joker_picks')
        .delete()
        .eq('user_id', user.id)
        .eq('game_id', parsed.data.gameId)
      if (error) {
        console.error('[toggleJoker] delete error:', error)
        throw new Error(error.message)
      }
    }
  } catch (err) {
    console.error('[toggleJoker] unexpected error:', err)
    throw err
  }
}
