import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import FeaturedMatch from '@/components/game/FeaturedMatch'
import GameList from '@/components/game/GameList'
import { redirect } from 'next/navigation'

export const revalidate = 0; // Ensures fresh data load on request

export default async function Dashboard() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: games } = await supabase
    .from('games')
    .select('*')
    .gte('kickoff_at', `${today}T00:00:00`)
    .lte('kickoff_at', `${today}T23:59:59`)
    .order('kickoff_at')

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }
  const { data: nextMatches } = await supabase
    .from('games')
    .select('*')
    .gte('kickoff_at', new Date().toISOString())
    .order('kickoff_at')
    .limit(1)

  const nextMatch = nextMatches?.[0] || null

  const gameIdsToFetch = new Set((games ?? []).map(g => g.id))
  if (nextMatch) gameIdsToFetch.add(nextMatch.id)

  const numericGameIds = Array.from(gameIdsToFetch).filter(id => typeof id === 'number')

  const { data: bets } = numericGameIds.length > 0
    ? await supabase
        .from('bets')
        .select('*')
        .eq('user_id', user?.id || '')
        .in('game_id', numericGameIds)
    : { data: [] }

  const finalGames = games || []
  const finalBets = bets || []

  return (
    <div className="pb-24">
      <Header>
        {nextMatch && (
          <FeaturedMatch
            game={nextMatch}
            bet={finalBets.find(b => b.game_id === nextMatch.id) ?? null}
          />
        )}
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
