"use client"
import Countdown from '@/components/ui/Countdown'
import { DEADLINES } from '@/lib/deadlines'

export default function CountdownDashboard() {
  return (
    <div className="px-4 mt-4 space-y-1.5">
      <h2 className="font-bebas text-sm tracking-widest text-slate-500 uppercase mb-1">⏱ Prazos dos Palpites</h2>
      <Countdown
        deadline={DEADLINES.journey}
        label="Até onde vai"
        variant="mini"
      />
      <Countdown
        deadline={DEADLINES.groups}
        label="Classificação dos Grupos"
        variant="mini"
      />
    </div>
  )
}
