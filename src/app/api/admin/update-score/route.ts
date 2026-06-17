import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ADMIN_EMAILS = ['marcosnd.31@gmail.com']

export async function POST(request: NextRequest) {
  const { gameId, status, homeScore, awayScore, userEmail } = await request.json()

  if (!ADMIN_EMAILS.includes(userEmail)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('games')
    .update({ status, home_score: homeScore, away_score: awayScore })
    .eq('id', gameId)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, data })
}
