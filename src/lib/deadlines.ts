export const DEADLINES = {
  journey: new Date('2026-06-13T19:00:00-03:00'),
  groups: new Date('2026-06-18T00:00:00-03:00'),
  phase_of_32: new Date('2026-06-29T00:00:00-03:00'),
  round_of_16: new Date('2026-07-04T00:00:00-03:00'),
  quarter_final: new Date('2026-07-09T00:00:00-03:00'),
  semi_final: new Date('2026-07-14T00:00:00-03:00'),
  final: new Date('2026-07-19T00:00:00-03:00'),
}

export type DeadlineKey = keyof typeof DEADLINES

export function getTimeLeft(deadline: Date): {
  expired: boolean
  days: number
  hours: number
  minutes: number
  seconds: number
  label: string
} {
  const now = Date.now()
  const diff = deadline.getTime() - now

  if (diff <= 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0, label: 'ENCERRADO' }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  let label = ''
  if (days > 0) label = `${days}d ${hours}h ${minutes}m`
  else if (hours > 0) label = `${hours}h ${minutes}m ${seconds}s`
  else label = `${minutes}m ${seconds}s`

  return { expired: false, days, hours, minutes, seconds, label }
}

export function getDeadlineLabel(key: DeadlineKey): string {
  const labels: Record<DeadlineKey, string> = {
    journey: 'Até onde vai',
    groups: 'Classificação dos Grupos',
    phase_of_32: 'Bracket — Fase de 32',
    round_of_16: 'Bracket — Oitavas',
    quarter_final: 'Bracket — Quartas',
    semi_final: 'Bracket — Semifinal',
    final: 'Bracket — Final',
  }
  return labels[key]
}

export function getCurrentBracketDeadline(): { key: DeadlineKey; deadline: Date } {
  const now = Date.now()
  const bracketPhases: DeadlineKey[] = ['phase_of_32', 'round_of_16', 'quarter_final', 'semi_final', 'final']
  const next = bracketPhases.find(k => DEADLINES[k].getTime() > now)
  return next
    ? { key: next, deadline: DEADLINES[next] }
    : { key: 'final', deadline: DEADLINES.final }
}
