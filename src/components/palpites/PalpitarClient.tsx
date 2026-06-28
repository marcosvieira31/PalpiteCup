"use client"
import { useState } from 'react'
import { Game, Bet } from '@/types/database'
import { submitBet } from '@/app/(app)/dashboard/actions'
import TeamFlag from '@/components/ui/TeamFlag'
import { shareBet } from '@/lib/share'
import ShareButtons from '@/components/ui/ShareButtons'
import { formatDate, formatTime, isBeforeKickoff } from '@/lib/dates'

interface Props {
  games: Game[]
  existingBets: Bet[]
}

export default function PalpitarClient({ games, existingBets }: Props) {
  const [bets, setBets] = useState<Record<string, { home: number; away: number }>>(
    Object.fromEntries(existingBets.map(b => [b.game_id, { home: b.home_bet, away: b.away_bet }]))
  )
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [savedGames, setSavedGames] = useState<Set<string | number>>(new Set(existingBets.map(b => b.game_id)))
  const [sharing, setSharing] = useState<string | number | null>(null)

  const updateBet = (gameId: string | number, field: 'home' | 'away', value: number) => {
    setBets(prev => ({
      ...prev,
      [gameId]: { ...prev[gameId] ?? { home: 0, away: 0 }, [field]: Math.max(0, value) }
    }))
  }

  const handleSubmit = async (gameId: string | number) => {
    const bet = bets[String(gameId)] ?? { home: 0, away: 0 }
    setSaving(prev => ({ ...prev, [gameId]: true }))
    try {
      await submitBet(gameId as number, bet.home, bet.away)
      setSaved(prev => ({ ...prev, [gameId]: true }))
      setSavedGames(prev => new Set([...prev, gameId]))
      setTimeout(() => setSaved(prev => ({ ...prev, [gameId]: false })), 2000)
    } finally {
      setSaving(prev => ({ ...prev, [gameId]: false }))
    }
  }

  const pending = games.filter(g => !savedGames.has(g.id))

  const gamesByDate = games.reduce((acc, game) => {
    const date = formatDate(game.kickoff_at)
    if (!acc[date]) acc[date] = []
    acc[date].push(game)
    return acc
  }, {} as Record<string, Game[]>)

  return (
    <div className="pb-4">
      <div className="bg-blue-50 rounded-2xl border border-blue-100 p-3 mt-4 mx-4 text-center">
        <p className="text-blue-700 text-xs font-bold">
          {pending.length > 0
            ? `⚽ ${pending.length} jogo${pending.length > 1 ? 's' : ''} aguardando seu palpite`
            : '✅ Todos os palpites feitos!'}
        </p>
      </div>

      <div className="px-4 mt-4">
        {games.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">⚽</p>
            <p className="text-slate-500 font-medium">Nenhum jogo disponível para palpite.</p>
          </div>
        )}

        {Object.entries(gamesByDate).map(([date, dateGames]) => (
          <div key={date}>
            <h3 className="font-bebas text-base tracking-widest text-slate-500 uppercase mt-6 mb-3">
              📅 {date}
            </h3>
            <div className="space-y-4">
              {dateGames.map(game => {
                const bet = bets[String(game.id)] ?? { home: 0, away: 0 }
                const isSaving = saving[String(game.id)]
                const isSaved = saved[String(game.id)]
                const hasExisting = savedGames.has(game.id)
                const kickoff = new Date(game.kickoff_at)
                const canBet = isBeforeKickoff(game.kickoff_at)
                const diffHours = (kickoff.getTime() - Date.now()) / 1000 / 60 / 60
                const isUrgent = canBet && diffHours < 2

                return (
                  <div key={game.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                    !canBet ? 'border-slate-200 bg-slate-50 opacity-80' : isUrgent ? 'border-red-200' : 'border-slate-200'
                  }`}>
                    <div className={`px-4 py-2 flex justify-between items-center ${
                      !canBet ? 'bg-slate-200' : isUrgent ? 'bg-red-50' : 'bg-slate-50'
                    }`}>
                      <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                        {game.group_stage ?? 'Mata-Mata'}
                      </span>
                      <span className={`text-[10px] font-bold ${!canBet ? 'text-slate-500' : isUrgent ? 'text-red-500' : 'text-slate-400'}`}>
                        {!canBet ? '🔒 ENCERRADO ' : isUrgent ? '🔴 ' : '🕐 '}
                        {formatTime(game.kickoff_at)}
                      </span>
                    </div>

                    <div className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                          <span className="font-bold text-slate-800 text-xs text-right leading-tight line-clamp-2 min-w-0">{game.home_team}</span>
                          <TeamFlag team={game.home_team ?? ''} size={28} />
                        </div>
                        <div className="flex items-center gap-1.5 px-1 flex-shrink-0">
                          <input type="number" min="0" max="99" value={bet.home}
                            onChange={e => updateBet(game.id, 'home', parseInt(e.target.value) || 0)}
                            onFocus={e => e.target.select()} disabled={!canBet}
                            className={`w-9 h-9 text-center font-bebas text-lg border-2 rounded-xl outline-none ${
                              !canBet ? 'border-slate-100 bg-slate-100 text-slate-500 cursor-not-allowed opacity-50' : 'border-slate-200 focus:border-green-500'
                            }`} />
                          <span className="font-bebas text-lg text-slate-400">×</span>
                          <input type="number" min="0" max="99" value={bet.away}
                            onChange={e => updateBet(game.id, 'away', parseInt(e.target.value) || 0)}
                            onFocus={e => e.target.select()} disabled={!canBet}
                            className={`w-9 h-9 text-center font-bebas text-lg border-2 rounded-xl outline-none ${
                              !canBet ? 'border-slate-100 bg-slate-100 text-slate-500 cursor-not-allowed opacity-50' : 'border-slate-200 focus:border-green-500'
                            }`} />
                        </div>
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <TeamFlag team={game.away_team ?? ''} size={28} />
                          <span className="font-bold text-slate-800 text-xs leading-tight line-clamp-2 min-w-0">{game.away_team}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end mt-3">
                        <button onClick={() => canBet && handleSubmit(game.id)} disabled={!canBet || isSaving}
                          className={`font-bebas tracking-wider px-5 py-2 rounded-xl text-sm transition-colors ${
                            !canBet ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : isSaved ? 'bg-green-500 text-white'
                            : hasExisting ? 'bg-blue-900 text-yellow-400'
                            : 'bg-green-500 text-white'
                          }`}>
                          {!canBet ? '🔒 ENCERRADO' : isSaving ? 'SALVANDO...' : isSaved ? '✅ SALVO!' : hasExisting ? '✏️ EDITAR' : 'PALPITAR'}
                        </button>
                      </div>

                      {hasExisting && (
                        <div className="mt-2">
                          <button onClick={() => setSharing(sharing === game.id ? null : game.id)}
                            className="w-full text-xs text-green-600 font-bold py-1 flex items-center justify-center gap-1">
                            🔗 {sharing === game.id ? 'Fechar' : 'Compartilhar palpite'}
                          </button>
                          {sharing === game.id && (
                            <div className="mt-2">
                              <ShareButtons
                                {...shareBet(game.home_team ?? '', game.away_team ?? '', bet.home, bet.away, 'você')}
                                label="Compartilhar via"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
