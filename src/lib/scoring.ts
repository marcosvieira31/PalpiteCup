export interface LiveGame {
  id: string
  home_score: number | null
  away_score: number | null
  status: string
}

export interface LiveBet {
  user_id: string
  game_id: string
  home_bet: number
  away_bet: number
  used_joker: boolean
}

export function calculateBetPoints(
  homeBet: number,
  awayBet: number,
  homeScore: number,
  awayScore: number,
  usedJoker: boolean
): number {
  let basePoints = 0

  if (homeBet === homeScore && awayBet === awayScore) {
    basePoints = 5
  } else if (
    Math.sign(homeBet - awayBet) === Math.sign(homeScore - awayScore) &&
    (homeBet - awayBet) === (homeScore - awayScore)
  ) {
    basePoints = 3
  } else if (Math.sign(homeBet - awayBet) === Math.sign(homeScore - awayScore)) {
    basePoints = 1
  }

  return usedJoker ? basePoints * 2 : basePoints
}

// Soma pontos parciais de jogos AO VIVO por usuário, a partir dos palpites e placares atuais
export function sumLivePointsByUser(liveGames: LiveGame[], liveBets: LiveBet[]): Record<string, number> {
  const result: Record<string, number> = {}

  for (const bet of liveBets) {
    const game = liveGames.find(g => g.id === bet.game_id)
    if (!game || game.home_score === null || game.away_score === null) continue

    const points = calculateBetPoints(
      bet.home_bet,
      bet.away_bet,
      game.home_score,
      game.away_score,
      bet.used_joker
    )

    result[bet.user_id] = (result[bet.user_id] ?? 0) + points
  }

  return result
}
