"use client"
import { useState } from 'react'
import GroupChat from './GroupChat'
import GroupFilterConfig from './GroupFilterConfig'
import { supabase } from '@/lib/supabase/client'
import { Group } from '@/types/database'

interface Props {
  type: 'chat' | 'settings'
  groupId: number | string
  userId: string
  label: string
  group?: Group
  allTeams?: string[]
}

export default function GroupModals({ type, groupId, userId, label, group, allTeams }: Props) {
  const [open, setOpen] = useState(false)
  const [savingChat, setSavingChat] = useState(false)

  const handleToggleChat = async (enabled: boolean) => {
    setSavingChat(true)
    await supabase
      .from('groups')
      .update({ chat_enabled: enabled })
      .eq('id', String(groupId))
    setSavingChat(false)
    window.location.reload()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex-1 py-2.5 rounded-2xl font-bebas tracking-wider text-sm transition-all active:scale-95 ${
          type === 'chat'
            ? 'bg-white border-2 border-slate-200 text-slate-700'
            : 'bg-blue-900 text-yellow-400'
        }`}
      >
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white w-full max-w-[390px] rounded-t-3xl max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mt-4 mb-2" />

            {/* Header do modal */}
            <div className="flex justify-between items-center px-4 pb-3 border-b border-slate-100">
              <p className="font-bebas text-xl tracking-wider text-slate-800">{label}</p>
              <button onClick={() => setOpen(false)} className="text-slate-400 text-2xl leading-none">×</button>
            </div>

            <div className="p-4">
              {type === 'chat' && (
                <GroupChat groupId={groupId} currentUserId={userId} />
              )}

              {type === 'settings' && group && (
                <div className="space-y-4">
                  {/* Toggle Resenha */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">💬 Resenha do Grupo</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {group.chat_enabled ? 'Chat ativado' : 'Chat desativado'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggleChat(!group.chat_enabled)}
                        disabled={savingChat}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          group.chat_enabled ? 'bg-green-500' : 'bg-slate-300'
                        }`}
                      >
                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                          group.chat_enabled ? 'left-6' : 'left-0.5'
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Filtro de jogos */}
                  <GroupFilterConfig
                    groupId={groupId}
                    initialTeams={group.filter_teams ?? []}
                    initialPhases={group.filter_phases ?? []}
                    locked={group.filter_locked ?? false}
                    allTeams={allTeams ?? []}
                    onSaved={() => setOpen(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
