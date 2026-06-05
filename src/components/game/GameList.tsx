"use client";

import GameCard from "./GameCard";
import { submitBet } from "@/app/(app)/dashboard/actions";
import { Database } from "@/types/database";

type Game = Database["public"]["Tables"]["games"]["Row"];
type Bet = Database["public"]["Tables"]["bets"]["Row"];

interface GameListProps {
  games: Game[];
  bets: Bet[];
}

export default function GameList({ games, bets }: GameListProps) {
  const handleBetChange = (gameId: string, home: number, away: number, joker: boolean) => {
    submitBet(gameId, home, away, joker).catch((error: Error) => {
      alert(error.message);
    });
  };

  return (
    <div className="space-y-4 pb-24">
      {games.length === 0 ? (
        <div className="text-center text-slate-500 py-8 text-sm">
          Nenhum jogo programado para hoje.
        </div>
      ) : (
        games.map((game) => (
          <GameCard 
            key={game.id} 
            game={game} 
            bet={bets.find(b => b.game_id === game.id)} 
            onBetChange={handleBetChange} 
          />
        ))
      )}
    </div>
  );
}
