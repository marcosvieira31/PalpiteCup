import Header from "@/components/layout/Header";
import { createClient } from '@/lib/supabase/server'

export default async function Palpites() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: bets } = await supabase
    .from('bets')
    .select('*, games(*)')
    .eq('user_id', user?.id || '')
    .order('submitted_at', { ascending: false })

  return (
    <main className="min-h-screen bg-background pb-24">
      <Header title="MEUS PALPITES" />
      
      <div className="container mx-auto px-4 py-6 space-y-4">
        {(!bets || bets.length === 0) ? (
           <p className="text-center text-slate-400 py-8">Você ainda não fez nenhum palpite. Comece pelo Dashboard! ⚽</p>
        ) : (
          bets.map(bet => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const game = bet.games as any;
            if (!game) return null;
            return (
              <div key={bet.id} className={`bg-white rounded-2xl shadow-sm p-4 border border-gray-100 ${game.status === 'finished' ? 'opacity-75' : ''}`}>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">{new Date(game.kickoff_at).toLocaleDateString('pt-BR')} • {new Date(game.kickoff_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  {game.status === 'finished' ? (
                    <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-md">+{bet.points_earned || 0} Pontos</span>
                  ) : (
                    <span className="text-xs font-bold px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md">Pendente</span>
                  )}
                </div>

                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-2xl shadow-sm border border-gray-100 font-bebas">
                      {game.home_team.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-bold text-xs text-center">{game.home_team}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="font-bebas text-3xl text-gray-800">{bet.home_bet}</span>
                    <span className="font-bebas text-xl text-gray-300">X</span>
                    <span className="font-bebas text-3xl text-gray-800">{bet.away_bet}</span>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-2xl shadow-sm border border-gray-100 font-bebas">
                      {game.away_team.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-bold text-xs text-center">{game.away_team}</span>
                  </div>
                </div>
                
                {game.status === 'finished' && (
                  <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-500">Resultado oficial: {game.home_score} x {game.away_score}</p>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </main>
  );
}
