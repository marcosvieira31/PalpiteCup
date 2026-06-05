export const TEAM_TRANSLATIONS: Record<string, string> = {
  'Brazil': 'Brasil',
  'Argentina': 'Argentina',
  'France': 'França',
  'Germany': 'Alemanha',
  'Spain': 'Espanha',
  'Portugal': 'Portugal',
  'England': 'Inglaterra',
  'Netherlands': 'Holanda',
  'Belgium': 'Bélgica',
  'Italy': 'Itália',
  'Croatia': 'Croácia',
  'Uruguay': 'Uruguai',
  'Mexico': 'México',
  'United States': 'Estados Unidos',
  'Canada': 'Canadá',
  'Japan': 'Japão',
  'South Korea': 'Coreia do Sul',
  'Morocco': 'Marrocos',
  'Senegal': 'Senegal',
  'Switzerland': 'Suíça',
  'Denmark': 'Dinamarca',
  'Poland': 'Polônia',
  'Australia': 'Austrália',
  'Ecuador': 'Equador',
  'Iran': 'Irã',
  'Saudi Arabia': 'Arábia Saudita',
  'Qatar': 'Catar',
  'Wales': 'País de Gales',
  'Tunisia': 'Tunísia',
  'Cameroon': 'Camarões',
  'Ghana': 'Gana',
  'Serbia': 'Sérvia',
  'Norway': 'Noruega',
  'Sweden': 'Suécia',
  'Turkey': 'Turquia',
  'Czechia': 'República Tcheca',
  'Bosnia-Herzegovina': 'Bósnia e Herzegovina',
  'Iraq': 'Iraque',
  'Congo DR': 'República Democrática do Congo',
  // adicione conforme necessário
}

export const ROUND_TRANSLATIONS: Record<string, string> = {
  'group': 'Fase de Grupos',
  'round_of_32': 'Trigésima-segundas de final',
  'round_of_16': 'Oitavas de final',
  'quarter_finals': 'Quartas de final',
  'semi_finals': 'Semifinal',
  'third_place': 'Disputa de 3º lugar',
  'final': 'Final'
}

export const PHASE_TRANSLATIONS: Record<string, string> = {
  'PRE': 'Pré-jogo',
  '1H': '1º tempo',
  'HT': 'Intervalo',
  '2H': '2º tempo',
  'ET1': 'Prorrogação 1º tempo',
  'ET2': 'Prorrogação 2º tempo',
  'PEN': 'Pênaltis',
  'FT': 'Encerrado',
  'FT_PEN': 'Encerrado nos pênaltis'
}

export function translateTeam(name: string): string {
  return TEAM_TRANSLATIONS[name] ?? name
}

export function translateRound(round: string): string {
  return ROUND_TRANSLATIONS[round] ?? round
}

export function translatePhase(phase: string): string {
  return PHASE_TRANSLATIONS[phase] ?? phase
}
