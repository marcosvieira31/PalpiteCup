import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import GroupHeader from '@/components/group/GroupHeader'
import RankingList from '@/components/group/RankingList'
import GroupActions from '@/components/group/GroupModals'
import PendingRequests from '@/components/group/PendingRequests'
import { getFilteredPoints } from './actions'

export default async function GroupPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: group } = await supabase
    .from('groups')
    .select(`
      *,
      group_members(
        *,
        users(id, username, points_total, avatar_url)
      )
    `)
    .eq('id', params.id)
    .single()

  if (!group) notFound()

  const { data: teams } = await supabase
    .from('games')
    .select('home_team, away_team')
    .not('home_team', 'is', null)

  const allTeams = [...new Set(
    (teams ?? []).flatMap(g => [g.home_team, g.away_team]).filter(Boolean)
  )].sort() as string[]

  const isOwner = user?.id === group.owner_id
  const hasFilter = (group.filter_teams?.length ?? 0) > 0 || (group.filter_phases?.length ?? 0) > 0

  const computedMembers = hasFilter
    ? await getFilteredPoints(
        Number(params.id),
        group.filter_teams ?? [],
        group.filter_phases ?? []
      )
    : (group.group_members ?? []).map((m: any) => ({
        user_id: m.user_id,
        points_total: m.users?.points_total ?? 0,
        users: m.users
      }))

  return (
    <div className="pb-24">
      <GroupHeader group={group} />

      {/* Botões de ação */}
      <div className="px-4 mt-4">
        <GroupActions
          groupId={group.id}
          userId={user?.id ?? ''}
          isOwner={isOwner}
          group={group as unknown as import('@/types/database').Group}
          allTeams={allTeams}
        />
      </div>

      {isOwner && group.type === 'moderated' && (
        <div className="px-4 mt-4">
          <PendingRequests groupId={params.id} />
        </div>
      )}

      {/* Ranking é o foco principal */}
      <div className="px-4 mt-4">
        <RankingList
          members={computedMembers as unknown as import('@/components/group/RankingList').RankingMember[]}
          filterTeams={group.filter_teams ?? []}
          filterPhases={group.filter_phases ?? []}
        />
      </div>
    </div>
  )
}
