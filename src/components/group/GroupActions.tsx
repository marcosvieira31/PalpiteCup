"use client"
import { useState } from 'react'
import GroupModals from './GroupModals'
import { Group } from '@/types/database'

interface Props {
  groupId: number | string
  userId: string
  isOwner: boolean
  group: Group
  allTeams: string[]
}

export default function GroupActions({ groupId, userId, isOwner, group, allTeams }: Props) {
  const [chatEnabled, setChatEnabled] = useState(group.chat_enabled ?? true)
  const [filterEnabled, setFilterEnabled] = useState(group.chat_filter_enabled ?? true)

  return (
    <div className="flex gap-2">
      <GroupModals
        type="chat"
        groupId={groupId}
        userId={userId}
        label="💬 RESENHA"
        chatEnabled={chatEnabled}
        filterEnabled={filterEnabled}
      />
      {isOwner && (
        <GroupModals
          type="settings"
          groupId={groupId}
          userId={userId}
          label="⚙️ CONFIGURAR"
          group={group}
          allTeams={allTeams}
          chatEnabled={chatEnabled}
          filterEnabled={filterEnabled}
          onChatToggle={setChatEnabled}
          onFilterToggle={setFilterEnabled}
        />
      )}
    </div>
  )
}
