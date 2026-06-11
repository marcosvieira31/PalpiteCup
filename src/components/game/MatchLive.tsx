"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import TeamFlag from '@/components/ui/TeamFlag'
import { formatTime, formatDateShort } from '@/lib/dates'
import { Game, Bet } from '@/types/database'

const PHASE_LABELS: Record<string, string> = {
  'PRE': 'Pré-jogo',
  '1H': '1º Tempo',
  'HT': 'Intervalo',
  '2H': '2º Tempo',
  'ET1': 'Prorrogação 1º',
  'ET2': 'Prorrogação 2º',
  'PEN': 'Pênaltis',
  'FT': 'Encerrado',
  'FT_PEN': 'Enc. nos Pênaltis',
}

interface Props {
  game: Game
  bet: Bet | null
}

export default function MatchLive({ game: initialGame, bet }: Props) {
  const [game, setGame] = useState(initialGame)
  const router = useRouter()

  useEffect(() => {
    // Realtime — atualiza placar em tempo real
    const channel = supabase
      .channel(`game-${game.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'games',
        filter: `id=eq.${game.id}`
      }, (payload) => {
        setGame(prev => ({ ...prev, ...payload.new }))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [game.id])

  const isLive = game.status === 'live'
  const isFinished = game.status === 'finished'
  // @ts-expect-error - fields not in types
  const phase = game.phase as string | undefined
  // @ts-expect-error - fields not in types
  const venue = game.venue as string | undefined

  // Resultado do palpite
  const getBetResult = () => {
    if (!bet || !isFinished) return null
    if (bet.home_bet === game.home_score && bet.away_bet === game.away_score) {
      return { label: '🎯 PLACAR EXATO!', color: 'bg-green-500', pts: bet.used_joker ? 10 : 5 }
    }
    const betDiff = bet.home_bet - bet.away_bet
    const realDiff = (game.home_score ?? 0) - (game.away_score ?? 0)
    if (betDiff === realDiff) {
      return { label: '✅ Vencedor + Diferença', color: 'bg-blue-500', pts: bet.used_joker ? 6 : 3 }
    }
    const betWinner = bet.home_bet > bet.away_bet ? 'home' : bet.home_bet < bet.away_bet ? 'away' : 'draw'
    const realWinner = (game.home_score ?? 0) > (game.away_score ?? 0) ? 'home' : (game.home_score ?? 0) < (game.away_score ?? 0) ? 'away' : 'draw'
    if (betWinner === realWinner) {
      return { label: '👍 Acertou o Vencedor', color: 'bg-yellow-500', pts: bet.used_joker ? 2 : 1 }
    }
    return { label: '❌ Não pontuou', color: 'bg-red-400', pts: 0 }
  }

  const betResult = getBetResult()

  return (
    <div className="pb-24 min-h-screen bg-slate-50">
      {/* Header */}
      <div className={`px-4 pt-6 pb-6 relative ${isLive ? 'bg-red-600' : isFinished ? 'bg-slate-700' : 'bg-blue-900'}`}
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }}>
        <button onClick={() => router.back()}
          className="text-white/70 text-sm mb-4 flex items-center gap-1">
          ‹ Voltar
        </button>

        <div className="text-center mb-2">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            isLive ? 'bg-white text-red-600 animate-pulse'
            : isFinished ? 'bg-white/20 text-white'
            : 'bg-white/20 text-white'
          }`}>
            {isLive ? `🔴 AO VIVO — ${phase ? PHASE_LABELS[phase] ?? phase : ''}` :
             isFinished ? `✓ ENCERRADO${phase ? ` — ${PHASE_LABELS[phase] ?? phase}` : ''}` :
             `${formatDateShort(game.kickoff_at)} · ${formatTime(game.kickoff_at)}`}
          </span>
        </div>

        <p className="text-white/60 text-[10px] text-center font-bold tracking-widest uppercase mb-4">
          🏆 {game.group_stage ?? 'Copa do Mundo 2026'}
        </p>

        {/* Placar */}
        <div className="flex items-center justify-between px-4 gap-4">
          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamFlag team={game.home_team ?? ''} size={56} />
            <p className="font-bebas text-white text-sm tracking-wide text-center leading-tight">
              {game.home_team ?? 'A definir'}
            </p>
          </div>

          <div className="flex flex-col items-center flex-shrink-0">
            {isLive || isFinished ? (
              <div className="flex items-center gap-3">
                <span className="font-bebas text-6xl text-white leading-none">
                  {game.home_score ?? 0}
                </span>
                <span className="font-bebas text-3xl text-white/40">×</span>
                <span className="font-bebas text-6xl text-white leading-none">
                  {game.away_score ?? 0}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="font-bebas text-3xl text-white/60">VS</span>
                <span className="text-white/50 text-xs mt-1">{formatTime(game.kickoff_at)}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamFlag team={game.away_team ?? ''} size={56} />
            <p className="font-bebas text-white text-sm tracking-wide text-center leading-tight">
              {game.away_team ?? 'A definir'}
            </p>
          </div>
        </div>

        {/* Stadium */}
        {venue && (
          <p className="text-white/40 text-[10px] text-center mt-3 tracking-wider">
            📍 {venue}
          </p>
        )}
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Resultado do palpite */}
        {betResult && (
          <div className={`${betResult.color} rounded-2xl p-4 text-white`}>
            <p className="font-bebas text-xl tracking-wider">{betResult.label}</p>
            <div className="flex justify-between items-center mt-1">
              <p className="text-white/80 text-sm">
                Seu palpite: {bet!.home_bet} × {bet!.away_bet}
                {bet!.used_joker && ' ⚡ Coringa'}
              </p>
              {betResult.pts > 0 && (
                <p className="font-bebas text-2xl">+{betResult.pts} pts</p>
              )}
            </div>
          </div>
        )}

        {/* Palpite pendente */}
        {bet && !isFinished && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <p className="font-bebas text-lg tracking-wider text-slate-700 mb-1">MEU PALPITE</p>
            <div className="flex items-center gap-3">
              <TeamFlag team={game.home_team ?? ''} size={28} />
              <span className="font-bebas text-2xl text-slate-800">
                {bet.home_bet} × {bet.away_bet}
              </span>
              <TeamFlag team={game.away_team ?? ''} size={28} />
              {bet.used_joker && (
                <span className="ml-auto bg-yellow-400 text-blue-900 font-bebas text-xs px-2 py-1 rounded-full">
                  ⚡ CORINGA
                </span>
              )}
            </div>
          </div>
        )}

        {/* Sem palpite */}
        {!bet && game.status === 'scheduled' && (
          <div className="bg-yellow-50 rounded-2xl border-2 border-dashed border-yellow-300 p-4 text-center">
            <p className="font-bebas text-yellow-700 tracking-wider text-lg">⚡ VOCÊ NÃO PALPITOU</p>
            <p className="text-yellow-600 text-xs mt-1">
              Palpite até {formatTime(game.kickoff_at)}
            </p>
          </div>
        )}

        {/* Info ao vivo */}
        {isLive && (
          <div className="bg-red-50 rounded-2xl border border-red-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <p className="font-bebas text-red-700 tracking-wider">ACOMPANHANDO AO VIVO</p>
            </div>
            <p className="text-red-500 text-xs">
              Placar atualizado automaticamente a cada 60 segundos via cron.
            </p>
          </div>
        )}

        {/* Informações do jogo */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <p className="font-bebas text-lg tracking-wider text-slate-700">INFORMAÇÕES</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Competição</span>
              <span className="font-medium text-slate-700">{game.group_stage ?? 'Copa do Mundo 2026'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Data</span>
              <span className="font-medium text-slate-700">{formatDateShort(game.kickoff_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Horário (Brasília)</span>
              <span className="font-medium text-slate-700">{formatTime(game.kickoff_at)}</span>
            </div>
            {venue && (
              <div className="flex justify-between">
                <span className="text-slate-400">Estádio</span>
                <span className="font-medium text-slate-700 text-right max-w-[60%]">{venue}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
