"use client"
import { useState } from 'react'
import { saveGroupFilter } from '@/app/(app)/group/[id]/actions'

const PHASES = [
  { key: 'Grupo A', label: 'Grupo A' },
  { key: 'Grupo B', label: 'Grupo B' },
  { key: 'Grupo C', label: 'Grupo C' },
  { key: 'Grupo D', label: 'Grupo D' },
  { key: 'Grupo E', label: 'Grupo E' },
  { key: 'Grupo F', label: 'Grupo F' },
  { key: 'Grupo G', label: 'Grupo G' },
  { key: 'Grupo H', label: 'Grupo H' },
  { key: 'Grupo I', label: 'Grupo I' },
  { key: 'Grupo J', label: 'Grupo J' },
  { key: 'Grupo K', label: 'Grupo K' },
  { key: 'Grupo L', label: 'Grupo L' },
  { key: 'round_of_32', label: '16-avos' },
  { key: 'round_of_16', label: 'Oitavas' },
  { key: 'quarter', label: 'Quartas' },
  { key: 'semi', label: 'Semifinal' },
  { key: 'final', label: 'Final' },
]

interface Props {
  groupId: number | string
  initialTeams: string[]
  initialPhases: string[]
  locked: boolean
  allTeams: string[]
  onSaved?: () => void
}

export default function GroupFilterConfig({
  groupId, initialTeams, initialPhases, locked, allTeams, onSaved
}: Props) {
  const [filterTeams, setFilterTeams] = useState<string[]>(initialTeams)
  const [filterPhases, setFilterPhases] = useState<string[]>(initialPhases)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'teams' | 'phases'>('teams')

  const toggleTeam = (team: string) => {
    setFilterTeams(prev =>
      prev.includes(team) ? prev.filter(t => t !== team) : [...prev, team]
    )
  }

  const togglePhase = (phase: string) => {
    setFilterPhases(prev =>
      prev.includes(phase) ? prev.filter(p => p !== phase) : [...prev, phase]
    )
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await saveGroupFilter(groupId, filterTeams, filterPhases)
      setSaved(true)
      onSaved?.()
      setTimeout(() => setSaved(false), 2000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const hasFilter = filterTeams.length > 0 || filterPhases.length > 0
  const filteredTeams = allTeams.filter(t =>
    t.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="font-bebas text-lg tracking-wider text-slate-800">
            ⚙️ CONFIGURAR JOGOS
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {locked
              ? '🔒 Filtro travado — jogos já iniciaram'
              : hasFilter
              ? `${filterTeams.length} seleções + ${filterPhases.length} fases selecionadas`
              : 'Todos os jogos contam (padrão)'}
          </p>
        </div>
        {!locked && hasFilter && (
          <button
            onClick={() => { setFilterTeams([]); setFilterPhases([]) }}
            className="text-xs text-red-400 font-medium"
          >
            Limpar filtro
          </button>
        )}
      </div>

      {locked ? (
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <p className="text-red-600 text-sm font-medium">
            🔒 Filtro travado pois os jogos selecionados já iniciaram.
          </p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setTab('teams')}
              className={`flex-1 py-2 text-xs font-bebas tracking-wider rounded-xl transition-colors ${
                tab === 'teams' ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              🏳️ SELEÇÕES ({filterTeams.length})
            </button>
            <button
              onClick={() => setTab('phases')}
              className={`flex-1 py-2 text-xs font-bebas tracking-wider rounded-xl transition-colors ${
                tab === 'phases' ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              🏆 FASES ({filterPhases.length})
            </button>
          </div>

          {tab === 'teams' && (
            <>
              <input
                type="text"
                placeholder="Buscar seleção..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-500 mb-3"
              />
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {filteredTeams.map(team => (
                  <button
                    key={team}
                    onClick={() => toggleTeam(team)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left text-xs transition-colors ${
                      filterTeams.includes(team)
                        ? 'bg-green-50 border-green-400 text-green-700 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>{filterTeams.includes(team) ? '✅' : '⬜'}</span>
                    <span className="truncate">{team}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {tab === 'phases' && (
            <div className="grid grid-cols-2 gap-2">
              {PHASES.map(phase => (
                <button
                  key={phase.key}
                  onClick={() => togglePhase(phase.key)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-left text-xs transition-colors ${
                    filterPhases.includes(phase.key)
                      ? 'bg-green-50 border-green-400 text-green-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span>{filterPhases.includes(phase.key) ? '✅' : '⬜'}</span>
                  <span>{phase.label}</span>
                </button>
              ))}
            </div>
          )}

          {error && <p className="text-red-500 text-xs mt-3 text-center">{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full mt-4 font-bebas text-lg tracking-widest rounded-xl py-3 transition-all ${
              saved
                ? 'bg-green-500 text-white'
                : saving
                ? 'bg-slate-200 text-slate-400'
                : 'bg-blue-900 text-yellow-400 active:scale-95'
            }`}
          >
            {saved ? '✅ SALVO!' : saving ? 'SALVANDO...' : 'SALVAR FILTRO'}
          </button>
        </>
      )}
    </div>
  )
}
