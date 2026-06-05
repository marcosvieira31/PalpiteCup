import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import MatchHeader from '@/components/game/MatchHeader'
import MatchTimeline from '@/components/game/MatchTimeline'

export default async function GamePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  let game = null
  const numericId = parseInt(params.id)
  
  if (!isNaN(numericId) && !params.id.startsWith('mock-')) {
    const { data } = await supabase
      .from('games')
      .select('*')
      .eq('id', numericId)
      .single()
    game = data
  }

  // For testing the UI without real DB data
  if (!game && params.id.startsWith("mock")) {
    game = {
      id: params.id,
      home_team: params.id === "mock-1" ? "Espanha" : "França",
      away_team: params.id === "mock-1" ? "Alemanha" : "Inglaterra",
      kickoff_at: new Date(new Date().setHours(16, 0, 0, 0)).toISOString(),
      status: "live",
      home_score: 2,
      away_score: 1,
      api_football_id: null,
      round_id: 1,
      created_at: new Date().toISOString()
    };
  }

  if (!game) notFound()

  return (
    <div className="pb-24">
      <MatchHeader game={game} />
      <MatchTimeline gameId={game.id} />
    </div>
  )
}
