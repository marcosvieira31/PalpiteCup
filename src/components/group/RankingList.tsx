"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client'
import { sumLivePointsByUser, LiveGame, LiveBet } from '@/lib/scoring'
import clsx from "clsx";
import RankingShareCard from '@/components/share/RankingShareCard'
import Link from 'next/link'

export interface MemberJokerPick {
  user_id: string
  game_id: number
  round_number: number
  games: {
    home_team: string | null
    away_team: string | null
    kickoff_at: string
    status: string
  } | null
}

export interface RankingMember {
  user_id: string;
  points_total: number;
  live_points_total?: number;
  users: {
    username: string;
    avatar_url: string | null;
  } | null;
}

interface RankingListProps {
  members: RankingMember[];
  filterTeams?: string[];
  filterPhases?: string[];
  group?: import('@/types/database').Database["public"]["Tables"]["groups"]["Row"];
  groupName?: string;
  groupId?: number;
  initialLiveGames?: LiveGame[];
  initialLiveBets?: LiveBet[];
  memberJokerPicks?: MemberJokerPick[];
}

export default function RankingList({ members, filterTeams = [], filterPhases = [], group, groupName, groupId, initialLiveGames = [], initialLiveBets = [], memberJokerPicks = [] }: RankingListProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [liveGames, setLiveGames] = useState<LiveGame[]>(initialLiveGames)
  const [liveBets] = useState<LiveBet[]>(initialLiveBets)

  useEffect(() => {
    if (!groupId) return

    const channel = supabase
      .channel(`group-live-ranking-${groupId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'games'
      }, (payload) => {
        const updated = payload.new as { id: string; status: string; home_score: number | null; away_score: number | null }

        setLiveGames(prev => {
          // Jogo virou finished -> remove da lista de live (a trigger SQL já vai consolidar o ponto oficial)
          if (updated.status !== 'live') {
            return prev.filter(g => g.id !== updated.id)
          }
          // Jogo já estava na lista -> atualiza placar
          const exists = prev.some(g => g.id === updated.id)
          if (exists) {
            return prev.map(g => g.id === updated.id ? { ...g, ...updated } : g)
          }
          return prev
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [groupId])

  const livePointsByUser = sumLivePointsByUser(liveGames, liveBets)
  const hasLiveGame = liveGames.length > 0

  const liveBetsByUser: Record<string, { home_team: string | null; away_team: string | null; home_bet: number; away_bet: number; home_score: number | null; away_score: number | null }[]> = {}
  for (const bet of liveBets) {
    const game = liveGames.find(g => String(g.id) === String(bet.game_id))
    if (!game) continue
    if (!liveBetsByUser[bet.user_id]) liveBetsByUser[bet.user_id] = []
    liveBetsByUser[bet.user_id].push({
      home_team: game.home_team ?? null,
      away_team: game.away_team ?? null,
      home_bet: bet.home_bet,
      away_bet: bet.away_bet,
      home_score: game.home_score,
      away_score: game.away_score,
    })
  }

  const jokerPicksByUser: Record<string, MemberJokerPick[]> = {}
  for (const jp of memberJokerPicks) {
    if (!jp.games) continue
    if (!jokerPicksByUser[jp.user_id]) jokerPicksByUser[jp.user_id] = []
    jokerPicksByUser[jp.user_id].push(jp)
  }

  const sorted = [...members]
    .map(m => ({
      ...m,
      live_points_total: m.points_total + (livePointsByUser[m.user_id] ?? 0)
    }))
    .sort((a, b) => {
      const aTotal = hasLiveGame ? a.live_points_total : a.points_total
      const bTotal = hasLiveGame ? b.live_points_total : b.points_total
      if (bTotal !== aTotal) return bTotal - aTotal
      return (a.users?.username ?? '').localeCompare(b.users?.username ?? '')
    })

  const hasFilter = filterTeams.length > 0 || filterPhases.length > 0

  return (
    <div className="px-4 pt-6">
      <h2 className="font-bebas text-2xl tracking-widest text-slate-800 mb-4 flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          Ranking
          {hasLiveGame && (
            <span className="flex items-center gap-1 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              AO VIVO
            </span>
          )}
        </span>
        <span className="text-[10px] font-sans font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
          {members.length} MEMBROS
        </span>
      </h2>

      <RankingShareCard
        members={sorted.map(m => ({
          user_id: m.user_id,
          username: m.users?.username ?? 'Usuário',
          avatar_url: m.users?.avatar_url ?? null,
          points_total: m.points_total
        }))}
        groupName={groupName}
        hideButton
      />

      {hasFilter && group && (
        <div className="mb-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-blue-50 rounded-xl p-3 flex justify-between items-center"
          >
            <p className="text-blue-700 text-xs font-bold">
              🎯 Pontuação filtrada — toque para ver detalhes
            </p>
            <span className="text-blue-500 text-sm">{showFilters ? '▲' : '▼'}</span>
          </button>

          {showFilters && (
            <div className="bg-blue-50 rounded-b-xl px-4 pb-3 space-y-2 -mt-1 border-t border-blue-100 text-left">
              {group.scoring_bets && (
                <div>
                  <p className="text-blue-700 text-[10px] font-bold mt-2">⚽ PARTIDAS</p>
                  <p className="text-blue-500 text-[10px]">
                    {(group.filter_teams?.length ?? 0) === 0 && (group.filter_phases?.length ?? 0) === 0
                      ? 'Todos os jogos'
                      : [
                          ...(group.filter_teams?.length ? [`Times: ${group.filter_teams.join(', ')}`] : []),
                          ...(group.filter_phases?.length ? [`Fases: ${group.filter_phases.join(', ')}`] : [])
                        ].join(' • ')}
                  </p>
                </div>
              )}
              {group.scoring_groups && (
                <div>
                  <p className="text-blue-700 text-[10px] font-bold">📊 CLASSIFICAÇÃO DOS GRUPOS</p>
                  <p className="text-blue-500 text-[10px]">
                    {(group.scoring_groups_filter?.length ?? 0) === 0
                      ? 'Todos os grupos'
                      : group.scoring_groups_filter!.join(', ')}
                  </p>
                </div>
              )}
              {group.scoring_journey && (
                <div>
                  <p className="text-blue-700 text-[10px] font-bold">🗺️ ATÉ ONDE VAI</p>
                  <p className="text-blue-500 text-[10px]">
                    {(group.scoring_journey_filter?.length ?? 0) === 0
                      ? 'Todas as seleções'
                      : `${group.scoring_journey_filter!.slice(0, 5).join(', ')}${group.scoring_journey_filter!.length > 5 ? ` +${group.scoring_journey_filter!.length - 5}` : ''}`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {sorted.map((member, index) => {
          const isTop1 = index === 0;
          const isTop2 = index === 1;
          const isTop3 = index === 2;

          return (
            <Link
              key={member.user_id}
              href={`/palpites/usuario/${member.user_id}?groupId=${groupId ?? ''}&groupName=${encodeURIComponent(groupName ?? '')}`}
            >
              <div 
                className={clsx(
                  "flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border cursor-pointer active:scale-95 transition-transform",
                  isTop1 ? "border-yellow-400 bg-yellow-50/30" : "border-slate-100"
                )}
              >
                <div className="w-8 flex justify-center items-center">
                {isTop1 ? (
                  <span className="text-2xl drop-shadow-sm">👑</span>
                ) : isTop2 ? (
                  <span className="text-2xl drop-shadow-sm">🥈</span>
                ) : isTop3 ? (
                  <span className="text-2xl drop-shadow-sm">🥉</span>
                ) : (
                  <span className="font-bebas text-2xl text-slate-300">{index + 1}</span>
                )}
              </div>

              <div className="w-10 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={member.users?.avatar_url ?? '/avatars/vini-jr.png'}
                  alt={member.users?.username ?? "Usuário"}
                  className="w-full aspect-[3/4] object-cover"
                />
              </div>

              <div className="flex-1 flex flex-col">
                <span className={clsx("font-bold text-sm", isTop1 ? "text-yellow-900" : "text-slate-800")}>
                  {member.users?.username || "Usuário"}
                </span>
              </div>

              <div className="flex flex-col items-end pr-2">
                <span className={clsx(
                  "font-bebas text-3xl leading-none",
                  hasLiveGame && (livePointsByUser[member.user_id] ?? 0) !== 0 ? "text-red-500" : "text-green-600"
                )}>
                  {hasLiveGame ? member.live_points_total : member.points_total}
                </span>
                <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">
                  {hasLiveGame ? 'Pontos (ao vivo)' : 'Pontos'}
                </span>
              </div>
              </div>

              {(liveBetsByUser[member.user_id]?.length ?? 0) > 0 && (
                <div className="mt-1.5 flex flex-col gap-1">
                  {liveBetsByUser[member.user_id].map((bet, i) => (
                    <div key={i} className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-3 py-1.5">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-red-600">
                        <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                        AO VIVO
                      </span>
                      <span className="text-[11px] text-slate-600 truncate flex-1 px-2">
                        {bet.home_team} {bet.home_score ?? 0}×{bet.away_score ?? 0} {bet.away_team}
                      </span>
                      <span className="text-[11px] font-bold text-slate-800">
                        Palpite: {bet.home_bet}×{bet.away_bet}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {(jokerPicksByUser[member.user_id]?.length ?? 0) > 0 && (
                <div className="mt-1 flex flex-wrap gap-1 px-1">
                  {jokerPicksByUser[member.user_id].map((jp, i) => (
                    <span key={i} className="flex items-center gap-1 bg-yellow-50 border border-yellow-200 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ⚡ R{jp.round_number} · {jp.games?.home_team ?? '?'} × {jp.games?.away_team ?? '?'}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          );
        })}
        {sorted.length === 0 && (
          <div className="text-center text-slate-400 py-4 text-sm">
            Nenhum membro encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
