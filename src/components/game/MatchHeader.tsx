import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Database } from "@/types/database";

type Game = Database["public"]["Tables"]["games"]["Row"];

export default function MatchHeader({ game }: { game: Game }) {
  const isFinished = game.status === 'finished';
  const isLive = game.status === 'live';
  const isScheduled = game.status === 'pending';
  const time = new Date(game.kickoff_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="bg-white shadow-sm pb-6 pt-12 px-4 relative flex flex-col items-center border-b border-slate-200">
      <div className="absolute top-4 left-4">
        <Link href="/dashboard" className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
          <ChevronLeft size={24} className="text-slate-700" />
        </Link>
      </div>

      <div className="flex justify-center items-center gap-6 mt-4 w-full px-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-full border-4 border-slate-100 bg-white flex items-center justify-center font-bebas text-4xl shadow-md text-slate-800">
            {game.home_team.substring(0,3).toUpperCase()}
          </div>
          <span className="font-bold text-slate-800 uppercase tracking-widest text-sm">{game.home_team}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 font-bebas text-6xl text-slate-900 tracking-wider">
            <span>{game.home_score !== null ? game.home_score : "-"}</span>
            <span className="text-slate-300 text-5xl">:</span>
            <span>{game.away_score !== null ? game.away_score : "-"}</span>
          </div>
          
          <div className="mt-2">
            {isLive && (
              <div className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm uppercase tracking-wider">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> AO VIVO
              </div>
            )}
            {isFinished && (
              <div className="bg-slate-500 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm uppercase tracking-wider">
                ENCERRADO
              </div>
            )}
            {isScheduled && (
              <div className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full flex items-center shadow-sm uppercase tracking-wider border border-slate-200">
                {time}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-full border-4 border-slate-100 bg-white flex items-center justify-center font-bebas text-4xl shadow-md text-slate-800">
            {game.away_team.substring(0,3).toUpperCase()}
          </div>
          <span className="font-bold text-slate-800 uppercase tracking-widest text-sm">{game.away_team}</span>
        </div>
      </div>
    </div>
  );
}
