"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import TeamFlag from '@/components/ui/TeamFlag'
import { formatDateShort, formatTime } from '@/lib/dates'

const ROUNDS = [
  { key: 'R32', label: 'FASE DE 32', short: '32', matches: 16 },
  { key: 'R16', label: 'OITAVAS', short: '16', matches: 8 },
  { key: 'QF', label: 'QUARTAS', short: 'QF', matches: 4 },
  { key: 'SF', label: 'SEMIS', short: 'SF', matches: 2 },
  { key: '3rd', label: '3º LUGAR', short: '3º', matches: 1 },
  { key: 'Final', label: 'FINAL', short: 'F', matches: 1 },
]

interface BracketGame {
  id: number
  home_team: string | null
  away_team: string | null
  home_score: number | null
  away_score: number | null
  status: string
  kickoff_at: string
  group_stage: string | null
}

export default function BracketTab() {
  const [games, setGames] = useState<BracketGame[]>([])
  const [loading, setLoading] = useState(true)
  const [activeRound, setActiveRound] = useState('R32')

  useEffect(() => {
    supabase
      .from('games')
      .select('id, home_team, away_team, home_score, away_score, status, kickoff_at, group_stage')
      .in('group_stage', ROUNDS.map(r => r.key))
      .order('kickoff_at')
      .then(({ data }) => {
        setGames((data as BracketGame[]) ?? [])
        setLoading(false)
      })
  }, [])

  const roundGames = games.filter(g => g.group_stage === activeRound)

  return (
    <div className="pb-4">
      {/* Seletor de fase */}
      <div className="flex gap-1 overflow-x-auto px-4 mt-4 pb-2 scrollbar-hide">
        {ROUNDS.map(round => (
          <button
            key={round.key}
            onClick={() => setActiveRound(round.key)}
            className={`flex-shrink-0 px-3 py-2 rounded-xl font-bebas text-sm tracking-wider transition-colors ${
              activeRound === round.key
                ? 'bg-blue-900 text-yellow-400'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {round.label}
          </button>
        ))}
      </div>

      {loading && (
        <p className="text-center text-slate-400 py-8">Carregando...</p>
      )}

      {/* Lista de jogos da fase */}
      <div className="px-4 mt-4 space-y-3">
        {roundGames.length === 0 && !loading && (
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6 text-center">
            <p className="font-bebas text-lg text-blue-700 tracking-wider">
              {activeRound === 'R32'
                ? '🔒 Confrontos definidos após a fase de grupos'
                : '🔒 Confrontos definidos após a fase anterior'}
            </p>
            <p className="text-xs text-blue-500 mt-1">
              {activeRound === 'R32'
                ? 'A fase de grupos terminou em 27/06/2026'
                : 'Aguarde os resultados da fase anterior'}
            </p>
          </div>
        )}

        {roundGames.map((game, idx) => {
          const isLive = game.status === 'live'
          const isFinished = game.status === 'finished'

          return (
            <div key={game.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Header do jogo */}
              <div className="bg-blue-900 px-4 py-2 flex justify-between items-center">
                <span className="font-bebas text-yellow-400 text-sm tracking-wider">
                  JOGO {String(idx + 1).padStart(2, '0')}
                </span>
                <span className={`text-[9px] ${isLive ? 'text-red-400 animate-pulse' : 'text-blue-100'}`}>
                  {isLive ? '🔴 AO VIVO'
                    : isFinished ? 'ENCERRADO'
                    : formatDateShort(game.kickoff_at) + ' · ' + formatTime(game.kickoff_at)}
                </span>
              </div>

              {/* Confronto */}
              <div className="px-4 py-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <TeamFlag team={game.home_team ?? ''} size={32} />
                  <span className="font-bold text-slate-800 text-sm leading-tight">
                    {game.home_team ?? '🔒 A definir'}
                  </span>
                </div>

                <div className="flex-shrink-0 text-center px-2">
                  {isFinished || isLive ? (
                    <span className="font-bebas text-2xl text-slate-800">
                      {game.home_score ?? 0} × {game.away_score ?? 0}
                    </span>
                  ) : (
                    <span className="font-bebas text-lg text-slate-400">VS</span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-1 justify-end">
                  <span className="font-bold text-slate-800 text-sm text-right leading-tight">
                    {game.away_team ?? '🔒 A definir'}
                  </span>
                  <TeamFlag team={game.away_team ?? ''} size={32} />
                </div>
              </div>

              {/* Vencedor */}
              {isFinished && game.home_score !== null && game.away_score !== null && (
                <div className="px-4 pb-3">
                  <div className="bg-green-50 rounded-xl px-3 py-1.5 text-center">
                    <p className="text-green-700 text-xs font-bold">
                      ✅ CLASSIFICADO:{' '}
                      {game.home_score > game.away_score
                        ? game.home_team
                        : game.home_score < game.away_score
                        ? game.away_team
                        : 'Pênaltis'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legenda */}
      <div className="mx-4 mt-6 bg-slate-50 rounded-2xl p-4">
        <p className="font-bebas text-sm tracking-wider text-slate-600 mb-2">CRONOGRAMA</p>
        <div className="space-y-1">
          {ROUNDS.map(round => (
            <div key={round.key} className="flex justify-between text-xs text-slate-500">
              <span>{round.label}</span>
              <span className="font-medium">
                {round.key === 'R32' ? '28/06 – 03/07' :
                 round.key === 'R16' ? '04/07 – 07/07' :
                 round.key === 'QF' ? '09/07 – 11/07' :
                 round.key === 'SF' ? '14/07 – 15/07' :
                 round.key === '3rd' ? '18/07' :
                 '19/07'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
