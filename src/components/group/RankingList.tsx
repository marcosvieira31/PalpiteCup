"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

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
}

export default function RankingList({ members, filterTeams = [], filterPhases = [] }: RankingListProps) {
  const [displayMembers, setDisplayMembers] = useState<RankingMember[]>([...members].sort((a, b) => b.points_total - a.points_total));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hasFilter = filterTeams.length > 0 || filterPhases.length > 0;
    if (!hasFilter) {
      setDisplayMembers([...members].sort((a, b) => b.points_total - a.points_total));
      return;
    }

    const fetchFiltered = async () => {
      setLoading(true);
      const updated = await Promise.all(members.map(async (member) => {
        const { data: bets } = await supabase
          .from('bets')
          .select('points_earned, games!inner(home_team, away_team, group_stage)')
          .eq('user_id', member.user_id);

        const filteredPoints = (bets ?? []).reduce((sum, bet) => {
          const game = bet.games as unknown as { home_team: string; away_team: string; group_stage: string };
          if (!game) return sum;

          const teamMatch = filterTeams.length === 0 ||
            filterTeams.includes(game.home_team) ||
            filterTeams.includes(game.away_team);

          const phaseMatch = filterPhases.length === 0 ||
            filterPhases.includes(game.group_stage);

          if (teamMatch && phaseMatch) return sum + (bet.points_earned ?? 0);
          return sum;
        }, 0);

        return { ...member, points_total: filteredPoints };
      }));
      setDisplayMembers(updated.sort((a, b) => b.points_total - a.points_total));
      setLoading(false);
    };

    fetchFiltered();
  }, [members, filterTeams, filterPhases]);

  const hasFilter = filterTeams.length > 0 || filterPhases.length > 0;

  return (
    <div className="px-4 pt-6">
      <h2 className="font-bebas text-2xl tracking-widest text-slate-800 mb-4 flex items-center justify-between">
        Ranking
        <span className="text-[10px] font-sans font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
          {members.length} MEMBROS
        </span>
      </h2>

      {hasFilter && (
        <div className="bg-blue-50 rounded-xl p-3 mb-3 text-center">
          <p className="text-blue-700 text-xs font-bold">
            🎯 Pontuação filtrada —{' '}
            {filterTeams.length > 0 && `${filterTeams.join(', ')}`}
            {filterTeams.length > 0 && filterPhases.length > 0 && ' + '}
            {filterPhases.length > 0 && filterPhases.join(', ')}
          </p>
        </div>
      )}

      {loading ? (
        <div className="text-center text-slate-400 py-4 text-sm">
          Calculando pontuação...
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {displayMembers.map((member, index) => {
          const isTop1 = index === 0;
          const isTop2 = index === 1;
          const isTop3 = index === 2;

          return (
            <div 
              key={member.user_id}
              className={clsx(
                "flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border",
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
          );
        })}
        {displayMembers.length === 0 && (
          <div className="text-center text-slate-400 py-4 text-sm">
            Nenhum membro encontrado.
          </div>
        )}
      </div>
      )}
    </div>
  );
}
