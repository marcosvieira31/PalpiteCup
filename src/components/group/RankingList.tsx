"use client";

import clsx from "clsx";

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
}

export default function RankingList({ members }: RankingListProps) {
  const sortedMembers = [...members].sort((a, b) => b.points_total - a.points_total);

  return (
    <div className="px-4 pt-6">
      <h2 className="font-bebas text-2xl tracking-widest text-slate-800 mb-4 flex items-center justify-between">
        Ranking
        <span className="text-[10px] font-sans font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
          {members.length} MEMBROS
        </span>
      </h2>

      <div className="flex flex-col gap-3">
        {sortedMembers.map((member, index) => {
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

              <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-400">
                {member.users?.avatar_url ? (
                  <img src={member.users.avatar_url} alt={member.users.username} className="w-full h-full object-cover" />
                ) : (
                  (member.users?.username || "U").substring(0,2).toUpperCase()
                )}
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
        {sortedMembers.length === 0 && (
          <div className="text-center text-slate-400 py-4 text-sm">
            Nenhum membro encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
