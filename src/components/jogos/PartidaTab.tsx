"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Game } from '@/types/database'
import Link from 'next/link'
import TeamFlag from '@/components/ui/TeamFlag'
import { formatTime } from '@/lib/dates'

type Filter = 'hoje' | 'proximos' | 'encerrados'

export default function PartidaTab() {
  const [games, setGames] = useState<Game[]>([])
  const [filter, setFilter] = useState<Filter>('hoje')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true)

      // Calcula início e fim do dia em Brasília (UTC-3)
      const now = new Date()
      const brasiliaOffset = -3 * 60 // minutos
      const brasiliaTime = new Date(now.getTime() + (brasiliaOffset - now.getTimezoneOffset()) * 60000)

      const todayStart = new Date(brasiliaTime)
      todayStart.setHours(0, 0, 0, 0)
      // Converte de volta para UTC
      const startUTC = new Date(todayStart.getTime() - (brasiliaOffset - now.getTimezoneOffset()) * 60000)

      const todayEnd = new Date(brasiliaTime)
      todayEnd.setHours(23, 59, 59, 999)
      const endUTC = new Date(todayEnd.getTime() - (brasiliaOffset - now.getTimezoneOffset()) * 60000)

      let query = supabase.from('games').select('*').order('kickoff_at')

      if (filter === 'hoje') {
        query = query
          .gte('kickoff_at', startUTC.toISOString())
          .lte('kickoff_at', endUTC.toISOString())
      } else if (filter === 'proximos') {
        query = query
          .gt('kickoff_at', new Date().toISOString())
          .eq('status', 'scheduled')
          .limit(20)
      } else {
        query = query
          .eq('status', 'finished')
          .order('kickoff_at', { ascending: false })
          .limit(20)
      }

      const { data } = await query
      setGames(data ?? [])
      setLoading(false)
    }
    fetchGames()
  }, [filter])

  const filters: { id: Filter; label: string }[] = [
    { id: 'hoje', label: 'Hoje' },
    { id: 'proximos', label: 'Próximos' },
    { id: 'encerrados', label: 'Encerrados' },
  ]

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {filters.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
              filter === f.id
                ? 'bg-green-500 text-white'
                : 'bg-slate-100 text-slate-500'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-center text-slate-400 py-8">Carregando...</p>}

      {!loading && games.length === 0 && (
        <p className="text-center text-slate-400 py-8">
          {filter === 'hoje' ? 'Nenhum jogo hoje. A Copa começa em 11 de junho! ⚽' : 'Nenhum jogo encontrado.'}
        </p>
      )}

      <div className="space-y-3">
        {games.map(game => (
          <Link key={game.id} href={`/game/${game.id}`} className="block">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  {game.group_stage ?? 'Mata-Mata'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  game.status === 'live'
                    ? 'bg-red-100 text-red-600'
                    : game.status === 'finished'
                    ? 'bg-slate-100 text-slate-500'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {game.status === 'live' ? '🔴 AO VIVO'
                    : game.status === 'finished' ? 'ENCERRADO'
                    : formatTime(game.kickoff_at)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <TeamFlag team={game.home_team ?? ''} size={28} />
                  <span className="font-bold text-slate-800 text-xs leading-tight line-clamp-2">{game.home_team ?? 'A definir'}</span>
                </div>
                <span className="font-bebas text-xl text-slate-800 px-2 whitespace-nowrap">
                  {game.status !== 'scheduled'
                    ? `${game.home_score ?? 0} × ${game.away_score ?? 0}`
                    : 'VS'}
                </span>
                <div className="flex items-center justify-end gap-2 flex-1">
                  <span className="font-bold text-slate-800 text-xs text-right leading-tight line-clamp-2">{game.away_team ?? 'A definir'}</span>
                  <TeamFlag team={game.away_team ?? ''} size={28} />
                </div>
              </div>
              {game.venue && (
                <p className="text-[10px] text-slate-400 text-center mt-2">{game.venue}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
