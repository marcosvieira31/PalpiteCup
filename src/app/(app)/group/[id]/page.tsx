import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import GroupHeader from '@/components/group/GroupHeader'
import RankingList from '@/components/group/RankingList'
import GroupModals from '@/components/group/GroupModals'

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
  const members = group.group_members ?? []

  return (
    <div className="pb-24">
      <GroupHeader group={group} />

      {/* Botões de ação */}
      <div className="px-4 mt-4 flex gap-2">
        {group.chat_enabled && (
          <GroupModals
            type="chat"
            groupId={group.id}
            userId={user?.id ?? ''}
            label="💬 RESENHA"
          />
        )}
        {isOwner && (
          <GroupModals
            type="settings"
            groupId={group.id}
            userId={user?.id ?? ''}
            label="⚙️ CONFIGURAR"
            group={group as unknown as import('@/types/database').Group}
            allTeams={allTeams}
          />
        )}
      </div>

      {/* Ranking é o foco principal */}
      <div className="px-4 mt-4">
        <RankingList
          members={members as unknown as import('@/components/group/RankingList').RankingMember[]}
          filterTeams={group.filter_teams ?? []}
          filterPhases={group.filter_phases ?? []}
        />
      </div>
    </div>
  )
}
