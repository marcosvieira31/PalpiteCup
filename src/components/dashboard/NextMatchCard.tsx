import Link from 'next/link'
import TeamFlag from '@/components/ui/TeamFlag'
import { Game } from '@/types/database'

export default function NextMatchCard({ game }: { game: Game }) {
  const kickoff = new Date(game.kickoff_at)
  const isLive = game.status === 'live'
  const isFinished = game.status === 'finished'

  const diffMs = kickoff.getTime() - Date.now()
  const diffHours = diffMs / 1000 / 60 / 60
  const diffDays = Math.floor(diffHours / 24)
  const diffMins = Math.floor((diffMs / 1000 / 60) % 60)
  const remainingHours = Math.floor(diffHours % 24)

  const countdown = diffMs > 0
    ? diffDays > 0
      ? `${diffDays}d ${remainingHours}h`
      : remainingHours > 0
      ? `${remainingHours}h ${diffMins}min`
      : `${Math.floor(diffMs / 1000 / 60)}min`
    : null

  return (
    <div className="mx-4 mt-4 bg-green-500 rounded-3xl overflow-hidden shadow-lg"
      style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.12) 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }}>
      <div className="px-4 pt-4 pb-1 flex justify-between items-center">
        <span className="text-[10px] text-white/70 font-bold tracking-widest uppercase">
          🏆 {game.group_stage ?? 'Copa do Mundo'}
        </span>
        {isLive ? (
          <span className="flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            AO VIVO
          </span>
        ) : isFinished ? (
          <span className="text-white/60 text-[10px] font-bold">ENCERRADO</span>
        ) : countdown ? (
          <span className="text-yellow-300 text-[10px] font-bold">⏱ {countdown}</span>
        ) : null}
      </div>

      <div className="px-4 py-4 flex items-center justify-between gap-2">
        <div className="flex flex-col items-center gap-2 flex-1">
          <TeamFlag team={game.home_team ?? ''} size={52} />
          <span className="font-bebas text-white text-sm tracking-wide text-center leading-tight">
            {game.home_team}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          {isLive || isFinished ? (
            <span className="font-bebas text-4xl text-white tracking-widest">
              {game.home_score ?? 0} × {game.away_score ?? 0}
            </span>
          ) : (
            <>
              <span className="font-bebas text-3xl text-white/80">VS</span>
              <span className="text-yellow-300 text-xs font-bold">
                {kickoff.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-white/60 text-[10px]">
                {kickoff.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 flex-1">
          <TeamFlag team={game.away_team ?? ''} size={52} />
          <span className="font-bebas text-white text-sm tracking-wide text-center leading-tight">
            {game.away_team}
          </span>
        </div>
      </div>
    </div>
  )
}
