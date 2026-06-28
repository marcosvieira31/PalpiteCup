export interface LiveGame {
  id: number | string
  home_score: number | null
  away_score: number | null
  status: string
  home_team?: string | null
  away_team?: string | null
}

export interface LiveBet {
  user_id: string
  game_id: number | string
  home_bet: number
  away_bet: number
}

export function calculateBetPoints(
  homeBet: number,
  awayBet: number,
  homeScore: number,
  awayScore: number,
): number {
  if (homeBet === homeScore && awayBet === awayScore) return 5
  if (
    Math.sign(homeBet - awayBet) === Math.sign(homeScore - awayScore) &&
    (homeBet - awayBet) === (homeScore - awayScore)
  ) return 3
  if (Math.sign(homeBet - awayBet) === Math.sign(homeScore - awayScore)) return 1
  return 0
}

// Soma pontos parciais de jogos AO VIVO por usuário, a partir dos palpites e placares atuais
export function sumLivePointsByUser(liveGames: LiveGame[], liveBets: LiveBet[]): Record<string, number> {
  const result: Record<string, number> = {}

  for (const bet of liveBets) {
    const game = liveGames.find(g => String(g.id) === String(bet.game_id))
    if (!game || game.home_score === null || game.away_score === null) continue

    const points = calculateBetPoints(
      bet.home_bet,
      bet.away_bet,
      game.home_score,
      game.away_score
    )

    result[bet.user_id] = (result[bet.user_id] ?? 0) + points
  }

  return result
}
