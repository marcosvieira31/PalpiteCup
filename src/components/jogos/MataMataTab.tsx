"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { saveBracketPrediction } from '@/app/(app)/jogos/actions'
import TeamFlag from '@/components/ui/TeamFlag'

const ROUNDS = [
  { key: 'semi', label: 'SEMIFINAIS', slots: 4, points: 10 },
  { key: 'final', label: 'FINALISTAS', slots: 2, points: 20 },
  { key: 'champion', label: 'CAMPEÃO', slots: 1, points: 50 },
]

interface Prediction {
  round: string
  position: number
  predicted_team: string
}

export default function MataMataTab() {
  const [teams, setTeams] = useState<string[]>([])
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [saving, setSaving] = useState<string | null>(null)
  const [locked, setLocked] = useState(false)
  const [search, setSearch] = useState('')
  const [selecting, setSelecting] = useState<{ round: string; position: number } | null>(null)

  useEffect(() => {
    // Busca todos os times da fase de grupos
    supabase
      .from('games')
      .select('home_team, away_team')
      .not('home_team', 'is', null)
      .not('away_team', 'is', null)
      .then(({ data }) => {
        if (!data) return
        const allTeams = new Set<string>()
        data.forEach(g => {
          if (g.home_team) allTeams.add(g.home_team)
          if (g.away_team) allTeams.add(g.away_team)
        })
        setTeams(Array.from(allTeams).sort())
      })

    // Busca palpites existentes
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('bracket_predictions')
        .select('*')
        .eq('user_id', user.id)
        .then(({ data }) => {
          if (data) setPredictions(data)
        })
    })

    // Verifica se está travado
    supabase
      .from('games')
      .select('kickoff_at')
      .eq('round_number', 2)
      .eq('status', 'scheduled')
      .limit(1)
      .then(({ data }) => {
        setLocked(!data || data.length === 0)
      })
  }, [])

  const getPrediction = (round: string, position: number) =>
    predictions.find(p => p.round === round && p.position === position)

  const handleSelect = async (team: string) => {
    if (!selecting || locked) return
    const { round, position } = selecting
    setSaving(`${round}-${position}`)
    try {
      await saveBracketPrediction(round, position, team)
      setPredictions(prev => {
        const filtered = prev.filter(p => !(p.round === round && p.position === position))
        return [...filtered, { round, position, predicted_team: team }]
      })
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(null)
      setSelecting(null)
      setSearch('')
    }
  }

  const filteredTeams = teams.filter(t =>
    t.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 pb-4">
      {/* Banner de status */}
      <div className={`rounded-2xl p-4 text-center ${locked ? 'bg-red-50 border border-red-100' : 'bg-green-50 border border-green-100'}`}>
        <p className={`font-bebas text-lg tracking-wider ${locked ? 'text-red-700' : 'text-green-700'}`}>
          {locked ? '🔒 BRACKET TRAVADO' : '⚡ BRACKET ABERTO'}
        </p>
        <p className={`text-xs mt-1 ${locked ? 'text-red-500' : 'text-green-600'}`}>
          {locked
            ? 'A 2ª rodada já iniciou. Seus palpites estão salvos.'
            : 'Palpite antes da 2ª rodada da fase de grupos!'}
        </p>
      </div>

      {/* Pontuação */}
      <div className="bg-blue-900 rounded-2xl p-4">
        <p className="font-bebas text-lg text-yellow-400 tracking-wider mb-3">🏆 PONTUAÇÃO DO BRACKET</p>
        <div className="grid grid-cols-3 gap-2">
          {ROUNDS.map(r => (
            <div key={r.key} className="bg-white/10 rounded-xl p-2 text-center">
              <p className="font-bebas text-yellow-400 text-xl">{r.points}</p>
              <p className="text-white text-[10px] font-medium">{r.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Seleção por fase */}
      {ROUNDS.map(round => (
        <div key={round.key}>
          <h3 className="font-bebas text-xl tracking-widest text-slate-700 mb-3 flex items-center gap-2">
            <span className="w-8 h-0.5 bg-yellow-400 inline-block" />
            {round.label}
            <span className="text-sm text-slate-400 font-barlow normal-case tracking-normal">
              +{round.points} pts cada
            </span>
          </h3>
          <div className={`grid gap-2 ${round.slots === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {Array.from({ length: round.slots }).map((_, idx) => {
              const pred = getPrediction(round.key, idx)
              const isSelecting = selecting?.round === round.key && selecting?.position === idx
              const isSaving = saving === `${round.key}-${idx}`

              return (
                <button
                  key={idx}
                  onClick={() => !locked && setSelecting(isSelecting ? null : { round: round.key, position: idx })}
                  disabled={locked}
                  className={`rounded-2xl border-2 p-3 transition-all text-left ${
                    isSelecting
                      ? 'border-green-500 bg-green-50'
                      : pred
                      ? 'border-slate-200 bg-white'
                      : 'border-dashed border-slate-300 bg-slate-50'
                  } ${locked ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer hover:border-green-300'}`}
                >
                  {isSaving ? (
                    <p className="text-center text-slate-400 text-sm py-1">Salvando...</p>
                  ) : pred ? (
                    <div className="flex items-center gap-2">
                      <TeamFlag team={pred.predicted_team} size={28} />
                      <span className="font-bold text-slate-800 text-sm">{pred.predicted_team}</span>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm text-center py-1">
                      {locked ? '—' : '+ Escolher time'}
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Modal de seleção de time */}
      {selecting && !locked && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={() => { setSelecting(null); setSearch('') }}>
          <div className="bg-white w-full max-w-[390px] mx-auto rounded-t-3xl p-4 max-h-[70vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
            <p className="font-bebas text-xl tracking-wider text-slate-800 mb-3">ESCOLHA O TIME</p>
            <input
              type="text"
              placeholder="Buscar seleção..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-green-500 mb-3"
              autoFocus
            />
            <div className="space-y-2">
              {filteredTeams.map(team => (
                <button
                  key={team}
                  onClick={() => handleSelect(team)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition-colors text-left"
                >
                  <TeamFlag team={team} size={32} />
                  <span className="font-medium text-slate-800">{team}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
