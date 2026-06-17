"use client"
import Link from 'next/link'
import { formatTime } from '@/lib/dates'
import TeamFlag from '@/components/ui/TeamFlag'
import { Game, Bet } from '@/types/database'

interface Props {
  game: Game
  bet: Bet | null
}

export default function MyBetCard({ game, bet }: Props) {
  const kickoff = new Date(game.kickoff_at)
  const isPast = kickoff.getTime() < Date.now()

  if (bet) return (
    <div className="mx-4 mt-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="font-bebas text-slate-700 tracking-wider text-sm">MEU PALPITE</span>
        {bet.used_joker && (
          <span className="bg-yellow-400 text-blue-900 font-bebas text-xs tracking-wider px-2 py-0.5 rounded-full">
            ⚡ CORINGA
          </span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <TeamFlag team={game.home_team ?? ''} size={28} />
          <span className="font-bold text-slate-700 text-sm">{game.home_team}</span>
        </div>
        <div className="flex items-center gap-2 px-3">
          <span className="font-bebas text-2xl text-green-600">{bet.home_bet}</span>
          <span className="font-bebas text-lg text-slate-400">×</span>
          <span className="font-bebas text-2xl text-green-600">{bet.away_bet}</span>
        </div>
        <div className="flex items-center gap-2 flex-1 justify-end">
          <span className="font-bold text-slate-700 text-sm">{game.away_team}</span>
          <TeamFlag team={game.away_team ?? ''} size={28} />
        </div>
      </div>
      {!isPast && (
        <Link href="/palpites"
          className="mt-3 block text-center text-xs text-green-600 font-bold">
          ✏️ Editar palpite →
        </Link>
      )}
      {bet.points_earned > 0 && (
        <div className="mt-3 bg-green-50 rounded-xl p-2 text-center">
          <span className="font-bebas text-green-700 tracking-wider">
            +{bet.points_earned} PONTOS GANHOS! 🎉
          </span>
        </div>
      )}
    </div>
  )

  if (isPast) return (
    <div className="mx-4 mt-3 bg-slate-50 rounded-2xl border border-slate-200 p-4 text-center">
      <p className="text-slate-400 text-sm">Você não palpitou neste jogo.</p>
    </div>
  )

  return (
    <Link href="/palpites">
      <div className="mx-4 mt-3 bg-blue-900 rounded-2xl px-4 py-2.5 flex items-center justify-between active:scale-95 transition-transform">
        <p className="font-bebas text-yellow-400 tracking-wider text-base">⚡ FAZER PALPITE</p>
        <span className="text-white/70 text-xs font-bold">
          {formatTime(game.kickoff_at)}
        </span>
      </div>
    </Link>
  )
}
