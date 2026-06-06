import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import GroupHeader from '@/components/group/GroupHeader'
import RankingList from '@/components/group/RankingList'
import GroupChat from '@/components/group/GroupChat'
import GroupFilterConfig from '@/components/group/GroupFilterConfig'

export default async function GroupPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: group } = await supabase
    .from('groups')
    .select('*, group_members(*, users(username, avatar_url, points_total))')
    .eq('id', params.id)
    .single()

  if (!group) notFound()

  type MemberType = {
    user_id: string;
    points_total?: number;
    users: { username: string; avatar_url: string | null; points_total?: number };
  };

  const formattedMembers = group.group_members.map((gm: MemberType) => ({
    user_id: gm.user_id,
    points_total: gm.users?.points_total || 0,
    users: gm.users
  }));

  // Busca todos os times para o filtro
  const { data: teams } = await supabase
    .from('games')
    .select('home_team, away_team')
    .not('home_team', 'is', null)

  const allTeams = [...new Set(
    (teams ?? []).flatMap(g => [g.home_team, g.away_team]).filter(Boolean)
  )].sort() as string[]

  const isOwner = user?.id === group.owner_id

  return (
    <div className="pb-24">
      <GroupHeader group={group} />
      <RankingList 
        members={formattedMembers} 
        filterTeams={group.filter_teams ?? []}
        filterPhases={group.filter_phases ?? []}
      />
      {isOwner && (
        <div className="px-4 mt-4">
          <GroupFilterConfig
            groupId={Number(params.id)}
            initialTeams={group.filter_teams ?? []}
            initialPhases={group.filter_phases ?? []}
            locked={group.filter_locked ?? false}
            allTeams={allTeams}
          />
        </div>
      )}
      <GroupChat groupId={group.id} />
    </div>
  )
}
