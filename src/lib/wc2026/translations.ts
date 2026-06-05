export const TEAM_TRANSLATIONS: Record<string, string> = {
  // Grupo A
  'Mexico': 'México',
  'South Africa': 'África do Sul',
  'Korea Republic': 'Coreia do Sul',
  'Czechia': 'República Tcheca',

  // Grupo B
  'Canada': 'Canadá',
  'Switzerland': 'Suíça',
  'Qatar': 'Catar',
  'Bosnia-Herzegovina': 'Bósnia e Herzegovina',

  // Grupo C
  'Brazil': 'Brasil',
  'Morocco': 'Marrocos',
  'Haiti': 'Haiti',
  'Scotland': 'Escócia',

  // Grupo D
  'United States': 'Estados Unidos',
  'USA': 'Estados Unidos',
  'Paraguay': 'Paraguai',
  'Australia': 'Austrália',

  // Grupo E
  'Germany': 'Alemanha',
  'Ivory Coast': 'Costa do Marfim',
  "Côte d'Ivoire": 'Costa do Marfim',
  'Ecuador': 'Equador',
  'Curaçao': 'Curaçao',

  // Grupo F
  'Netherlands': 'Holanda',
  'Japan': 'Japão',
  'Tunisia': 'Tunísia',

  // Grupo G
  'Belgium': 'Bélgica',
  'Egypt': 'Egito',
  'Iran': 'Irã',
  'IR Iran': 'Irã',
  'New Zealand': 'Nova Zelândia',

  // Grupo H
  'Spain': 'Espanha',
  'Uruguay': 'Uruguai',
  'Saudi Arabia': 'Arábia Saudita',
  'Cape Verde': 'Cabo Verde',

  // Grupo I
  'France': 'França',
  'Senegal': 'Senegal',
  'Norway': 'Noruega',

  // Grupo J
  'Argentina': 'Argentina',
  'Algeria': 'Argélia',
  'Austria': 'Áustria',
  'Jordan': 'Jordânia',

  // Grupo K
  'Portugal': 'Portugal',
  'Colombia': 'Colômbia',
  'Uzbekistan': 'Uzbequistão',

  // Grupo L
  'England': 'Inglaterra',
  'Croatia': 'Croácia',
  'Ghana': 'Gana',
  'Panama': 'Panamá',

  // Aliases alternativos da API
  'Korea DPR': 'Coreia do Norte',
  'Bosnia and Herzegovina': 'Bósnia e Herzegovina',
  'Czech Republic': 'República Tcheca',
  'Türkiye': 'Turquia',
  'Turkey': 'Turquia',
  'Sweden': 'Suécia',
  'Denmark': 'Dinamarca',
  'Poland': 'Polônia',
  'Serbia': 'Sérvia',
  'Italy': 'Itália',
  'Wales': 'País de Gales',
  'Cameroon': 'Camarões',
  'Iraq': 'Iraque',
  'Congo DR': 'Rep. Dem. do Congo',
  'South Korea': 'Coreia do Sul',
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
