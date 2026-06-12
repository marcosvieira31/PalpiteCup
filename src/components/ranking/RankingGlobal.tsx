"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import RankingShareCard from '@/components/share/RankingShareCard'

interface Player {
  id: string
  username: string
  points_total: number
  avatar_url?: string
}

interface Props {
  players: Player[]
  currentUserId: string
}

export default function RankingGlobal({ players: initial, currentUserId }: Props) {
  const [players, setPlayers] = useState<Player[]>(initial)

  useEffect(() => {
    const channel = supabase
      .channel('ranking-global')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'users'
      }, () => {
        supabase
          .from('users')
          .select('id, username, points_total, avatar_url')
          .order('points_total', { ascending: false })
          .order('username', { ascending: true })
          .limit(50)
          .then(({ data }) => { if (data) setPlayers(data) })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const myPosition = players.findIndex(p => p.id === currentUserId) + 1

  const getMedal = (position: number) => {
    if (position === 1) return '👑'
    if (position === 2) return '🥈'
    if (position === 3) return '🥉'
    return null
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-blue-900 px-4 pt-6 pb-6"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }}>
        <h1 className="font-bebas text-4xl text-yellow-400 tracking-widest"
          style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>
          RANKING GLOBAL
        </h1>
        <p className="text-blue-200 text-sm mt-1">Top 50 palpiteiros do PalpiteCup</p>
      </div>

      <div className="mx-4 mt-4">
        <RankingShareCard
          members={players.map(p => ({
            user_id: p.id,
            username: p.username,
            avatar_url: p.avatar_url ?? null,
            points_total: p.points_total
          }))}
          isGlobal={true}
        />
      </div>

      {/* Minha posição */}
      {myPosition > 0 && (
        <div className="mx-4 mt-4 bg-green-500 rounded-2xl p-4 flex justify-between items-center"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.1) 1.5px, transparent 1.5px)', backgroundSize: '10px 10px' }}>
          <div>
            <p className="text-white/70 text-xs font-bold tracking-wider uppercase">Minha Posição</p>
            <p className="font-bebas text-3xl text-white"># {myPosition}</p>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-xs font-bold tracking-wider uppercase">Meus Pontos</p>
            <p className="font-bebas text-3xl text-yellow-300">
              {players.find(p => p.id === currentUserId)?.points_total ?? 0}
            </p>
          </div>
        </div>
      )}

      {/* Top 3 */}
      {players.length >= 3 && (
        <div className="mx-4 mt-4 grid grid-cols-3 gap-2 items-end">
          {[players[1], players[0], players[2]].map((player, idx) => {
            const realPos = idx === 0 ? 2 : idx === 1 ? 1 : 3
            const sizes = ['h-24', 'h-32', 'h-24']
            const colors = ['bg-slate-100', 'bg-yellow-400', 'bg-orange-100']
            const textColors = ['text-slate-600', 'text-blue-900', 'text-orange-700']
            return (
              <div key={player.id}
                className={`${colors[idx]} rounded-2xl flex flex-col items-center justify-center p-2 ${sizes[idx]} relative`}>
                {realPos === 1 && (
                  <span className="absolute -top-3 text-2xl">👑</span>
                )}
                <p className={`font-bebas text-2xl ${textColors[idx]}`}>{realPos}</p>
                <p className={`font-bold text-xs text-center ${textColors[idx]}`}
                  style={{ wordBreak: 'break-word', fontSize: '10px', lineHeight: '1.2' }}>
                  {player.username}
                </p>
                <p className={`font-bebas text-sm ${textColors[idx]}`}>
                  {player.points_total} pts
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* Lista completa */}
      <div className="px-4 mt-4 space-y-2">
        {players.map((player, idx) => {
          const position = idx + 1
          const isMe = player.id === currentUserId
          const medal = getMedal(position)

          return (
            <div key={player.id}
              className={`rounded-2xl border p-3 flex items-center gap-3 ${
                isMe
                  ? 'bg-green-50 border-green-300'
                  : position <= 3
                  ? 'bg-white border-yellow-200'
                  : 'bg-white border-slate-100'
              }`}>
              <div className="w-8 text-center flex-shrink-0">
                {medal ? (
                  <span className="text-xl">{medal}</span>
                ) : (
                  <span className="font-bebas text-lg text-slate-400">{position}</span>
                )}
              </div>

              <div className="w-10 rounded-xl overflow-hidden flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={player.avatar_url ?? '/avatars/vini-jr.png'}
                  alt={player.username}
                  className="w-full aspect-[3/4] object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm truncate ${isMe ? 'text-green-700' : 'text-slate-800'}`}>
                  {player.username} {isMe && '(você)'}
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <p className={`font-bebas text-xl ${
                  position === 1 ? 'text-yellow-500'
                  : position === 2 ? 'text-slate-400'
                  : position === 3 ? 'text-orange-400'
                  : isMe ? 'text-green-600'
                  : 'text-slate-600'
                }`}>
                  {player.points_total}
                </p>
                <p className="text-[10px] text-slate-400">pontos</p>
              </div>
            </div>
          )
        })}

        {players.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🏆</p>
            <p className="text-slate-500 font-medium">Nenhum palpite feito ainda.</p>
            <p className="text-slate-400 text-sm mt-1">Seja o primeiro a pontuar!</p>
          </div>
        )}
      </div>
    </div>
  )
}
