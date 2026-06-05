

export interface EventCardProps {
  id?: string | number;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution';
  minute: number;
  player_name?: string | null;
  assist_name?: string | null;
  player_out?: string | null;
}

export default function EventCard({ type, minute, player_name, assist_name, player_out }: EventCardProps) {
  return (
    <div className="flex gap-4 items-center bg-white border border-slate-200 p-4 rounded-2xl shadow-sm z-10 w-[85%] mx-auto relative group hover:scale-[1.02] transition-transform">
      <div className="font-bebas text-2xl text-slate-400 w-10 flex-shrink-0 text-right">{minute}&apos;</div>
      
      <div className="flex-1">
        {type === 'goal' && (
          <div className="bg-blue-900 text-white p-3 rounded-xl flex gap-3 items-center">
            <span className="text-2xl drop-shadow-md">⚽</span>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-wide">{player_name}</span>
              {assist_name && <span className="text-blue-200 text-[10px] uppercase">Assist: {assist_name}</span>}
            </div>
          </div>
        )}
        
        {type === 'yellow_card' && (
          <div className="bg-yellow-50 text-yellow-900 border border-yellow-200 p-3 rounded-xl flex gap-3 items-center">
            <span className="text-2xl drop-shadow-sm">🟨</span>
            <span className="font-bold text-sm tracking-wide">{player_name}</span>
          </div>
        )}
        
        {type === 'red_card' && (
          <div className="bg-red-50 text-red-900 border border-red-200 p-3 rounded-xl flex gap-3 items-center">
            <span className="text-2xl drop-shadow-sm">🟥</span>
            <span className="font-bold text-sm tracking-wide">{player_name}</span>
          </div>
        )}
        
        {type === 'substitution' && (
          <div className="bg-slate-50 text-slate-800 border border-slate-200 p-3 rounded-xl flex flex-col gap-1">
            <div className="flex gap-2 items-center">
              <span className="text-green-500 font-bold text-lg leading-none">↑</span>
              <span className="font-bold text-sm tracking-wide">{player_name}</span>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-red-500 font-bold text-lg leading-none">↓</span>
              <span className="text-slate-500 text-xs font-medium">{player_out}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
