import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import FeaturedMatch from '@/components/game/FeaturedMatch'
import GameList from '@/components/game/GameList'

export const revalidate = 0; // Ensures fresh data load on request

export default async function Dashboard() {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: games } = await supabase
    .from('games')
    .select('*')
    .gte('kickoff_at', `${today}T00:00:00`)
    .lte('kickoff_at', `${today}T23:59:59`)
    .order('kickoff_at')

  const { data: { user } } = await supabase.auth.getUser()

  const { data: bets } = await supabase
    .from('bets')
    .select('*')
    .eq('user_id', user?.id || '')
    .in('game_id', games?.map(g => g.id) ?? [])

  let finalGames = games || []
  const finalBets = bets || []

  // Mock data if database is empty for visual testing
  if (finalGames.length === 0) {
    finalGames = [
      {
        id: "mock-1",
        home_team: "Espanha",
        away_team: "Alemanha",
        kickoff_at: new Date(new Date().setHours(16, 0, 0, 0)).toISOString(),
        status: "pending",
        home_score: 0,
        away_score: 0,
        api_football_id: null,
        round_id: 1,
        created_at: new Date().toISOString()
      },
      {
        id: "mock-2",
        home_team: "França",
        away_team: "Inglaterra",
        kickoff_at: new Date(new Date().setHours(20, 0, 0, 0)).toISOString(),
        status: "pending",
        home_score: 0,
        away_score: 0,
        api_football_id: null,
        round_id: 1,
        created_at: new Date().toISOString()
      }
    ]
  }

  return (
    <div className="pb-24">
      <Header>
        <FeaturedMatch />
      </Header>
      
      <div className="px-4 mt-8 space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="font-barlow font-black text-2xl leading-none text-slate-800 whitespace-nowrap">
            Jogos de Hoje
          </h2>
          <button className="text-sm font-bold text-primary flex items-center gap-1 hover:text-green-700 transition-colors">
            Ver todos <span className="text-xs">❯</span>
          </button>
        </div>
        
        {/* Filters */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex flex-col items-center gap-1 min-w-[60px]">
            <div className="w-14 h-14 rounded-full bg-white border-2 border-green-200 flex items-center justify-center shadow-sm">🏆</div>
            <span className="text-[10px] font-medium text-slate-500">Copa</span>
          </div>
          <div className="flex flex-col items-center gap-1 min-w-[60px]">
            <div className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">🌍</div>
            <span className="text-[10px] font-medium text-slate-500">Grupos</span>
          </div>
          <div className="flex flex-col items-center gap-1 min-w-[60px]">
            <div className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">⚔️</div>
            <span className="text-[10px] font-medium text-slate-500">Oitavas</span>
          </div>
          <div className="flex flex-col items-center gap-1 min-w-[60px]">
            <div className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">🔥</div>
            <span className="text-[10px] font-medium text-slate-500">Quartas</span>
          </div>
        </div>

        {/* Dynamic Game List */}
        <GameList games={finalGames} bets={finalBets} />
      </div>
    </div>
  )
}
