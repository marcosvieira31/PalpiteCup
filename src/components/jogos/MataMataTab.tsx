"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Game } from '@/types/database'

const ROUNDS = [
  { key: 'Oitavas de final', label: 'OITAVAS' },
  { key: 'Quartas de final', label: 'QUARTAS' },
  { key: 'Semifinal', label: 'SEMIS' },
  { key: 'Disputa de 3º lugar', label: '3º LUGAR' },
  { key: 'Final', label: 'FINAL' },
]

export default function MataMataTab() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('games')
      .select('*')
      .in('group_stage', ROUNDS.map(r => r.key))
      .order('kickoff_at')
      .then(({ data }) => {
        setGames(data ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) return <p className="text-center text-slate-400 py-8">Carregando...</p>

  return (
    <div className="space-y-6">
      {ROUNDS.map(round => {
        const roundGames = games.filter(g => g.group_stage === round.key)
        if (roundGames.length === 0) return null
        return (
          <div key={round.key}>
            <h3 className="font-bebas text-xl tracking-widest text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-yellow-400 inline-block" />
              {round.label}
              <span className="w-8 h-0.5 bg-yellow-400 inline-block" />
            </h3>
            <div className="space-y-2">
              {roundGames.map(game => (
                <div key={game.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-sm flex-1">
                      {game.home_team ?? '🔒 A definir'}
                    </span>
                    <span className="font-bebas text-xl text-slate-800 px-4">
                      {game.status !== 'scheduled'
                        ? `${game.home_score ?? 0} × ${game.away_score ?? 0}`
                        : new Date(game.kickoff_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                    <span className="font-bold text-slate-800 text-sm flex-1 text-right">
                      {game.away_team ?? '🔒 A definir'}
                    </span>
                  </div>
                  {game.venue && (
                    <p className="text-[10px] text-slate-400 text-center mt-1">{game.venue}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
      <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4 text-center">
        <p className="font-bebas text-lg text-blue-900 tracking-wider">PALPITE DE BRACKET</p>
        <p className="text-xs text-blue-600 mt-1">Em breve — preveja o campeão e ganhe pontos bônus! 🏆</p>
      </div>
    </div>
  )
}
