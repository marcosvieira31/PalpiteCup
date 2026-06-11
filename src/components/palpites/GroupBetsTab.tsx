"use client"
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import TeamFlag from '@/components/ui/TeamFlag'
import { GroupPrediction } from '@/types/database'
import { DEADLINES, getTimeLeft } from '@/lib/deadlines'

const COPA_GROUPS: Record<string, string[]> = {
  'A': ['México', 'África do Sul', 'Coreia do Sul', 'República Tcheca'],
  'B': ['Canadá', 'Suíça', 'Catar', 'Bósnia e Herzegovina'],
  'C': ['Brasil', 'Marrocos', 'Haiti', 'Escócia'],
  'D': ['Estados Unidos', 'Paraguai', 'Austrália', 'Turquia'],
  'E': ['Alemanha', 'Costa do Marfim', 'Equador', 'Curaçao'],
  'F': ['Holanda', 'Japão', 'Tunísia', 'Nova Zelândia'],
  'G': ['Bélgica', 'Egito', 'Irã', 'Nova Zelândia'],
  'H': ['Espanha', 'Uruguai', 'Arábia Saudita', 'Cabo Verde'],
  'I': ['França', 'Senegal', 'Noruega', 'Uzbequistão'],
  'J': ['Argentina', 'Argélia', 'Áustria', 'Jordânia'],
  'K': ['Portugal', 'Colômbia', 'Uzbequistão', 'Iraque'],
  'L': ['Inglaterra', 'Croácia', 'Gana', 'Panamá'],
}

const POSITION_LABELS = ['1º', '2º', '3º', '4º']

interface Props {
  existingPredictions: GroupPrediction[]
  userId: string
}

export default function GroupBetsTab({ existingPredictions, userId }: Props) {
  const [predictions, setPredictions] = useState<Record<string, string[]>>(
    Object.fromEntries(
      Object.keys(COPA_GROUPS).map(group => [
        group,
        [1, 2, 3, 4].map(pos => {
          const pred = existingPredictions.find(
            p => p.group_name === `Grupo ${group}` && p.position === pos
          )
          return pred?.predicted_team ?? ''
        })
      ])
    )
  )
  const [selecting, setSelecting] = useState<{ group: string; position: number } | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const groupsDeadline = getTimeLeft(DEADLINES.groups)
  const isLocked = groupsDeadline.expired

  const handleSelect = async (team: string) => {
    if (isLocked || !selecting) return
    const { group, position } = selecting

    const updated = [...(predictions[group] ?? ['', '', '', ''])]
    updated[position - 1] = team
    setPredictions(prev => ({ ...prev, [group]: updated }))
    setSelecting(null)
    setSearch('')

    setSaving(`${group}-${position}`)
    await supabase.from('group_predictions').upsert({
      user_id: userId,
      group_name: `Grupo ${group}`,
      position,
      predicted_team: team,
    }, { onConflict: 'user_id,group_name,position' })

    setSaving(null)
    setSaved(`${group}-${position}`)
    setTimeout(() => setSaved(null), 1500)
  }

  const groupTeams = selecting ? (COPA_GROUPS[selecting.group] ?? []) : []
  const filteredTeams = groupTeams.filter(t =>
    t.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="px-4 space-y-4 pb-4">
      {/* Info */}
      <div className="bg-blue-50 rounded-2xl border border-blue-100 p-3 text-center">
        <p className="text-blue-700 text-xs font-bold">
          📊 Palpite a ordem de classificação de cada grupo
        </p>
        <p className="text-blue-500 text-[10px] mt-0.5">
          1º exato: 5pts • Posição exata: 3pts • Classificado (top 2): 1pt
        </p>
      </div>

      {/* Grupos */}
      {Object.keys(COPA_GROUPS).map((group) => (
        <div key={group} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-green-500 px-4 py-2">
            <h3 className="font-bebas text-lg text-white tracking-widest">GRUPO {group}</h3>
          </div>
          <div className="p-3 space-y-2">
            {[1, 2, 3, 4].map(position => {
              const selectedTeam = predictions[group]?.[position - 1] ?? ''
              const isSaving = saving === `${group}-${position}`
              const isSaved = saved === `${group}-${position}`

              return (
                <button
                  key={position}
                  onClick={() => !isLocked && setSelecting({ group, position })}
                  disabled={isLocked}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                    isLocked && !selectedTeam
                      ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-50'
                      : isLocked && selectedTeam
                      ? 'border-green-200 bg-green-50/50 cursor-not-allowed opacity-70'
                      : selectedTeam
                      ? 'border-green-300 bg-green-50'
                      : 'border-dashed border-slate-300 bg-slate-50'
                  }`}
                >
                  <span className={`font-bebas text-lg w-6 flex-shrink-0 ${
                    position === 1 ? 'text-yellow-500'
                    : position === 2 ? 'text-slate-400'
                    : 'text-slate-300'
                  }`}>
                    {POSITION_LABELS[position - 1]}
                  </span>

                  {selectedTeam ? (
                    <>
                      <TeamFlag team={selectedTeam} size={24} />
                      <span className="font-bold text-slate-800 text-sm flex-1">{selectedTeam}</span>
                      {isSaving && <span className="text-xs text-slate-400">...</span>}
                      {isSaved && <span className="text-xs text-green-600">✅</span>}
                    </>
                  ) : (
                    <span className="text-slate-400 text-sm flex-1">
                      {isSaving ? 'Salvando...' : '+ Escolher time'}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Modal de seleção */}
      {selecting && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center"
          onClick={() => { setSelecting(null); setSearch('') }}>
          <div
            className="bg-white w-full max-w-[390px] rounded-t-3xl"
            style={{ maxHeight: '70vh', paddingBottom: '100px' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-3" />
            <div className="px-4 mb-3">
              <p className="font-bebas text-lg tracking-wider text-slate-800 mb-2">
                GRUPO {selecting.group} — {POSITION_LABELS[selecting.position - 1]} LUGAR
              </p>
              <input
                type="text"
                placeholder="Buscar time..."
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
