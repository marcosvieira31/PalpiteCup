import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Verify CRON_SECRET to ensure only trusted external cron jobs can trigger this
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = process.env.API_FOOTBALL_KEY;
    if (!apiKey) {
      throw new Error('Missing API_FOOTBALL_KEY');
    }

    /* 
      1. FETCH LIVE SCORES FROM API-FOOTBALL
      (Uncomment and adjust once API Football match IDs are mapped to your Supabase games.id)
      
      const res = await fetch('https://v3.football.api-sports.io/fixtures?live=all', {
        headers: { 'x-apisports-key': apiKey }
      });
      const data = await res.json();
      
      2. UPDATE GAMES IN SUPABASE
      for (const match of data.response) {
        // e.g. mapping by api_football_id
        await supabaseAdmin.from('games').update({
          home_score: match.goals.home,
          away_score: match.goals.away,
          status: match.fixture.status.short === 'FT' ? 'finished' : 'live'
        }).eq('api_football_id', match.fixture.id);
      }
    */

    return NextResponse.json({ success: true, message: 'Scores sync job executed successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
