"use client"
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import TeamFlag from '@/components/ui/TeamFlag'
import { BracketPick } from '@/types/database'

const ROUNDS = [
  { key: 'phase_of_32', label: 'FASE DE 32', slots: 32, points: 2 },
  { key: 'round_of_16', label: 'OITAVAS', slots: 16, points: 3 },
  { key: 'quarter_final', label: 'QUARTAS', slots: 8, points: 5 },
  { key: 'semi_final', label: 'SEMIFINAL', slots: 4, points: 8 },
  { key: 'final', label: 'FINALISTAS', slots: 2, points: 15 },
  { key: 'champion', label: 'CAMPEÃO', slots: 1, points: 30 },
]

interface Props {
  allTeams: string[]
  existingPicks: BracketPick[]
  userId: string
}

export default function BracketBetsTab({ allTeams, existingPicks, userId }: Props) {
  const [picks, setPicks] = useState<Record<string, Record<number, string>>>(
    Object.fromEntries(
      ROUNDS.map(r => [
        r.key,
        Object.fromEntries(
          existingPicks
            .filter(p => p.round === r.key)
            .map(p => [p.match_number, p.predicted_team])
        )
      ])
    )
  )
  const [activeRound, setActiveRound] = useState('phase_of_32')
  const [selecting, setSelecting] = useState<{ round: string; slot: number } | null>(null)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState<string | null>(null)

  const handleSelect = async (team: string) => {
    if (!selecting) return
    const { round, slot } = selecting

    setPicks(prev => ({
      ...prev,
      [round]: { ...(prev[round] ?? {}), [slot]: team }
    }))
    setSelecting(null)
    setSearch('')

    setSaving(`${round}-${slot}`)
    await supabase.from('bracket_picks').upsert({
      user_id: userId,
      round,
      match_number: slot,
      predicted_team: team,
    }, { onConflict: 'user_id,round,match_number' })
    setSaving(null)
  }

  const currentRound = ROUNDS.find(r => r.key === activeRound)!
  const currentPicks = picks[activeRound] ?? {}
  const filledCount = Object.keys(currentPicks).length
  const filteredTeams = allTeams.filter(t =>
    t.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="pb-4">
      {/* Seletor de fase */}
      <div className="flex gap-1 overflow-x-auto px-4 mt-0 pb-2">
        {ROUNDS.map(round => {
          const filled = Object.keys(picks[round.key] ?? {}).length
          return (
            <button
              key={round.key}
              onClick={() => setActiveRound(round.key)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl font-bebas text-xs tracking-wider transition-colors relative ${
                activeRound === round.key
                  ? 'bg-blue-900 text-yellow-400'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {round.label}
              {filled > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                  {filled}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="px-4 mt-2">
        {/* Info da fase */}
        <div className="bg-blue-50 rounded-2xl border border-blue-100 p-3 mb-4 flex justify-between items-center">
          <div>
            <p className="text-blue-700 text-xs font-bold">{currentRound.label}</p>
            <p className="text-blue-500 text-[10px]">+{currentRound.points} pts por acerto</p>
          </div>
          <p className="text-blue-700 text-xs font-bold">
            {filledCount}/{currentRound.slots} preenchidos
          </p>
        </div>

        {/* Grid de slots */}
        <div className={`grid gap-2 ${
          currentRound.slots === 1 ? 'grid-cols-1' :
          currentRound.slots <= 4 ? 'grid-cols-2' :
          'grid-cols-2'
        }`}>
          {Array.from({ length: currentRound.slots }).map((_, idx) => {
            const team = currentPicks[idx + 1]
            const isSaving = saving === `${activeRound}-${idx + 1}`

            return (
              <button
                key={idx}
                onClick={() => setSelecting({ round: activeRound, slot: idx + 1 })}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all ${
                  team
                    ? 'border-green-300 bg-green-50'
                    : 'border-dashed border-slate-300 bg-slate-50'
                }`}
              >
                <span className="text-[10px] text-slate-400 font-bold w-4 flex-shrink-0">
                  {idx + 1}
                </span>
                {team ? (
                  <>
                    <TeamFlag team={team} size={22} />
                    <span className="font-bold text-slate-800 text-xs truncate flex-1">{team}</span>
                  </>
                ) : (
                  <span className="text-slate-400 text-xs flex-1">
                    {isSaving ? '...' : '+ Escolher'}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Modal de seleção */}
      {selecting && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center"
          onClick={() => { setSelecting(null); setSearch('') }}>
          <div
            className="bg-white w-full max-w-[390px] rounded-t-3xl"
            style={{ maxHeight: '70vh', paddingBottom: '20px' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-3" />
            <div className="px-4 mb-3">
              <p className="font-bebas text-lg tracking-wider text-slate-800 mb-2">
                {currentRound.label} — Vaga {selecting.slot}
              </p>
              <input
                type="text"
                placeholder="Buscar seleção..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-green-500"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto px-4 space-y-2" style={{ maxHeight: '50vh' }}>
              {filteredTeams.map(team => (
                <button
                  key={team}
                  onClick={() => handleSelect(team)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition-colors text-left"
                >
                  <TeamFlag team={team} size={28} />
                  <span className="font-medium text-slate-800 text-sm">{team}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
