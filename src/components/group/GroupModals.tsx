"use client"
import { useState } from 'react'
import GroupChat from './GroupChat'
import GroupFilterConfig from './GroupFilterConfig'
import { supabase } from '@/lib/supabase/client'
import { Group } from '@/types/database'

interface Props {
  groupId: number | string
  userId: string
  isOwner: boolean
  group: Group
  allTeams: string[]
}

export default function GroupActions({ groupId, userId, isOwner, group, allTeams }: Props) {
  const [chatOpen, setChatOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [chatEnabled, setChatEnabled] = useState(group.chat_enabled ?? true)
  const [filterEnabled, setFilterEnabled] = useState(group.chat_filter_enabled ?? true)

  const toggleChat = async (val: boolean) => {
    setChatEnabled(val)
    await supabase.from('groups').update({ chat_enabled: val }).eq('id', String(groupId))
  }

  const toggleFilter = async (val: boolean) => {
    setFilterEnabled(val)
    await supabase.from('groups').update({ chat_filter_enabled: val }).eq('id', String(groupId))
  }

  return (
    <>
      {/* Botões */}
      <div className="flex gap-2">
        <button
          onClick={() => chatEnabled && setChatOpen(true)}
          className={`flex-1 py-2.5 rounded-2xl font-bebas tracking-wider text-sm ${
            chatEnabled
              ? 'bg-white border-2 border-slate-200 text-slate-700'
              : 'bg-slate-100 border-2 border-slate-200 text-slate-300 cursor-not-allowed'
          }`}
        >
          {chatEnabled ? '💬 RESENHA' : '💬 RESENHA (desativada)'}
        </button>
        {isOwner && (
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex-1 py-2.5 rounded-2xl font-bebas tracking-wider text-sm bg-blue-900 text-yellow-400"
          >
            ⚙️ CONFIGURAR
          </button>
        )}
      </div>

      {/* Modal Chat */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
          onClick={() => setChatOpen(false)}>
          <div className="bg-white w-full max-w-[390px] rounded-t-3xl flex flex-col"
            style={{ height: '75vh' }}
            onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-2 flex-shrink-0" />
            <div className="flex justify-between items-center px-4 py-2 border-b border-slate-100 flex-shrink-0">
              <p className="font-bebas text-xl tracking-wider">💬 RESENHA</p>
              <button onClick={() => setChatOpen(false)} className="text-slate-400 text-2xl">×</button>
            </div>
            <div className="flex-1 overflow-hidden px-4 pb-4 pt-2">
              <GroupChat
                groupId={groupId}
                currentUserId={userId}
                chatEnabled={chatEnabled}
                filterEnabled={filterEnabled}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Settings */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
          onClick={() => setSettingsOpen(false)}>
          <div className="bg-white w-full max-w-[390px] rounded-t-3xl overflow-y-auto"
            style={{ maxHeight: '85vh' }}
            onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-2" />
            <div className="flex justify-between items-center px-4 py-2 border-b border-slate-100">
              <p className="font-bebas text-xl tracking-wider">⚙️ CONFIGURAR</p>
              <button onClick={() => setSettingsOpen(false)} className="text-slate-400 text-2xl">×</button>
            </div>
            <div className="p-4 space-y-4">
              {/* Toggle Resenha */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800 text-sm">💬 Resenha do Grupo</p>
                  <p className="text-xs text-slate-400">{chatEnabled ? 'Ativada' : 'Desativada'}</p>
                </div>
                <button
                  onClick={() => toggleChat(!chatEnabled)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${chatEnabled ? 'bg-green-500' : 'bg-slate-300'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${chatEnabled ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Toggle Filtro */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800 text-sm">🚫 Filtro de Palavras</p>
                  <p className="text-xs text-slate-400">{filterEnabled ? 'Ativado' : 'Desativado'}</p>
                </div>
                <button
                  onClick={() => toggleFilter(!filterEnabled)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${filterEnabled ? 'bg-green-500' : 'bg-slate-300'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${filterEnabled ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Filtro de jogos */}
              <GroupFilterConfig
                groupId={groupId}
                initialTeams={group.filter_teams ?? []}
                initialPhases={group.filter_phases ?? []}
                locked={group.filter_locked ?? false}
                allTeams={allTeams}
                onSaved={() => setSettingsOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
