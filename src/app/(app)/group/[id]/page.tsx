import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import GroupHeader from '@/components/group/GroupHeader'
import RankingList from '@/components/group/RankingList'
import GroupActions from '@/components/group/GroupModals'
import PendingRequests from '@/components/group/PendingRequests'
import LiveBetsShareCard from '@/components/group/LiveBetsShareCard'
import GroupShareMenu from '@/components/group/GroupShareMenu'
import { getGroupPoints, getGroupPointsDetailed } from './actions'

export const dynamic = 'force-dynamic'

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

  // Jogos ao vivo, respeitando os filtros de times/fases do grupo (mesma lógica usada na pontuação)
  const { data: liveGamesData } = await supabase
    .from('games')
    .select('id, home_team, away_team, home_score, away_score, status, group_stage')
    .eq('status', 'live')

  let liveGames = liveGamesData ?? []

  const hasTeamFilter = (group.filter_teams?.length ?? 0) > 0
  const hasPhaseFilter = (group.filter_phases?.length ?? 0) > 0

  if (hasTeamFilter) {
    liveGames = liveGames.filter(g =>
      group.filter_teams!.includes(g.home_team ?? '') ||
      group.filter_teams!.includes(g.away_team ?? '')
    )
  }
  if (hasPhaseFilter) {
    liveGames = liveGames.filter(g =>
      group.filter_phases!.includes(g.group_stage ?? '')
    )
  }

  const liveGameIds = liveGames.map(g => g.id)

  const memberIds = (group.group_members ?? []).map((m: { user_id: string }) => m.user_id)

  const { data: liveBetsRaw } = liveGameIds.length > 0 && memberIds.length > 0
    ? await supabase
        .from('bets')
        .select('user_id, game_id, home_bet, away_bet, users(username, avatar_url)')
        .in('game_id', liveGameIds)
        .in('user_id', memberIds)
    : { data: [] }

  const liveBetsData = liveBetsRaw ?? []

  // Busca joker_picks para os jogos ao vivo
  const { data: liveJokerPicks } = liveGameIds.length > 0 && memberIds.length > 0
    ? await supabase
        .from('joker_picks')
        .select('user_id, game_id')
        .in('game_id', liveGameIds)
        .in('user_id', memberIds)
    : { data: [] }

  const liveBets = liveBetsData.map(b => ({
    ...b,
    has_joker: (liveJokerPicks ?? []).some(
      jp => String(jp.game_id) === String(b.game_id) && jp.user_id === b.user_id
    )
  }))

  const computedMembers = await getGroupPoints(Number(params.id))

  const detailedMembers = await getGroupPointsDetailed(Number(params.id))

  // Busca classificação final dos grupos para o modal de detalhamento
  const { data: groupStandings } = await supabase
    .from('group_standings')
    .select('group_name, position, team')
    .order('group_name')
    .order('position')

  // Busca joker_picks de todos os membros com dados do jogo e do usuário (para auditoria do líder)
  const { data: jokerAuditRaw } = isOwner && memberIds.length > 0
    ? await supabase
        .from('joker_picks')
        .select('user_id, game_id, round_number, games!inner(home_team, away_team, status), users(username, avatar_url)')
        .in('user_id', memberIds)
        .eq('games.status', 'finished')
        .order('round_number')
    : { data: [] }

  const jokerAudit = (jokerAuditRaw ?? []).map(jp => ({
    user_id: jp.user_id,
    game_id: jp.game_id,
    round_number: jp.round_number,
    username: (jp.users as { username: string; avatar_url: string | null } | null)?.username ?? 'Usuário',
    avatar_url: (jp.users as { username: string; avatar_url: string | null } | null)?.avatar_url ?? null,
    home_team: (jp.games as { home_team: string | null; away_team: string | null } | null)?.home_team ?? null,
    away_team: (jp.games as { home_team: string | null; away_team: string | null } | null)?.away_team ?? null,
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
          jokerAudit={jokerAudit as import('@/components/group/GroupModals').JokerAuditEntry[]}
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
        <LiveBetsShareCard
          liveGames={liveGames}
          liveBets={liveBets as unknown as import('@/components/group/LiveBetsShareCard').LiveBetWithUser[]}
          groupName={group.name}
        />

        <GroupShareMenu
          groupName={group.name}
          hasLiveGame={liveGames.length > 0}
        />

        <RankingList
          members={computedMembers as unknown as import('@/components/group/RankingList').RankingMember[]}
          detailedMembers={detailedMembers as unknown as import('@/components/group/RankingList').DetailedMember[]}
          groupStandings={groupStandings ?? []}
          filterTeams={group.filter_teams ?? []}
          filterPhases={group.filter_phases ?? []}
          group={group}
          groupName={group.name}
          groupId={Number(params.id)}
          initialLiveGames={liveGames}
          initialLiveBets={liveBets}
        />
      </div>
    </div>
  )
}
