import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    // Verify Service Role Key to prevent unauthorized access
    if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { game_id, home_score, away_score, status } = body;

    if (!game_id || typeof home_score !== 'number' || typeof away_score !== 'number' || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update the game using Supabase Admin Client
    const { data, error } = await supabaseAdmin
      .from('games')
      .update({ home_score, away_score, status })
      .eq('id', game_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, game: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
