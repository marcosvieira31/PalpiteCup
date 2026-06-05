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

  const currentJoker = bets.find(b => b.used_joker)?.game_id;
  const jokerUsed = !!currentJoker;

  const handleJokerToggle = (gameId: string) => {
    const bet = bets.find(b => b.game_id === gameId);
    handleBetChange(gameId, bet?.home_bet || 0, bet?.away_bet || 0, !bet?.used_joker);
  };

  return (
    <div className="space-y-4 pb-24">
      {games.length === 0 ? (
        <p className="text-center text-slate-400 py-8">
          Nenhum jogo hoje. A Copa começa em 11 de junho! ⚽
        </p>
      ) : (
        games.map((game) => (
          <GameCard 
            key={game.id} 
            game={game} 
            bet={bets.find(b => b.game_id === game.id)} 
            onBetChange={handleBetChange} 
            onJokerToggle={handleJokerToggle}
            currentJoker={currentJoker}
            jokerUsed={jokerUsed}
          />
        ))
      )}
    </div>
  );
}
