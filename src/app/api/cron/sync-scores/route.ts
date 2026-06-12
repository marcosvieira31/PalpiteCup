import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fetchAllMatches, fetchMatchesByStatus } from '@/lib/wc2026/client'
import { translateTeam, translateRound } from '@/lib/wc2026/translations'

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
      try {
        const status =
          m.status === 'completed' || m.phase === 'FT' || m.phase === 'FT_PEN'
            ? 'finished'
            : ['1H', 'HT', '2H', 'ET1', 'ET2', 'PEN'].includes(m.phase)
            ? 'live'
            : 'scheduled'

        console.log(`Jogo ${m.id}: status=${m.status} phase=${m.phase} → mapeado para: ${status}`)

        const { error } = await supabase.from('games').update({
          home_team: translateTeam(m.home_team) || null,
          away_team: translateTeam(m.away_team) || null,
          home_score: m.home_score ?? null,
          away_score: m.away_score ?? null,
          kickoff_at: m.date || m.kickoff_utc,
          status,
          group_stage: m.group_name ? `Grupo ${m.group_name}` : translateRound(m.round),
          venue: m.venue || m.stadium
        }).eq('api_football_id', m.id)

        if (error) {
          console.error(`ERRO no jogo ${m.id} (${m.home_team} x ${m.away_team}):`, JSON.stringify(error))
        }
      } catch (err) {
        console.error(`EXCEÇÃO no jogo ${m.id}:`, err)
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
