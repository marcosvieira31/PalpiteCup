export const TEAM_FLAGS: Record<string, string> = {
  // Grupo A
  'México': 'mx',
  'África do Sul': 'za',
  'Coreia do Sul': 'kr',
  'República Tcheca': 'cz',

  // Grupo B
  'Canadá': 'ca',
  'Suíça': 'ch',
  'Catar': 'qa',
  'Bósnia e Herzegovina': 'ba',

  // Grupo C
  'Brasil': 'br',
  'Marrocos': 'ma',
  'Haiti': 'ht',
  'Escócia': 'gb-sct',

  // Grupo D
  'Estados Unidos': 'us',
  'Paraguai': 'py',
  'Austrália': 'au',

  // Grupo E
  'Alemanha': 'de',
  'Costa do Marfim': 'ci',
  'Equador': 'ec',
  'Curaçao': 'cw',

  // Grupo F
  'Holanda': 'nl',
  'Japão': 'jp',
  'Tunísia': 'tn',

  // Grupo G
  'Bélgica': 'be',
  'Egito': 'eg',
  'Irã': 'ir',
  'Nova Zelândia': 'nz',

  // Grupo H
  'Espanha': 'es',
  'Uruguai': 'uy',
  'Arábia Saudita': 'sa',
  'Cabo Verde': 'cv',

  // Grupo I
  'França': 'fr',
  'Senegal': 'sn',
  'Noruega': 'no',

  // Grupo J
  'Argentina': 'ar',
  'Argélia': 'dz',
  'Áustria': 'at',
  'Jordânia': 'jo',

  // Grupo K
  'Portugal': 'pt',
  'Colômbia': 'co',
  'Uzbequistão': 'uz',

  // Grupo L
  'Inglaterra': 'gb-eng',
  'Croácia': 'hr',
  'Gana': 'gh',
  'Panamá': 'pa',

  // Extras
  'Turquia': 'tr',
  'Suécia': 'se',
  'Dinamarca': 'dk',
  'Polônia': 'pl',
  'Sérvia': 'rs',
  'Itália': 'it',
  'País de Gales': 'gb-wls',
  'Camarões': 'cm',
  'Iraque': 'iq',
  'Rep. Dem. do Congo': 'cd',
  'Coreia do Norte': 'kp',
}

export function getFlagUrl(teamName: string): string {
  const code = TEAM_FLAGS[teamName]
  if (!code) return ''
  // Usa country-flags.com como CDN alternativa
  return `https://hatscripts.github.io/circle-flags/flags/${code}.svg`
}
