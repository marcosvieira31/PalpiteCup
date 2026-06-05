import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import MatchHeader from '@/components/game/MatchHeader'
import MatchTimeline from '@/components/game/MatchTimeline'

export default async function GamePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  let game = null
  const numericId = parseInt(params.id)
  
  if (!isNaN(numericId)) {
    const { data } = await supabase
      .from('games')
      .select('*')
      .eq('id', numericId)
      .single()
    game = data
  }

  if (!game) notFound()

  return (
    <div className="pb-24">
      <MatchHeader game={game} />
      <MatchTimeline gameId={game.id} />
    </div>
  )
}
