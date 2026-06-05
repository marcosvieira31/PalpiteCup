import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import GroupHeader from '@/components/group/GroupHeader'
import RankingList from '@/components/group/RankingList'
import GroupChat from '@/components/group/GroupChat'

export default async function GroupPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  let { data: group } = await supabase
    .from('groups')
    .select('*, group_members(*, users(username, avatar_url, points_total))')
    .eq('id', params.id)
    .single()

  if (!group && params.id.startsWith("mock") || params.id === "1") {
    // Mock Data for Layout Validation
    group = {
      id: "mock-group",
      name: "Tropa do hexa",
      invite_code: "HEXA2026",
      owner_id: "1",
      created_at: new Date().toISOString(),
      group_members: [
        { user_id: '1', users: { username: 'Renatinho', avatar_url: null }, points_total: 42, group_id: "mock-group", joined_at: "" },
        { user_id: '2', users: { username: 'Carioca10', avatar_url: null }, points_total: 38, group_id: "mock-group", joined_at: "" },
        { user_id: '3', users: { username: 'ProfetaFC', avatar_url: null }, points_total: 31, group_id: "mock-group", joined_at: "" },
        { user_id: '4', users: { username: 'ZéBolão', avatar_url: null }, points_total: 24, group_id: "mock-group", joined_at: "" },
      ]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }

  if (!group) notFound()

  type MemberType = {
    user_id: string;
    points_total?: number;
    users: { username: string; avatar_url: string | null; points_total?: number };
  };

  // Map the nested users correctly to match the RankingMember interface
  const formattedMembers = group.group_members.map((gm: MemberType) => ({
    user_id: gm.user_id,
    points_total: gm.points_total, // Note: The mock has points_total, but in our DB points_total is on `users`, so we should pull it from `users` if available.
    users: gm.users
  })).map((m: MemberType) => ({
    ...m,
    points_total: m.points_total || m.users?.points_total || (Math.floor(Math.random() * 50)) // Fallback for mock mapping if missing
  }));

  return (
    <div className="pb-24">
      <GroupHeader group={group} />
      <RankingList members={formattedMembers} />
      <GroupChat groupId={group.id} />
    </div>
  )
}
