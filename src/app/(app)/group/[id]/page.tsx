import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import GroupHeader from '@/components/group/GroupHeader'
import RankingList from '@/components/group/RankingList'
import GroupChat from '@/components/group/GroupChat'

export default async function GroupPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  let { data: group } = await supabase
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

  return (
    <div className="pb-24">
      <GroupHeader group={group} />
      <RankingList members={formattedMembers} />
      <GroupChat groupId={group.id} />
    </div>
  )
}
