"use client"
import { useState } from 'react'
import GroupChat from './GroupChat'
import GroupFilterConfig from './GroupFilterConfig'
import { supabase } from '@/lib/supabase/client'
import { Group } from '@/types/database'
import { useUnreadCount } from '@/hooks/useUnreadCount'

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
  
  const [scoringBets, setScoringBets] = useState(group?.scoring_bets ?? true)
  const [scoringGroups, setScoringGroups] = useState(group?.scoring_groups ?? false)
  const [scoringBracket, setScoringBracket] = useState(group?.scoring_bracket ?? false)
  const [scoringJourney, setScoringJourney] = useState(group?.scoring_journey ?? false)

  const [scoringGroupsFilter, setScoringGroupsFilter] = useState<string[]>(group?.scoring_groups_filter ?? [])
  const [scoringJourneyFilter, setScoringJourneyFilter] = useState<string[]>(group?.scoring_journey_filter ?? [])
  const [showGroupsFilter, setShowGroupsFilter] = useState(false)
  const [showJourneyFilter, setShowJourneyFilter] = useState(false)

  const COPA_GROUP_NAMES = ['Grupo A', 'Grupo B', 'Grupo C', 'Grupo D', 'Grupo E', 'Grupo F',
    'Grupo G', 'Grupo H', 'Grupo I', 'Grupo J', 'Grupo K', 'Grupo L']

  const toggleGroupFilter = async (groupName: string) => {
    const updated = scoringGroupsFilter.includes(groupName)
      ? scoringGroupsFilter.filter(g => g !== groupName)
      : [...scoringGroupsFilter, groupName]
    setScoringGroupsFilter(updated)
    await supabase.from('groups').update({ scoring_groups_filter: updated }).eq('id', String(groupId))
  }

  const toggleJourneyFilter = async (team: string) => {
    const updated = scoringJourneyFilter.includes(team)
      ? scoringJourneyFilter.filter(t => t !== team)
      : [...scoringJourneyFilter, team]
    setScoringJourneyFilter(updated)
    await supabase.from('groups').update({ scoring_journey_filter: updated }).eq('id', String(groupId))
  }

  const { unreadCount, markAsRead } = useUnreadCount(groupId, userId)

  const handleToggleScoring = async (
    field: 'scoring_bets' | 'scoring_groups' | 'scoring_bracket' | 'scoring_journey',
    value: boolean
  ) => {
    const setters = {
      scoring_bets: setScoringBets,
      scoring_groups: setScoringGroups,
      scoring_bracket: setScoringBracket,
      scoring_journey: setScoringJourney,
    }
    setters[field](value)
    await supabase.from('groups').update({ [field]: value }).eq('id', String(groupId))
  }

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
          onClick={() => {
            if (!chatEnabled) return
            markAsRead()
            setChatOpen(true)
          }}
          className={`flex-1 py-2.5 rounded-2xl font-bebas tracking-wider text-sm relative ${
            chatEnabled
              ? 'bg-white border-2 border-slate-200 text-slate-700'
              : 'bg-slate-100 border-2 border-slate-200 text-slate-300 cursor-not-allowed'
          }`}
        >
          {chatEnabled ? '💬 RESENHA' : '💬 RESENHA (desativada)'}

          {/* Badge de notificação */}
          {chatEnabled && unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
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
        <div className="fixed inset-0 z-50 bg-black/60"
          onClick={() => setChatOpen(false)}>
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white w-full max-w-[390px] rounded-t-3xl flex flex-col absolute left-1/2 -translate-x-1/2"
            style={{
              bottom: '80px',
              top: '60px'
            }}>
            {/* Handle */}
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-2 flex-shrink-0" />
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-2 border-b border-slate-100 flex-shrink-0">
              <p className="font-bebas text-xl tracking-wider">💬 RESENHA</p>
              <button onClick={() => setChatOpen(false)} className="text-slate-400 text-2xl">×</button>
            </div>
            {/* Chat */}
            <div className="flex-1 px-4 pb-4 pt-2" style={{ minHeight: 0 }}>
              <GroupChat
                groupId={groupId}
                currentUserId={userId}
                chatEnabled={chatEnabled}
                filterEnabled={filterEnabled}
                onMount={markAsRead}
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
            style={{ maxHeight: 'calc(100vh - 80px)', paddingBottom: '100px' }}
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

              {/* Modalidades */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <p className="font-bold text-slate-800 text-sm mb-3">🏆 Modalidades que pontuam</p>
                <p className="text-xs text-slate-400 mb-3">Escolha quais palpites contam no ranking deste grupo</p>

                {/* Palpites de Partidas */}
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <div>
                    <p className="text-sm font-medium text-slate-700">⚽ Palpites de Partidas</p>
                    <p className="text-xs text-slate-400">Placares dos jogos</p>
                  </div>
                  <button
                    onClick={() => handleToggleScoring('scoring_bets', !scoringBets)}
                    className={`w-12 h-6 rounded-full relative transition-colors flex-shrink-0 ml-3 ${
                      scoringBets ? 'bg-green-500' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                      scoringBets ? 'left-6' : 'left-0.5'
                    }`} />
                  </button>
                </div>

                {/* Classificação dos Grupos */}
                <div className="py-2 border-b border-slate-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-slate-700">📊 Classificação dos Grupos</p>
                      <p className="text-xs text-slate-400">
                        {scoringGroupsFilter.length === 0
                          ? 'Todos os grupos'
                          : `${scoringGroupsFilter.length} grupo(s) selecionado(s)`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {scoringGroups && (
                        <button
                          onClick={() => setShowGroupsFilter(!showGroupsFilter)}
                          className="text-[10px] text-blue-600 font-bold px-2 py-1 bg-blue-50 rounded-lg"
                        >
                          {showGroupsFilter ? 'FECHAR' : 'FILTRAR'}
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleScoring('scoring_groups', !scoringGroups)}
                        className={`w-12 h-6 rounded-full relative transition-colors flex-shrink-0 ${
                          scoringGroups ? 'bg-green-500' : 'bg-slate-300'
                        }`}
                      >
                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                          scoringGroups ? 'left-6' : 'left-0.5'
                        }`} />
                      </button>
                    </div>
                  </div>

                  {scoringGroups && showGroupsFilter && (
                    <div className="mt-3 grid grid-cols-3 gap-1.5">
                      {COPA_GROUP_NAMES.map(g => (
                        <button
                          key={g}
                          onClick={() => toggleGroupFilter(g)}
                          className={`py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                            scoringGroupsFilter.length === 0 || scoringGroupsFilter.includes(g)
                              ? 'bg-green-500 text-white'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {g.replace('Grupo ', 'GRP ')}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setScoringGroupsFilter([])
                          supabase.from('groups').update({ scoring_groups_filter: [] }).eq('id', String(groupId))
                        }}
                        className="col-span-3 py-1.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-500 mt-1"
                      >
                        TODOS OS GRUPOS
                      </button>
                    </div>
                  )}
                </div>

                {/* Bracket Mata-Mata */}
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <div>
                    <p className="text-sm font-medium text-slate-700">⚔️ Bracket Mata-Mata</p>
                    <p className="text-xs text-slate-400">Fase de 32 até a Final</p>
                  </div>
                  <button
                    onClick={() => handleToggleScoring('scoring_bracket', !scoringBracket)}
                    className={`w-12 h-6 rounded-full relative transition-colors flex-shrink-0 ml-3 ${
                      scoringBracket ? 'bg-green-500' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                      scoringBracket ? 'left-6' : 'left-0.5'
                    }`} />
                  </button>
                </div>

                {/* Até onde vai */}
                <div className="py-2 border-b border-slate-50 last:border-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-slate-700">🗺️ Até onde vai</p>
                      <p className="text-xs text-slate-400">
                        {scoringJourneyFilter.length === 0
                          ? 'Todas as seleções'
                          : `${scoringJourneyFilter.length} seleção(ões)`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {scoringJourney && (
                        <button
                          onClick={() => setShowJourneyFilter(!showJourneyFilter)}
                          className="text-[10px] text-blue-600 font-bold px-2 py-1 bg-blue-50 rounded-lg"
                        >
                          {showJourneyFilter ? 'FECHAR' : 'FILTRAR'}
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleScoring('scoring_journey', !scoringJourney)}
                        className={`w-12 h-6 rounded-full relative transition-colors flex-shrink-0 ${
                          scoringJourney ? 'bg-green-500' : 'bg-slate-300'
                        }`}
                      >
                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                          scoringJourney ? 'left-6' : 'left-0.5'
                        }`} />
                      </button>
                    </div>
                  </div>

                  {scoringJourney && showJourneyFilter && (
                    <div className="mt-3">
                      <input
                        type="text"
                        placeholder="Buscar seleção..."
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-green-500 mb-2"
                        onChange={e => {
                          const val = e.target.value.toLowerCase()
                          const filtered = document.querySelectorAll('[data-team-btn]')
                          filtered.forEach((el) => {
                            const htmlEl = el as HTMLElement
                            htmlEl.style.display = htmlEl.dataset.team?.toLowerCase().includes(val) ? '' : 'none'
                          })
                        }}
                      />
                      <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
                        {allTeams?.map(team => (
                          <button
                            key={team}
                            data-team-btn
                            data-team={team}
                            onClick={() => toggleJourneyFilter(team)}
                            className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-colors text-left flex items-center gap-1 ${
                              scoringJourneyFilter.length === 0 || scoringJourneyFilter.includes(team)
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            <span className="truncate">{team}</span>
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          setScoringJourneyFilter([])
                          supabase.from('groups').update({ scoring_journey_filter: [] }).eq('id', String(groupId))
                        }}
                        className="w-full mt-2 py-1.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-500"
                      >
                        TODAS AS SELEÇÕES
                      </button>
                    </div>
                  )}
                </div>
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
