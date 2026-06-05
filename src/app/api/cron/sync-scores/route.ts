import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fetchAllMatches, fetchMatchesByStatus, fetchStandings } from '@/lib/wc2026/client'
import { translateTeam, translatePhase } from '@/lib/wc2026/translations'

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
    const liveData = await fetchMatchesByStatus('live')
    const hasLive = liveData.length > 0

    const matches = hasLive ? liveData : await fetchAllMatches()

    for (const m of matches) {
      const status = m.status === 'finished' || m.status === 'FT' || m.status === 'FT_PEN'
        ? 'finished'
        : ['1H', 'HT', '2H', 'ET1', 'ET2', 'PEN', 'in_play', 'live'].includes(m.status)
        ? 'live'
        : 'scheduled'

      await supabase.from('games').upsert({
        api_football_id: m.id,
        home_team: translateTeam(m.home_team),
        away_team: translateTeam(m.away_team),
        home_score: m.home_score ?? null,
        away_score: m.away_score ?? null,
        kickoff_at: m.date || m.kickoff_utc,
        status,
        group_stage: m.group_stage ? translatePhase(m.group_stage) : (m.group_name ? `Grupo ${m.group_name}` : null),
        venue: m.venue || m.stadium
      }, { onConflict: 'api_football_id' })
    }

    // Sync Standings
    const standingsData = await fetchStandings()

    if (standingsData && Array.isArray(standingsData)) {
      for (const group of standingsData) {
        let position = 1
        for (const team of group.standings) {
          await supabase.from('group_standings').upsert({
            group_name: group.group_name,
            team: translateTeam(team.team),
            played: team.played,
            wins: team.wins,
            draws: team.draws,
            losses: team.losses,
            goals_for: team.goals_for,
            goals_against: team.goals_against,
            goal_diff: team.goal_diff,
            points: team.points,
            position,
            updated_at: new Date().toISOString()
          }, { onConflict: 'group_name,team' })
          position++
        }
      }
    }

    return NextResponse.json({
      ok: true,
      mode: hasLive ? 'live' : 'all',
      synced: matches.length
    })

  } catch (error) {
    return NextResponse.json({ error: 'Sync failed', details: String(error) }, { status: 500 })
  }
}
