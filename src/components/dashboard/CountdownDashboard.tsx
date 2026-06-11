"use client"
import Countdown from '@/components/ui/Countdown'
import { DEADLINES, getCurrentBracketDeadline } from '@/lib/deadlines'

export default function CountdownDashboard() {
  const { deadline: bracketDeadline, key: bracketKey } = getCurrentBracketDeadline()

  const bracketLabel: Record<string, string> = {
    phase_of_32: 'Bracket — Fase de 32',
    round_of_16: 'Bracket — Oitavas',
    quarter_final: 'Bracket — Quartas',
    semi_final: 'Bracket — Semifinal',
    final: 'Bracket — Final',
  }

  return (
    <div className="px-4 mt-6 space-y-3">
      <h2 className="font-bebas text-xl tracking-widest text-slate-800">⏱ PRAZOS DOS PALPITES</h2>

      <Countdown
        deadline={DEADLINES.journey}
        label="Até onde vai"
        variant="card"
      />
      <Countdown
        deadline={DEADLINES.groups}
        label="Classificação dos Grupos"
        variant="card"
      />
      <Countdown
        deadline={bracketDeadline}
        label={bracketLabel[bracketKey]}
        variant="card"
      />
    </div>
  )
}
