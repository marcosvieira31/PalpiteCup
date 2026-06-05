import { Game } from '@/types/database';

export default function CopaGameRow({ game }: { game: Game }) {
  const date = new Date(game.kickoff_at);
  const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  
  return (
    <div className="bg-white rounded-2xl shadow-sm p-3 border border-slate-100 flex items-center justify-between gap-2">
      <div className="flex flex-col items-center justify-center min-w-[50px] bg-slate-50 rounded-xl p-2 border border-slate-100">
        <span className="text-xs font-bold text-slate-700">{formattedDate}</span>
        <span className="text-[10px] text-slate-400 font-bold uppercase">{formattedTime}</span>
      </div>
      
      <div className="flex flex-1 items-center justify-center gap-3">
        <div className="flex flex-col items-center gap-1 w-12">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm shadow-sm border border-slate-200 font-bebas text-slate-700">
            {game.home_team.substring(0,2).toUpperCase()}
          </div>
          <span className="text-[9px] font-bold text-center uppercase tracking-wider truncate w-14">{game.home_team}</span>
        </div>
        
        <div className="flex flex-col items-center justify-center min-w-[40px]">
          {game.status === 'finished' || game.status === 'live' ? (
            <div className="flex items-center gap-1 font-bebas text-xl">
              <span>{game.home_score}</span>
              <span className="text-slate-300">-</span>
              <span>{game.away_score}</span>
            </div>
          ) : (
            <div className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded-md">X</div>
          )}
          {game.status === 'live' && (
             <span className="text-[8px] font-bold text-red-500 animate-pulse mt-0.5">AO VIVO</span>
          )}
        </div>
        
        <div className="flex flex-col items-center gap-1 w-12">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm shadow-sm border border-slate-200 font-bebas text-slate-700">
            {game.away_team.substring(0,2).toUpperCase()}
          </div>
          <span className="text-[9px] font-bold text-center uppercase tracking-wider truncate w-14">{game.away_team}</span>
        </div>
      </div>
      
      {game.venue && (
        <div className="hidden sm:flex flex-col items-end min-w-[70px]">
           <span className="text-[9px] text-slate-400 max-w-[80px] text-right truncate" title={game.venue}>{game.venue}</span>
        </div>
      )}
    </div>
  );
}
