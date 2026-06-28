"use client"
import { useState } from 'react'
import GroupChat from './GroupChat'
import GroupFilterConfig from './GroupFilterConfig'
import { supabase } from '@/lib/supabase/client'
import { Group } from '@/types/database'
import { useUnreadCount } from '@/hooks/useUnreadCount'
import { saveScoringStartDate } from '@/app/(app)/group/[id]/actions'
import { useRouter } from 'next/navigation'
import { renameGroup, deleteGroup } from '@/app/(app)/group/[id]/actions'

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
  const [scoringJourney, setScoringJourney] = useState(group?.scoring_journey ?? false)

  const [scoringGroupsFilter, setScoringGroupsFilter] = useState<string[]>(group?.scoring_groups_filter ?? [])
  const [scoringJourneyFilter, setScoringJourneyFilter] = useState<string[]>(group?.scoring_journey_filter ?? [])
  const [scoringStartDate, setScoringStartDate] = useState<string | null>(group?.scoring_start_date ?? null)
  const [savingDate, setSavingDate] = useState(false)
  const [dateError, setDateError] = useState<string | null>(null)

  const router = useRouter()
  const [editingName, setEditingName] = useState(false)
  const [displayedName, setDisplayedName] = useState(group.name)
  const [groupNameInput, setGroupNameInput] = useState(group.name)
  const [savingName, setSavingName] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

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
    field: 'scoring_bets' | 'scoring_groups' | 'scoring_journey',
    value: boolean
  ) => {
    const setters = {
      scoring_bets: setScoringBets,
      scoring_groups: setScoringGroups,
      scoring_journey: setScoringJourney,
    }
    setters[field](value)
    await supabase.from('groups').update({ [field]: value }).eq('id', String(groupId))
  }

  const handleSetStartDate = async (value: string | null) => {
    setDateError(null)
    setSavingDate(true)
    try {
      await saveScoringStartDate(groupId, value)
      setScoringStartDate(value)
    } catch (err) {
      setDateError(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setSavingDate(false)
    }
  }

  const handleSaveName = async () => {
    setNameError(null)
    const trimmed = groupNameInput.trim()
    if (!trimmed) {
      setNameError('Digite um nome.')
      return
    }
    setSavingName(true)
    try {
      await renameGroup(groupId, trimmed)
      setDisplayedName(trimmed)
      setEditingName(false)
      router.refresh()
    } catch (err) {
      setNameError(err instanceof Error ? err.message : 'Erro ao renomear.')
    } finally {
      setSavingName(false)
    }
  }

  const handleDeleteGroup = async () => {
    setDeleteError(null)
    if (deleteConfirmText.trim() !== displayedName) {
      setDeleteError('O nome digitado não corresponde ao nome do grupo.')
      return
    }
    setDeleting(true)
    try {
      await deleteGroup(groupId)
      router.push('/groups')
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Erro ao excluir.')
      setDeleting(false)
    }
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
              {/* Nome do grupo */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <p className="font-bold text-slate-800 text-sm mb-2">✏️ Nome do Grupo</p>
                {editingName ? (
                  <>
                    <input
                      value={groupNameInput}
                      onChange={e => setGroupNameInput(e.target.value)}
                      maxLength={30}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-500 mb-2"
                    />
                    {nameError && <p className="text-xs text-red-500 mb-2">{nameError}</p>}
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingName(false); setGroupNameInput(displayedName); setNameError(null) }}
                        disabled={savingName}
                        className="flex-1 bg-slate-100 text-slate-600 font-bebas tracking-wider rounded-xl py-2 text-sm disabled:opacity-50"
                      >
                        CANCELAR
                      </button>
                      <button
                        onClick={handleSaveName}
                        disabled={savingName}
                        className="flex-1 bg-green-500 text-white font-bebas tracking-wider rounded-xl py-2 text-sm disabled:opacity-50"
                      >
                        {savingName ? 'SALVANDO...' : 'SALVAR'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center">
                    <p className="text-slate-600 text-sm">{displayedName}</p>
                    <button
                      onClick={() => { setEditingName(true); setGroupNameInput(displayedName) }}
                      className="bg-slate-100 text-slate-600 font-bebas tracking-wider rounded-xl px-3 py-1.5 text-xs"
                    >
                      EDITAR
                    </button>
                  </div>
                )}
              </div>
              {/* Toggle Resenha */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800 text-sm">💬 Resenha do Grupo</p>
                  <p className="text-xs text-slate-400">{chatEnabled ? 'Ativada' : 'Desativada'}</p>
                </div>
                <button onClick={() => toggleChat(!chatEnabled)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${chatEnabled ? 'bg-green-500' : 'bg-slate-300'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${chatEnabled ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Toggle Filtro de Palavras */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800 text-sm">🚫 Filtro de Palavras</p>
                  <p className="text-xs text-slate-400">{filterEnabled ? 'Ativado' : 'Desativado'}</p>
                </div>
                <button onClick={() => toggleFilter(!filterEnabled)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${filterEnabled ? 'bg-green-500' : 'bg-slate-300'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${filterEnabled ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Separador */}
              <p className="font-bebas text-sm tracking-widest text-slate-500 uppercase px-1 mt-6">
                🏆 Modalidades que pontuam no grupo
              </p>

              {/* Data de início da pontuação */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <p className="font-bold text-slate-800 text-sm mb-1">📅 A partir de quando pontua</p>
                <p className="text-xs text-slate-400 mb-3">
                  {scoringStartDate
                    ? `Conta jogos/fases a partir de ${new Date(scoringStartDate).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`
                    : 'Conta desde a criação do grupo'}
                </p>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => handleSetStartDate(null)}
                    disabled={savingDate}
                    className={`flex-1 py-2 rounded-xl text-xs font-bebas tracking-wider disabled:opacity-50 ${
                      !scoringStartDate ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    DESDE A CRIAÇÃO
                  </button>
                  <button
                    onClick={() => {
                      const input = document.getElementById(`scoring-date-input-${groupId}`) as HTMLInputElement | null
                      if (input?.showPicker) {
                        input.showPicker()
                      } else {
                        input?.focus()
                      }
                    }}
                    disabled={savingDate}
                    className={`flex-1 py-2 rounded-xl text-xs font-bebas tracking-wider disabled:opacity-50 ${
                      scoringStartDate ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    A PARTIR DE DATA
                  </button>
                </div>
                <input
                  id={`scoring-date-input-${groupId}`}
                  type="datetime-local"
                  min={new Date().toISOString().slice(0, 16)}
                  defaultValue={scoringStartDate ? new Date(scoringStartDate).toISOString().slice(0, 16) : ''}
                  onChange={e => {
                    if (!e.target.value) return
                    const iso = new Date(e.target.value).toISOString()
                    handleSetStartDate(iso)
                  }}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
                {dateError && <p className="text-xs text-red-500 mt-2">{dateError}</p>}
              </div>

              {/* 1. Palpites de Partidas */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">⚽ Palpites de Partidas</p>
                    <p className="text-xs text-slate-400">Placares dos jogos individuais</p>
                  </div>
                  <button onClick={() => handleToggleScoring('scoring_bets', !scoringBets)}
                    className={`w-12 h-6 rounded-full relative transition-colors ${scoringBets ? 'bg-green-500' : 'bg-slate-300'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${scoringBets ? 'left-6' : 'left-0.5'}`} />
                  </button>
                </div>
                {scoringBets && (
                  <div className="border-t border-slate-100 px-4 pb-4 pt-3">
                    <GroupFilterConfig
                      groupId={groupId}
                      initialTeams={group.filter_teams ?? []}
                      initialPhases={group.filter_phases ?? []}
                      locked={group.filter_locked ?? false}
                      allTeams={allTeams ?? []}
                      onSaved={() => {}}
                    />
                  </div>
                )}
              </div>

              {/* 2. Classificação dos Grupos */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">📊 Classificação dos Grupos</p>
                    <p className="text-xs text-slate-400">
                      {scoringGroupsFilter.length === 0 ? 'Todos os grupos' : `${scoringGroupsFilter.length} grupo(s)`}
                    </p>
                  </div>
                  <button onClick={() => handleToggleScoring('scoring_groups', !scoringGroups)}
                    className={`w-12 h-6 rounded-full relative transition-colors ${scoringGroups ? 'bg-green-500' : 'bg-slate-300'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${scoringGroups ? 'left-6' : 'left-0.5'}`} />
                  </button>
                </div>
                {scoringGroups && (
                  <div className="border-t border-slate-100 px-4 pb-4 pt-3">
                    <p className="text-xs text-slate-500 mb-2 font-medium">Quais grupos contam:</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {['A','B','C','D','E','F','G','H','I','J','K','L'].map(g => {
                        const groupName = `Grupo ${g}`
                        const active = scoringGroupsFilter.length === 0 || scoringGroupsFilter.includes(groupName)
                        return (
                          <button key={g} onClick={() => toggleGroupFilter(groupName)}
                            className={`py-2 rounded-xl text-xs font-bebas tracking-wider transition-colors ${
                              active ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'
                            }`}>
                            GRP {g}
                          </button>
                        )
                      })}
                    </div>
                    {scoringGroupsFilter.length > 0 && (
                      <button onClick={() => { setScoringGroupsFilter([]); supabase.from('groups').update({ scoring_groups_filter: [] }).eq('id', String(groupId)) }}
                        className="w-full mt-2 py-1.5 rounded-xl text-[10px] font-bold bg-slate-100 text-slate-500">
                        TODOS OS GRUPOS
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* 4. Até onde vai */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">🗺️ Até onde vai</p>
                    <p className="text-xs text-slate-400">
                      {scoringJourneyFilter.length === 0 ? 'Todas as seleções' : `${scoringJourneyFilter.length} seleção(ões)`}
                    </p>
                  </div>
                  <button onClick={() => handleToggleScoring('scoring_journey', !scoringJourney)}
                    className={`w-12 h-6 rounded-full relative transition-colors ${scoringJourney ? 'bg-green-500' : 'bg-slate-300'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${scoringJourney ? 'left-6' : 'left-0.5'}`} />
                  </button>
                </div>
                {scoringJourney && (
                  <div className="border-t border-slate-100 px-4 pb-4 pt-3">
                    <p className="text-xs text-slate-500 mb-2 font-medium">Quais seleções contam:</p>
                    <input
                      type="text"
                      placeholder="Buscar seleção..."
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-green-500 mb-2"
                      onChange={e => {
                        const val = e.target.value.toLowerCase()
                        document.querySelectorAll<HTMLElement>('[data-team-btn]').forEach(el => {
                          el.style.display = el.dataset.team?.toLowerCase().includes(val) ? '' : 'none'
                        })
                      }}
                    />
                    <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
                      {allTeams?.map(team => (
                        <button
                          key={team}
                          data-team-btn
                          data-team={team}
                          onClick={() => toggleJourneyFilter(team)}
                          className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-colors text-left truncate ${
                            scoringJourneyFilter.length === 0 || scoringJourneyFilter.includes(team)
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {team}
                        </button>
                      ))}
                    </div>
                    {scoringJourneyFilter.length > 0 && (
                    <div className="mt-3 flex justify-end">
                      <button onClick={() => { setScoringJourneyFilter([]); supabase.from('groups').update({ scoring_journey_filter: [] }).eq('id', String(groupId)) }}
                        className="text-[10px] font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full uppercase"
                      >
                        Limpar Seleções
                      </button>
                    </div>
                  )}
                </div>
                )}
              </div>



              {/* Zona de perigo */}
              <div className="bg-red-50 rounded-2xl border border-red-200 p-4 mt-6">
                <p className="font-bold text-red-700 text-sm mb-1">🗑️ Excluir Grupo</p>
                <p className="text-xs text-red-500 mb-3">Essa ação é permanente e remove todos os membros, mensagens e configurações do grupo.</p>
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="w-full bg-red-500 text-white font-bebas tracking-wider rounded-xl py-2.5 text-sm"
                >
                  EXCLUIR GRUPO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-end justify-center"
          onClick={() => !deleting && setDeleteModalOpen(false)}>
          <div className="bg-white w-full max-w-[390px] rounded-t-3xl p-5 space-y-4"
            style={{ paddingBottom: '100px' }}
            onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto" />
            <p className="font-bebas text-2xl tracking-wider text-red-600">🗑️ EXCLUIR GRUPO</p>
            <p className="text-sm text-slate-600">
              Esta ação não pode ser desfeita. Para confirmar, digite o nome do grupo: <span className="font-bold">{displayedName}</span>
            </p>
            <input
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder="Digite o nome do grupo"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-red-500"
            />
            {deleteError && <p className="text-red-500 text-sm">{deleteError}</p>}
            <div className="flex gap-2 pb-4">
              <button
                onClick={() => { setDeleteModalOpen(false); setDeleteConfirmText(''); setDeleteError(null) }}
                disabled={deleting}
                className="flex-1 bg-slate-100 text-slate-600 font-bebas tracking-wider rounded-xl py-3 disabled:opacity-50"
              >
                CANCELAR
              </button>
              <button
                onClick={handleDeleteGroup}
                disabled={deleting || deleteConfirmText.trim() !== displayedName}
                className="flex-1 bg-red-500 text-white font-bebas tracking-wider rounded-xl py-3 disabled:opacity-50"
              >
                {deleting ? 'EXCLUINDO...' : 'EXCLUIR PERMANENTEMENTE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
