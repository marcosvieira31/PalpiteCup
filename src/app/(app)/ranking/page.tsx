import { createClient } from '@/lib/supabase/server'
import RankingGlobal from '@/components/ranking/RankingGlobal'

export default async function RankingPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: players } = await supabase
    .from('users')
    .select('id, username, points_total, avatar_url')
    .order('points_total', { ascending: false })
    .limit(50)

  return (
    <RankingGlobal
      players={players ?? []}
      currentUserId={user?.id ?? ''}
    />
  )
}
