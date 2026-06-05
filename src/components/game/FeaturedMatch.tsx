"use client"
import { useState } from "react";
import { Zap, Check } from "lucide-react";
import { submitBet } from "@/app/(app)/dashboard/actions";
import ShareBet from "./ShareBet";

import { Database } from "@/types/database";

type Game = Database["public"]["Tables"]["games"]["Row"];
type Bet = Database["public"]["Tables"]["bets"]["Row"];

interface FeaturedMatchProps {
  game: Game
  bet: Bet | null
}

export default function FeaturedMatch({ game, bet: initialBet }: FeaturedMatchProps) {
  const [bet, setBet] = useState<{ home: number; away: number }>({ 
    home: initialBet?.home_bet ?? 0, 
    away: initialBet?.away_bet ?? 0 
  })
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = async () => {
    try {
      await submitBet(game.id.toString(), bet.home, bet.away, false);
      setConfirmed(true);
      setTimeout(() => setConfirmed(false), 2000);
    } catch (error) {
      alert((error as Error).message);
    }
  };

  return (
    <div className="border border-white/30 rounded-3xl p-5 bg-white/10 backdrop-blur-sm text-white shadow-lg mt-6">
      <p className="text-[10px] text-center font-bold tracking-widest uppercase mb-5 opacity-90 flex items-center justify-center gap-1">
        <span>🏆</span> COPA DO MUNDO • {game.group_stage?.toUpperCase() || 'FASE DE GRUPOS'}
      </p>
      
      <div className="flex items-center justify-between px-2">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full border-2 border-white bg-white/20 flex items-center justify-center font-bebas text-3xl shadow-sm">
            {game.home_team.substring(0, 2).toUpperCase()}
          </div>
          <span className="font-bold text-sm tracking-wide text-center">{game.home_team}</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3">
            <input 
              type="number" 
              min="0"
              max="99"
              className="w-14 h-12 bg-[#2b2b2b] rounded-xl flex items-center justify-center font-bebas text-3xl shadow-inner text-center border-2 border-yellow-400 text-white appearance-none outline-none focus:ring-2 focus:ring-yellow-400" 
              value={bet.home}
              onChange={e => setBet({ ...bet, home: Math.max(0, parseInt(e.target.value) || 0) })}
            />
            <span className="text-white/60 text-sm font-bold">x</span>
            <input 
              type="number" 
              min="0"
              max="99"
              className="w-14 h-12 bg-[#2b2b2b] rounded-xl flex items-center justify-center font-bebas text-3xl shadow-inner text-center border-2 border-yellow-400 text-white appearance-none outline-none focus:ring-2 focus:ring-yellow-400" 
              value={bet.away}
              onChange={e => setBet({ ...bet, away: Math.max(0, parseInt(e.target.value) || 0) })}
            />
          </div>
          <div className="mt-4 bg-slate-900/40 text-white text-[10px] font-bold px-3 py-1 rounded-full w-max flex items-center gap-1.5 shadow-sm">
            {game.status === 'live' ? (
              <><div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> AO VIVO</>
            ) : (
              <>{new Date(game.kickoff_at).toLocaleDateString('pt-BR')} • {new Date(game.kickoff_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full border-2 border-white bg-white/20 flex items-center justify-center font-bebas text-3xl shadow-sm">
            {game.away_team.substring(0, 2).toUpperCase()}
          </div>
          <span className="font-bold text-sm tracking-wide text-center">{game.away_team}</span>
        </div>
      </div>
      
      <button 
        onClick={handleConfirm}
        className="w-full mt-6 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black italic py-4 rounded-full transition-all flex items-center justify-center gap-2 shadow-sm text-sm uppercase tracking-widest active:scale-[0.98]"
      >
        {confirmed ? (
          <>
            <Check size={16} className="text-green-700 stroke-[3]" /> <span className="text-green-700">PALPITE CONFIRMADO</span>
          </>
        ) : (
          <>
            <Zap size={16} className="text-slate-900 fill-slate-900" /> CONFIRMAR PALPITE
          </>
        )}
      </button>

      {confirmed && (
        <ShareBet 
          game={game} 
          homeBet={bet.home} 
          awayBet={bet.away} 
        />
      )}
    </div>
  );
}
