"use client"
import { useState } from 'react'
import { Game, Bet } from '@/types/database'
import { submitBet } from '@/app/(app)/dashboard/actions'
import TeamFlag from '@/components/ui/TeamFlag'
import { shareBet } from '@/lib/share'
import ShareButtons from '@/components/ui/ShareButtons'

interface Props {
  games: Game[]
  existingBets: Bet[]
  roundName: string
}

export default function PalpitarClient({ games, existingBets, roundName }: Props) {
  const [bets, setBets] = useState<Record<string, { home: number; away: number; joker: boolean }>>(
    Object.fromEntries(
      existingBets.map(b => [b.game_id, {
        home: b.home_bet,
        away: b.away_bet,
        joker: b.used_joker
      }])
    )
  )
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [sharing, setSharing] = useState<string | number | null>(null)
  const jokerUsed = Object.values(bets).some(b => b.joker)

  const updateBet = (gameId: string | number, field: 'home' | 'away', value: number) => {
    setBets(prev => ({
      ...prev,
      [gameId]: { ...prev[gameId] ?? { home: 0, away: 0, joker: false }, [field]: Math.max(0, value) }
    }))
  }

  const toggleJoker = (gameId: string | number) => {
    setBets(prev => {
      const current = prev[gameId] ?? { home: 0, away: 0, joker: false }
      const newJoker = !current.joker
      const updated = { ...prev }
      Object.keys(updated).forEach(k => { updated[k] = { ...updated[k], joker: false } })
      updated[String(gameId)] = { ...current, joker: newJoker }
      return updated
    })
  }

  const handleSubmit = async (gameId: string | number) => {
    const bet = bets[String(gameId)] ?? { home: 0, away: 0, joker: false }
    setSaving(prev => ({ ...prev, [gameId]: true }))
    try {
      await submitBet(gameId as number, bet.home, bet.away, bet.joker)
      setSaved(prev => ({ ...prev, [gameId]: true }))
      setTimeout(() => setSaved(prev => ({ ...prev, [gameId]: false })), 2000)
    } finally {
      setSaving(prev => ({ ...prev, [gameId]: false }))
    }
  }

  const pending = games.filter(g => !existingBets.find(b => b.game_id === g.id))

  const gamesByDate = games.reduce((acc, game) => {
    const date = new Date(game.kickoff_at).toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long'
    })
    if (!acc[date]) acc[date] = []
    acc[date].push(game)
    return acc
  }, {} as Record<string, Game[]>)

  return (
    <div className="pb-24">
      <div className="bg-blue-900 px-4 pt-6 pb-6 sticky top-0 z-10"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }}>
        <h1 className="font-bebas text-4xl text-yellow-400 tracking-widest"
          style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>
          PALPITAR
        </h1>
        <p className="text-yellow-200 text-xs font-bold tracking-widest uppercase mt-1">
          {roundName}
        </p>
        <p className="text-blue-200 text-sm mt-1">
          {pending.length > 0
            ? `⚡ ${pending.length} jogo${pending.length > 1 ? 's' : ''} aguardando seu palpite`
            : '✅ Todos os palpites feitos!'}
        </p>
      </div>

      <div className="px-4 mt-4">
        {games.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">⚽</p>
            <p className="text-slate-500 font-medium">Nenhum jogo disponível para palpite.</p>
            <p className="text-slate-400 text-sm mt-1">A Copa começa em 11 de junho!</p>
          </div>
        )}

        {Object.entries(gamesByDate).map(([date, dateGames]) => (
          <div key={date}>
            <h3 className="font-bebas text-base tracking-widest text-slate-500 uppercase mt-6 mb-3">
              📅 {date}
            </h3>
            <div className="space-y-4">
              {dateGames.map(game => {
                const bet = bets[String(game.id)] ?? { home: 0, away: 0, joker: false }
                const isSaving = saving[String(game.id)]
                const isSaved = saved[String(game.id)]
                const hasExisting = existingBets.find(b => b.game_id === game.id)
                const kickoff = new Date(game.kickoff_at)
                const diffHours = (kickoff.getTime() - Date.now()) / 1000 / 60 / 60
                const isUrgent = diffHours < 2

                return (
                  <div key={game.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                    isUrgent ? 'border-red-200' : 'border-slate-200'
                  }`}>
                    <div className={`px-4 py-2 flex justify-between items-center ${
                      isUrgent ? 'bg-red-50' : 'bg-slate-50'
                    }`}>
                      <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                        {game.group_stage ?? 'Mata-Mata'}
                      </span>
                      <span className={`text-[10px] font-bold ${isUrgent ? 'text-red-500' : 'text-slate-400'}`}>
                        {isUrgent ? '🔴 ' : '🕐 '}
                        {kickoff.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <span className="font-bold text-slate-800 text-xs text-right leading-tight">{game.home_team}</span>
                          <TeamFlag team={game.home_team ?? ''} size={28} />
                        </div>
                        <div className="flex items-center gap-2 px-2">
                          <input
                            type="number" min="0" max="99"
                            value={bet.home}
                            onChange={e => updateBet(game.id, 'home', parseInt(e.target.value) || 0)}
                            onFocus={e => e.target.select()}
                            className="w-10 h-10 text-center font-bebas text-xl border-2 border-slate-200 rounded-xl focus:border-green-500 outline-none"
                          />
                          <span className="font-bebas text-xl text-slate-400">×</span>
                          <input
                            type="number" min="0" max="99"
                            value={bet.away}
                            onChange={e => updateBet(game.id, 'away', parseInt(e.target.value) || 0)}
                            onFocus={e => e.target.select()}
                            className="w-10 h-10 text-center font-bebas text-xl border-2 border-slate-200 rounded-xl focus:border-green-500 outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                          <TeamFlag team={game.away_team ?? ''} size={28} />
                          <span className="font-bold text-slate-800 text-xs leading-tight">{game.away_team}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <button
                          onClick={() => toggleJoker(game.id)}
                          disabled={jokerUsed && !bet.joker}
                          className={`text-xs font-bebas tracking-wider px-3 py-1.5 rounded-full transition-colors ${
                            bet.joker
                              ? 'bg-yellow-400 text-blue-900'
                              : jokerUsed
                              ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                              : 'bg-slate-100 text-slate-500 hover:bg-yellow-100'
                          }`}
                        >
                          ⚡ CORINGA {bet.joker ? '(ATIVO)' : ''}
                        </button>

                        <button
                          onClick={() => handleSubmit(game.id)}
                          disabled={isSaving}
                          className={`font-bebas tracking-wider px-5 py-2 rounded-xl text-sm transition-colors ${
                            isSaved
                              ? 'bg-green-500 text-white'
                              : hasExisting
                              ? 'bg-blue-900 text-yellow-400'
                              : 'bg-green-500 text-white'
                          }`}
                        >
                          {isSaving ? 'SALVANDO...' : isSaved ? '✅ SALVO!' : hasExisting ? '✏️ EDITAR' : 'PALPITAR'}
                        </button>
                      </div>

                      {hasExisting && (
                        <div className="mt-2">
                          <button
                            onClick={() => setSharing(sharing === game.id ? null : game.id)}
                            className="w-full text-xs text-green-600 font-bold py-1 flex items-center justify-center gap-1"
                          >
                            🔗 {sharing === game.id ? 'Fechar' : 'Compartilhar palpite'}
                          </button>

                          {sharing === game.id && (
                            <div className="mt-2">
                              <ShareButtons
                                {...shareBet(
                                  game.home_team ?? '',
                                  game.away_team ?? '',
                                  bet.home,
                                  bet.away,
                                  'você'
                                )}
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
