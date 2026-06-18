"use client"
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import TeamFlag from '@/components/ui/TeamFlag'
import { TeamJourneyPrediction } from '@/types/database'
import { DEADLINES, getTimeLeft } from '@/lib/deadlines'

const PHASES = [
  { key: 'group_stage', label: 'Fase de Grupos', short: 'Grupos' },
  { key: 'phase_of_32', label: 'Fase de 32', short: 'F32' },
  { key: 'round_of_16', label: 'Oitavas de Final', short: 'Oitavas' },
  { key: 'quarter_final', label: 'Quartas de Final', short: 'Quartas' },
  { key: 'semi_final', label: 'Semifinal', short: 'Semi' },
  { key: 'third_place', label: '3º Lugar', short: '3º' },
  { key: 'runner_up', label: 'Vice-campeão', short: 'Vice' },
  { key: 'champion', label: 'Campeão', short: '🏆' },
]

const PHASE_LIMITS: Record<string, number> = {
  group_stage: 16,
  phase_of_32: 16,
  round_of_16: 8,
  quarter_final: 4,
  semi_final: 1,
  third_place: 1,
  runner_up: 1,
  champion: 1,
}

interface Props {
  allTeams: string[]
  existingPredictions: TeamJourneyPrediction[]
  userId: string
}

export default function JourneyBetsTab({ allTeams, existingPredictions, userId }: Props) {
  const [predictions, setPredictions] = useState<Record<string, string>>(
    Object.fromEntries(existingPredictions.map(p => [p.team, p.predicted_phase]))
  )
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'filled' | 'empty'>('all')

  const journeyDeadline = getTimeLeft(DEADLINES.journey)
  const isLocked = journeyDeadline.expired

  const handleSelect = async (team: string, phase: string) => {
    if (isLocked) return

    const currentPhaseForTeam = predictions[team]
    const isChangingFromSamePhase = currentPhaseForTeam === phase
    const currentCountInPhase = countByPhase[phase] ?? 0
    const limit = PHASE_LIMITS[phase] ?? Infinity

    if (!isChangingFromSamePhase && currentCountInPhase >= limit) {
      return
    }

    setPredictions(prev => ({ ...prev, [team]: phase }))
    setSaving(team)

    await supabase.from('team_journey_predictions').upsert({
      user_id: userId,
      team,
      predicted_phase: phase,
    }, { onConflict: 'user_id,team' })

    setSaving(null)
    setSaved(team)
    setTimeout(() => setSaved(null), 1500)
  }

  const filledCount = Object.keys(predictions).length

  const countByPhase = Object.values(predictions).reduce((acc, phase) => {
    acc[phase] = (acc[phase] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const filteredTeams = allTeams
    .filter(t => t.toLowerCase().includes(search.toLowerCase()))
    .filter(t => {
      if (filter === 'filled') return !!predictions[t]
      if (filter === 'empty') return !predictions[t]
      return true
    })

  return (
    <div className="px-4 pb-4">
      {/* Info */}
      <div className="bg-blue-50 rounded-2xl border border-blue-100 p-3 mb-4">
        <p className="text-blue-700 text-xs font-bold text-center">
          🗺️ Até onde cada seleção vai chegar?
        </p>
        <p className="text-blue-500 text-[10px] text-center mt-0.5">
          Fase exata: 5pts • Passou da fase de grupos: 2pts
        </p>
        <p className="text-blue-700 text-xs font-bold text-center mt-1">
          {filledCount}/{allTeams.length} seleções preenchidas
        </p>
      </div>

      {/* Busca e filtros */}
      <input
        type="text"
        placeholder="Buscar seleção..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-green-500 mb-3"
      />

      <div className="flex gap-2 mb-4">
        {(['all', 'filled', 'empty'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bebas tracking-wider ${
              filter === f ? 'bg-blue-900 text-yellow-400' : 'bg-slate-100 text-slate-500'
            }`}>
            {f === 'all' ? 'TODAS' : f === 'filled' ? 'PREENCHIDAS' : 'VAZIAS'}
          </button>
        ))}
      </div>

      {/* Lista de times */}
      <div className="space-y-3">
        {filteredTeams.map(team => {
          const selectedPhase = predictions[team]
          const isSaving = saving === team
          const isSaved = saved === team

          return (
            <div key={team} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3">
              <div className="flex items-center gap-3 mb-2">
                <TeamFlag team={team} size={28} />
                <span className="font-bold text-slate-800 text-sm flex-1">{team}</span>
                {isSaving && <span className="text-xs text-slate-400">Salvando...</span>}
                {isSaved && <span className="text-xs text-green-600">✅</span>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PHASES.map(phase => {
                  const isSelected = selectedPhase === phase.key
                  const limit = PHASE_LIMITS[phase.key] ?? Infinity
                  const currentCount = countByPhase[phase.key] ?? 0
                  const isFull = !isSelected && currentCount >= limit
                  const isDisabled = isLocked || isFull

                  return (
                    <button
                      key={phase.key}
                      onClick={() => !isDisabled && handleSelect(team, phase.key)}
                      disabled={isDisabled}
                      title={isFull ? `Limite de ${limit} seleção(ões) atingido nessa fase` : undefined}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                        isDisabled
                          ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                          : isSelected
                          ? 'bg-blue-900 text-yellow-400'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {phase.short}
                      {isFull && ' 🔒'}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
