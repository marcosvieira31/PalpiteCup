"use client"
import { useState } from 'react'
import RankingList, { RankingMember, DetailedMember } from '@/components/group/RankingList'
import GroupShareMenu from '@/components/group/GroupShareMenu'
import { LiveGame, LiveBet } from '@/lib/scoring'

interface GroupStanding {
  group_name: string
  position: number
  team: string
}

export type RankingTab = 'geral' | 'partidas' | 'grupos' | 'jornada'

interface Props {
  members: RankingMember[]
  detailedMembers: DetailedMember[]
  groupStandings: GroupStanding[]
  filterTeams: string[]
  filterPhases: string[]
  group: import('@/types/database').Database["public"]["Tables"]["groups"]["Row"]
  groupName: string
  groupId: number
  initialLiveGames: LiveGame[]
  initialLiveBets: LiveBet[]
  hasLiveGame: boolean
}

export default function GroupRankingWrapper({
  members, detailedMembers, groupStandings,
  filterTeams, filterPhases, group, groupName, groupId,
  initialLiveGames, initialLiveBets, hasLiveGame
}: Props) {
  const [activeTab, setActiveTab] = useState<RankingTab>('geral')

  return (
    <>
      <GroupShareMenu
        groupName={groupName}
        hasLiveGame={hasLiveGame}
        activeRankingTab={activeTab}
      />
      <RankingList
        members={members}
        detailedMembers={detailedMembers}
        groupStandings={groupStandings}
        filterTeams={filterTeams}
        filterPhases={filterPhases}
        group={group}
        groupName={groupName}
        groupId={groupId}
        initialLiveGames={initialLiveGames}
        initialLiveBets={initialLiveBets}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </>
  )
}
