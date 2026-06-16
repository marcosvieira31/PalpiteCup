export const maxDuration = 60

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
    const hasLive = Array.isArray(liveData) && liveData.length > 0

    const matches = hasLive ? liveData : await fetchAllMatches()

    if (!Array.isArray(matches)) {
      console.error('Erro na API externa (Chave desativada ou limite excedido):', matches)
      return NextResponse.json({ error: 'External API Error', details: matches }, { status: 502 })
    }

    await Promise.all(matches.map(async (m) => {
      try {
        const status = m.status === 'completed' || m.phase === 'FT' || m.phase === 'FT_PEN'
          ? 'finished'
          : ['1H', 'HT', '2H', 'ET1', 'ET2', 'PEN'].includes(m.phase)
          ? 'live'
          : 'scheduled'

        const { error } = await supabase.from('games').upsert({
          api_football_id: m.id,
          home_team: translateTeam(m.home_team),
          away_team: translateTeam(m.away_team),
          home_score: m.home_score ?? null,
          away_score: m.away_score ?? null,
          kickoff_at: m.kickoff_utc,
          status,
          group_stage: m.group_name ? `Grupo ${m.group_name}` : translateRound(m.round),
          venue: m.stadium
        }, {
          onConflict: 'api_football_id',
          ignoreDuplicates: false
        })

        if (error) {
          console.error(`ERRO no jogo ${m.id}:`, JSON.stringify(error))
        }
      } catch (err) {
        console.error(`EXCEÇÃO no jogo ${m.id}:`, err)
      }
    }))

    return NextResponse.json({
      ok: true,
      mode: hasLive ? 'live' : 'all',
      synced: matches.length
    })

  } catch (error) {
    return NextResponse.json({ error: 'Sync failed', details: String(error) }, { status: 500 })
  }
}
