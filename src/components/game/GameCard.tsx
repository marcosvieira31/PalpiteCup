"use client";

import { Database } from "@/types/database";
import { useRouter } from "next/navigation";
import TeamFlag from "@/components/ui/TeamFlag";

type Game = Database["public"]["Tables"]["games"]["Row"];
type Bet = Database["public"]["Tables"]["bets"]["Row"];

interface GameCardProps {
  game: Game;
  bet?: Bet | null;
  onBetChange?: (gameId: string, home: number, away: number, joker: boolean) => void;
  onJokerToggle?: (gameId: string) => void;
  currentJoker?: string | null;
  jokerUsed?: boolean;
}

export default function GameCard({ game, bet, onBetChange, onJokerToggle, currentJoker, jokerUsed }: GameCardProps) {
  const router = useRouter();
  const isStarted = new Date() >= new Date(game.kickoff_at);
  const time = new Date(game.kickoff_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const handleHomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onBetChange && !isStarted) {
      onBetChange(game.id, Math.max(0, parseInt(e.target.value) || 0), bet?.away_bet || 0, bet?.used_joker || false);
    }
  };

  const handleAwayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onBetChange && !isStarted) {
      onBetChange(game.id, bet?.home_bet || 0, Math.max(0, parseInt(e.target.value) || 0), bet?.used_joker || false);
    }
  };

  return (
    <div 
      onClick={() => router.push(`/game/${game.id}`)}
      className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-4 flex flex-col relative overflow-hidden group cursor-pointer hover:border-green-400 transition-colors"
    >
      {/* Joker tag */}
      {bet?.used_joker && (
        <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[9px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider z-10">
          Coringa Ativo
        </div>
      )}

      {/* Points tag */}
      {game.status === "finished" && bet?.points_earned !== null && (
        <div className="absolute top-0 left-0 bg-green-500 text-white text-[9px] font-bold px-3 py-1 rounded-br-xl uppercase tracking-wider z-10">
          +{bet?.points_earned} pts
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        {/* Home Team */}
        <div className="flex items-center gap-3 w-1/3">
          <TeamFlag team={game.home_team ?? ''} size={36} className="shadow-sm" />
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 text-sm line-clamp-1">{game.home_team}</span>
          </div>
        </div>
        
        {/* Joker Toggle */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
          {onJokerToggle && (
            <button
              onClick={(e) => { e.stopPropagation(); onJokerToggle(game.id) }}
              disabled={jokerUsed && currentJoker !== game.id}
              className={`text-[10px] font-bebas tracking-wider px-3 py-1 rounded-full transition-colors shadow-sm ${
                currentJoker === game.id
                  ? 'bg-yellow-400 text-blue-900'
                  : 'bg-slate-100 text-slate-400'
              } disabled:opacity-50`}
            >
              ⚡ CORINGA
            </button>
          )}
        </div>
        
        {/* Score & Time */}
        <div className="flex flex-col items-center justify-center w-1/3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              min="0"
              max="99"
              onFocus={e => e.target.select()}
              className="w-10 h-10 bg-[#2b2b2b] rounded-lg flex items-center justify-center text-white font-bebas text-2xl text-center outline-none focus:ring-2 focus:ring-primary disabled:opacity-70 disabled:bg-slate-800" 
              defaultValue={bet?.home_bet ?? ""} 
              placeholder="-"
              disabled={isStarted}
              onChange={handleHomeChange}
            />
            <span className="text-slate-400 text-xs font-bold">x</span>
            <input 
              type="number" 
              min="0"
              max="99"
              onFocus={e => e.target.select()}
              className="w-10 h-10 bg-[#2b2b2b] rounded-lg flex items-center justify-center text-white font-bebas text-2xl text-center outline-none focus:ring-2 focus:ring-primary disabled:opacity-70 disabled:bg-slate-800" 
              defaultValue={bet?.away_bet ?? ""} 
              placeholder="-"
              disabled={isStarted}
              onChange={handleAwayChange}
            />
          </div>
          <span className="font-bold text-slate-800 text-sm mt-2">{time}</span>
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-end gap-3 w-1/3">
          <div className="flex flex-col items-end">
            <span className="font-bold text-slate-800 text-sm line-clamp-1">{game.away_team}</span>
          </div>
          <TeamFlag team={game.away_team ?? ''} size={36} className="shadow-sm" />
        </div>
      </div>
    </div>
  );
}
