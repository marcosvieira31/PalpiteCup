"use client";
import { useState } from 'react';
import clsx from "clsx";
import RankingShareCard from '@/components/share/RankingShareCard'
import Link from 'next/link'

export interface RankingMember {
  user_id: string;
  points_total: number;
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
}

export default function RankingList({ members, filterTeams = [], filterPhases = [], group, groupName, groupId }: RankingListProps) {
  const [showFilters, setShowFilters] = useState(false);
  const sorted = [...members].sort((a, b) => {
    if (b.points_total !== a.points_total) return b.points_total - a.points_total
    return (a.users?.username ?? '').localeCompare(b.users?.username ?? '')
  })

  const hasFilter = filterTeams.length > 0 || filterPhases.length > 0

  return (
    <div className="px-4 pt-6">
      <h2 className="font-bebas text-2xl tracking-widest text-slate-800 mb-4 flex items-center justify-between">
        Ranking
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
              {group.scoring_bracket && (
                <div>
                  <p className="text-blue-700 text-[10px] font-bold">⚔️ BRACKET MATA-MATA</p>
                  <p className="text-blue-500 text-[10px]">Fase de 32 até a Final</p>
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
                <span className="font-bebas text-3xl leading-none text-green-600">{member.points_total}</span>
                <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Pontos</span>
              </div>
              </div>
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
