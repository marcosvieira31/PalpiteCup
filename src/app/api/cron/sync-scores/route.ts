import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fetchLiveGames, fetchTodayGames } from '@/lib/api-football/client'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Verifica se há jogos ao vivo
    const liveData = await fetchLiveGames()
    const hasLive = liveData.results > 0

    // Busca jogos ao vivo ou do dia
    const data = hasLive ? liveData : await fetchTodayGames()
    const fixtures = data.response ?? []

    for (const fixture of fixtures) {
      const { fixture: f, goals, teams } = fixture

      const status = f.status.short === 'FT' ? 'finished'
        : ['1H', '2H', 'HT', 'ET', 'P'].includes(f.status.short) ? 'live'
        : 'scheduled'

      await supabase.from('games').upsert({
        api_football_id: f.id,
        home_team: teams.home.name,
        away_team: teams.away.name,
        home_score: goals.home,
        away_score: goals.away,
        kickoff_at: f.date,
        status
      }, { onConflict: 'api_football_id' })
    }

    return NextResponse.json({
      ok: true,
      mode: hasLive ? 'live' : 'daily',
      synced: fixtures.length
    })

  } catch (error) {
    console.error("Cron sync error:", error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
