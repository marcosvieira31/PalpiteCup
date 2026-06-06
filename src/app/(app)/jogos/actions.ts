'use server'
import { createClient } from '@/lib/supabase/server'

export async function saveBracketPrediction(
  round: string,
  position: number,
  predictedTeam: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  // Verifica se o bracket está travado
  const { data: lock } = await supabase
    .from('games')
    .select('kickoff_at')
    .eq('round_number', 2)
    .eq('status', 'scheduled')
    .order('kickoff_at')
    .limit(1)
    .single()

  if (!lock) throw new Error('Bracket travado — 2ª rodada já iniciou.')

  const { error } = await supabase
    .from('bracket_predictions')
    .upsert({
      user_id: user.id,
      round,
      position,
      predicted_team: predictedTeam,
      locked: false
    }, { onConflict: 'user_id,round,position' })

  if (error) throw new Error(error.message)
}
