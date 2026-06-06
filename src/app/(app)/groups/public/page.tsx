import { createClient } from '@/lib/supabase/server'
import PublicGroupsList from '@/components/groups/PublicGroupsList'

export default async function PublicGroupsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: groups } = await supabase
    .from('groups')
    .select(`
      id, name, description, type, invite_code,
      group_members(count)
    `)
    .in('type', ['open', 'moderated'])
    .order('id', { ascending: false })

  // Busca solicitações pendentes do usuário
  const { data: myRequests } = await supabase
    .from('group_requests')
    .select('group_id, status')
    .eq('user_id', user?.id ?? '')

  // Busca grupos que já é membro
  const { data: myMemberships } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user?.id ?? '')

  return (
    <PublicGroupsList
      groups={groups ?? []}
      myRequests={myRequests ?? []}
      myMemberships={myMemberships ?? []}
      userId={user?.id ?? ''}
    />
  )
}
