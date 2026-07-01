"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client'
import { sumLivePointsByUser, LiveGame, LiveBet } from '@/lib/scoring'
import clsx from "clsx";
import RankingShareCard from '@/components/share/RankingShareCard'
import TeamFlag from '@/components/ui/TeamFlag'

export interface RankingMember {
  user_id: string;
  points_total: number;
  live_points_total?: number;
  users: {
    username: string;
    avatar_url: string | null;
  } | null;
}

export interface DetailedMember {
  user_id: string;
  users: { username: string; avatar_url: string | null } | null;
  points_total: number;
  points_bets: number;
  points_groups: number;
  points_journey: number;
  group_predictions: {
    group_name: string;
    position: number;
    predicted_team: string;
    points_earned: number | null;
  }[];
  journey_predictions: {
    team: string;
    predicted_phase: string;
    points_earned: number | null;
  }[];
}

interface GroupStanding {
  group_name: string;
  position: number;
  team: string;
}

export type RankingTab = 'geral' | 'partidas' | 'grupos' | 'jornada'

interface RankingListProps {
  activeTab?: RankingTab
  onTabChange?: (tab: RankingTab) => void
  members: RankingMember[];
  detailedMembers?: DetailedMember[];
  groupStandings?: GroupStanding[];
  filterTeams?: string[];
  filterPhases?: string[];
  group?: import('@/types/database').Database["public"]["Tables"]["groups"]["Row"];
  groupName?: string;
  groupId?: number;
  initialLiveGames?: LiveGame[];
  initialLiveBets?: LiveBet[];
}

const PHASE_LABELS: Record<string, string> = {
  group_stage: 'Fase de Grupos',
  phase_of_32: 'Fase de 32',
  round_of_16: 'Oitavas',
  quarter_final: 'Quartas',
  semi_final: 'Semifinal',
  third_place: '3º Lugar',
  runner_up: 'Vice',
  champion: 'Campeão',
}

const POSITION_LABELS = ['1º', '2º', '3º', '4º']

export default function RankingList({
  members, detailedMembers = [], groupStandings = [],
  filterTeams = [], filterPhases = [], group, groupName, groupId,
  initialLiveGames = [], initialLiveBets = [],
  activeTab: externalActiveTab, onTabChange
}: RankingListProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<RankingTab>('geral')
  const activeTab = externalActiveTab ?? internalActiveTab
  const setActiveTab = (tab: RankingTab) => {
    setInternalActiveTab(tab)
    onTabChange?.(tab)
  }
  const [showFilters, setShowFilters] = useState(false);
  const [liveGames, setLiveGames] = useState<LiveGame[]>(initialLiveGames)
  const [liveBets] = useState<LiveBet[]>(initialLiveBets)
  const [detailModal, setDetailModal] = useState<{ member: DetailedMember; tab: RankingTab } | null>(null)

  useEffect(() => {
    if (!groupId) return
    const channel = supabase
      .channel(`group-live-ranking-${groupId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games' }, (payload) => {
        const updated = payload.new as { id: string; status: string; home_score: number | null; away_score: number | null }
        setLiveGames(prev => {
          if (updated.status !== 'live') return prev.filter(g => g.id !== updated.id)
          const exists = prev.some(g => g.id === updated.id)
          if (exists) return prev.map(g => g.id === updated.id ? { ...g, ...updated } : g)
          return prev
        })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [groupId])

  const livePointsByUser = sumLivePointsByUser(liveGames, liveBets)
  const hasLiveGame = liveGames.length > 0

  const liveBetsByUser: Record<string, { home_team: string | null; away_team: string | null; home_bet: number; away_bet: number; home_score: number | null; away_score: number | null }[]> = {}
  for (const bet of liveBets) {
    const game = liveGames.find(g => String(g.id) === String(bet.game_id))
    if (!game) continue
    if (!liveBetsByUser[bet.user_id]) liveBetsByUser[bet.user_id] = []
    liveBetsByUser[bet.user_id].push({
      home_team: game.home_team ?? null, away_team: game.away_team ?? null,
      home_bet: bet.home_bet, away_bet: bet.away_bet,
      home_score: game.home_score, away_score: game.away_score,
    })
  }

  const sortedGeral = [...members]
    .map(m => ({ ...m, live_points_total: m.points_total + (livePointsByUser[m.user_id] ?? 0) }))
    .sort((a, b) => {
      const aTotal = hasLiveGame ? a.live_points_total : a.points_total
      const bTotal = hasLiveGame ? b.live_points_total : b.points_total
      if (bTotal !== aTotal) return bTotal - aTotal
      return (a.users?.username ?? '').localeCompare(b.users?.username ?? '')
    })

  const sortedBets = [...detailedMembers].sort((a, b) => b.points_bets - a.points_bets)
  const sortedGroups = [...detailedMembers].sort((a, b) => b.points_groups - a.points_groups)
  const sortedJourney = [...detailedMembers].sort((a, b) => b.points_journey - a.points_journey)

  const hasFilter = filterTeams.length > 0 || filterPhases.length > 0

  const tabs: { id: RankingTab; label: string }[] = [
    { id: 'geral', label: '🏆 GERAL' },
    { id: 'partidas', label: '⚽ PARTIDAS' },
    { id: 'grupos', label: '📊 GRUPOS' },
    { id: 'jornada', label: '🗺️ JORNADA' },
  ]

  const renderMemberCard = (
    userId: string,
    username: string,
    avatarUrl: string | null,
    points: number,
    index: number,
    tab: RankingTab,
    pointsLabel?: string
  ) => {
    const isTop1 = index === 0
    const isTop2 = index === 1
    const isTop3 = index === 2
    const detailed = detailedMembers.find(m => m.user_id === userId)
    const isLiveGeral = tab === 'geral' && hasLiveGame && (livePointsByUser[userId] ?? 0) !== 0

    const handleClick = () => {
      if (tab === 'geral') {
        setDetailModal({ member: detailed ?? {
          user_id: userId,
          users: { username, avatar_url: avatarUrl },
          points_total: points,
          points_bets: detailed?.points_bets ?? 0,
          points_groups: detailed?.points_groups ?? 0,
          points_journey: detailed?.points_journey ?? 0,
          group_predictions: [],
          journey_predictions: [],
        }, tab: 'geral' })
      } else if (tab === 'partidas') {
        window.location.href = `/palpites/usuario/${userId}?groupId=${groupId ?? ''}&groupName=${encodeURIComponent(groupName ?? '')}`
      } else if (detailed) {
        setDetailModal({ member: detailed, tab })
      }
    }

    return (
      <div key={userId}>
        <div
          className={clsx(
            "flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border cursor-pointer active:scale-95 transition-transform",
            isTop1 ? "border-yellow-400 bg-yellow-50/30" : "border-slate-100"
          )}
          onClick={handleClick}
        >
          <div className="w-8 flex justify-center items-center">
            {isTop1 ? <span className="text-2xl">👑</span>
              : isTop2 ? <span className="text-2xl">🥈</span>
              : isTop3 ? <span className="text-2xl">🥉</span>
              : <span className="font-bebas text-2xl text-slate-300">{index + 1}</span>}
          </div>
          <div className="w-10 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarUrl ?? '/avatars/vini-jr.png'} alt={username} className="w-full aspect-[3/4] object-cover" />
          </div>
          <div className="flex-1 flex flex-col">
            <span className={clsx("font-bold text-sm", isTop1 ? "text-yellow-900" : "text-slate-800")}>{username}</span>
            {tab !== 'geral' && detailed && (
              <span className="text-[10px] text-slate-400">Total geral: {detailed.points_total} pts</span>
            )}
          </div>
          <div className="flex flex-col items-end pr-2">
            <span className={clsx("font-bebas text-3xl leading-none", isLiveGeral ? "text-red-500" : "text-green-600")}>
              {tab === 'geral' && hasLiveGame
                ? points + (livePointsByUser[userId] ?? 0)
                : points}
            </span>
            <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">
              {pointsLabel ?? (isLiveGeral ? 'Pontos (ao vivo)' : 'Pontos')}
            </span>
          </div>
        </div>

        {tab === 'geral' && (liveBetsByUser[userId]?.length ?? 0) > 0 && (
          <div className="mt-1.5 flex flex-col gap-1">
            {liveBetsByUser[userId].map((bet, i) => (
              <div key={i} className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-3 py-1.5">
                <span className="flex items-center gap-1 text-[10px] font-bold text-red-600">
                  <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                  AO VIVO
                </span>
                <span className="text-[11px] text-slate-600 truncate flex-1 px-2">
                  {bet.home_team} {bet.home_score ?? 0}×{bet.away_score ?? 0} {bet.away_team}
                </span>
                <span className="text-[11px] font-bold text-slate-800">Palpite: {bet.home_bet}×{bet.away_bet}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="px-4 pt-6">
      <h2 className="font-bebas text-2xl tracking-widest text-slate-800 mb-4 flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          Ranking
          {hasLiveGame && (
            <span className="flex items-center gap-1 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              AO VIVO
            </span>
          )}
        </span>
        <span className="text-[10px] font-sans font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
          {members.length} MEMBROS
        </span>
      </h2>

      {activeTab === 'geral' && (
        <RankingShareCard
          members={sortedGeral.map(m => ({
            user_id: m.user_id,
            username: m.users?.username ?? 'Usuário',
            avatar_url: m.users?.avatar_url ?? null,
            points_total: m.points_total
          }))}
          groupName={groupName}
          cardId="ranking"
          label="RANKING"
          hideButton
        />
      )}
      {activeTab === 'partidas' && (
        <RankingShareCard
          members={sortedBets.map(m => ({
            user_id: m.user_id,
            username: (m.users as { username: string; avatar_url: string | null } | null)?.username ?? 'Usuário',
            avatar_url: (m.users as { username: string; avatar_url: string | null } | null)?.avatar_url ?? null,
            points_total: m.points_bets
          }))}
          groupName={groupName}
          cardId="partidas"
          label="PARTIDAS"
          hideButton
        />
      )}
      {activeTab === 'grupos' && (
        <RankingShareCard
          members={sortedGroups.map(m => ({
            user_id: m.user_id,
            username: (m.users as { username: string; avatar_url: string | null } | null)?.username ?? 'Usuário',
            avatar_url: (m.users as { username: string; avatar_url: string | null } | null)?.avatar_url ?? null,
            points_total: m.points_groups
          }))}
          groupName={groupName}
          cardId="grupos"
          label="GRUPOS"
          hideButton
        />
      )}
      {activeTab === 'jornada' && (
        <RankingShareCard
          members={sortedJourney.map(m => ({
            user_id: m.user_id,
            username: (m.users as { username: string; avatar_url: string | null } | null)?.username ?? 'Usuário',
            avatar_url: (m.users as { username: string; avatar_url: string | null } | null)?.avatar_url ?? null,
            points_total: m.points_journey
          }))}
          groupName={groupName}
          cardId="jornada"
          label="JORNADA"
          hideButton
        />
      )}

      {/* Abas */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-3 py-2 rounded-xl font-bebas text-xs tracking-wider transition-colors ${
              activeTab === tab.id ? 'bg-blue-900 text-yellow-400' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {hasFilter && group && activeTab === 'geral' && (
        <div className="mb-3">
          <button onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-blue-50 rounded-xl p-3 flex justify-between items-center">
            <p className="text-blue-700 text-xs font-bold">🎯 Pontuação filtrada — toque para ver detalhes</p>
            <span className="text-blue-500 text-sm">{showFilters ? '▲' : '▼'}</span>
          </button>
          {showFilters && (
            <div className="bg-blue-50 rounded-b-xl px-4 pb-3 space-y-2 -mt-1 border-t border-blue-100">
              {group.scoring_bets && (
                <div>
                  <p className="text-blue-700 text-[10px] font-bold mt-2">⚽ PARTIDAS</p>
                  <p className="text-blue-500 text-[10px]">
                    {(group.filter_teams?.length ?? 0) === 0 && (group.filter_phases?.length ?? 0) === 0
                      ? 'Todos os jogos'
                      : [(group.filter_teams?.length ? [`Times: ${group.filter_teams.join(', ')}`] : []), (group.filter_phases?.length ? [`Fases: ${group.filter_phases.join(', ')}`] : [])].flat().join(' • ')}
                  </p>
                </div>
              )}
              {group.scoring_groups && <div><p className="text-blue-700 text-[10px] font-bold">📊 CLASSIFICAÇÃO DOS GRUPOS</p><p className="text-blue-500 text-[10px]">{(group.scoring_groups_filter?.length ?? 0) === 0 ? 'Todos os grupos' : group.scoring_groups_filter!.join(', ')}</p></div>}
              {group.scoring_journey && <div><p className="text-blue-700 text-[10px] font-bold">🗺️ ATÉ ONDE VAI</p><p className="text-blue-500 text-[10px]">{(group.scoring_journey_filter?.length ?? 0) === 0 ? 'Todas as seleções' : `${group.scoring_journey_filter!.slice(0, 5).join(', ')}${group.scoring_journey_filter!.length > 5 ? ` +${group.scoring_journey_filter!.length - 5}` : ''}`}</p></div>}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {activeTab === 'geral' && sortedGeral.map((member, index) =>
          renderMemberCard(member.user_id, member.users?.username ?? 'Usuário', member.users?.avatar_url ?? null, member.points_total, index, 'geral')
        )}
        {activeTab === 'partidas' && sortedBets.map((member, index) =>
          renderMemberCard(member.user_id, (member.users as { username: string; avatar_url: string | null } | null)?.username ?? 'Usuário', (member.users as { username: string; avatar_url: string | null } | null)?.avatar_url ?? null, member.points_bets, index, 'partidas', 'pts partidas')
        )}
        {activeTab === 'grupos' && sortedGroups.map((member, index) =>
          renderMemberCard(member.user_id, (member.users as { username: string; avatar_url: string | null } | null)?.username ?? 'Usuário', (member.users as { username: string; avatar_url: string | null } | null)?.avatar_url ?? null, member.points_groups, index, 'grupos', 'pts grupos')
        )}
        {activeTab === 'jornada' && sortedJourney.map((member, index) =>
          renderMemberCard(member.user_id, (member.users as { username: string; avatar_url: string | null } | null)?.username ?? 'Usuário', (member.users as { username: string; avatar_url: string | null } | null)?.avatar_url ?? null, member.points_journey, index, 'jornada', 'pts jornada')
        )}
        {((activeTab === 'geral' && sortedGeral.length === 0) || (activeTab !== 'geral' && detailedMembers.length === 0)) && (
          <div className="text-center text-slate-400 py-4 text-sm">Nenhum membro encontrado.</div>
        )}
      </div>

      {/* Modal de detalhamento */}
      {detailModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" onClick={() => setDetailModal(null)}>
          <div className="bg-white w-full max-w-[390px] rounded-t-3xl overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 80px)', paddingBottom: '100px' }}
            onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-2" />
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
              <div className="w-10 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={(detailModal.member.users as { username: string; avatar_url: string | null } | null)?.avatar_url ?? '/avatars/vini-jr.png'} alt="" className="w-full aspect-[3/4] object-cover" />
              </div>
              <div>
                <p className="font-bebas text-lg tracking-wider text-slate-800">
                  {(detailModal.member.users as { username: string; avatar_url: string | null } | null)?.username ?? 'Usuário'}
                </p>
                <p className="text-xs text-slate-500">
                  {detailModal.tab === 'geral' ? `${detailModal.member.points_total} pts no total`
                    : detailModal.tab === 'grupos' ? `${detailModal.member.points_groups} pts em Classificação de Grupos`
                    : `${detailModal.member.points_journey} pts em Jornada das Seleções`}
                </p>
              </div>
            </div>

            <div className="px-4 py-4 space-y-4">
              {detailModal.tab === 'geral' && (
                <div className="space-y-3">
                  {/* Total geral em destaque */}
                  <div className="bg-blue-900 rounded-2xl p-4 text-center">
                    <p className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">Total Geral</p>
                    <p className="font-bebas text-5xl text-yellow-400">{detailModal.member.points_total}</p>
                    <p className="text-blue-300 text-xs mt-1">pontos</p>
                  </div>

                  {/* Breakdown por modalidade */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⚽</span>
                        <span className="font-bold text-slate-800 text-sm">Partidas</span>
                      </div>
                      <span className="font-bebas text-2xl text-green-600">{detailModal.member.points_bets}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📊</span>
                        <span className="font-bold text-slate-800 text-sm">Classificação dos Grupos</span>
                      </div>
                      <span className="font-bebas text-2xl text-green-600">{detailModal.member.points_groups}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🗺️</span>
                        <span className="font-bold text-slate-800 text-sm">Até onde vai</span>
                      </div>
                      <span className="font-bebas text-2xl text-green-600">{detailModal.member.points_journey}</span>
                    </div>
                  </div>
                </div>
              )}

              {detailModal.tab === 'grupos' && (() => {
                const byGroup = detailModal.member.group_predictions.reduce((acc, p) => {
                  if (!acc[p.group_name]) acc[p.group_name] = []
                  acc[p.group_name].push(p)
                  return acc
                }, {} as Record<string, typeof detailModal.member.group_predictions>)

                return Object.entries(byGroup).sort(([a], [b]) => a.localeCompare(b)).map(([groupName, preds]) => {
                  const realStandings = groupStandings.filter(s => s.group_name === groupName).sort((a, b) => a.position - b.position)
                  const totalPts = preds.reduce((s, p) => s + (p.points_earned ?? 0), 0)

                  return (
                    <div key={groupName} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                      <div className="bg-green-500 px-4 py-2 flex justify-between items-center">
                        <h3 className="font-bebas text-base text-white tracking-widest">{groupName}</h3>
                        <span className="font-bebas text-base text-yellow-300">{totalPts} pts</span>
                      </div>
                      <div className="p-3 space-y-2">
                        {[1, 2, 3, 4].map(pos => {
                          const pred = preds.find(p => p.position === pos)
                          const real = realStandings.find(s => s.position === pos)
                          const pts = pred?.points_earned ?? 0
                          const isExact = pts === 5 || pts === 3
                          const isPartial = pts === 1
                          const isMiss = pts === 0 && pred

                          return (
                            <div key={pos} className={`flex items-center gap-2 p-2 rounded-xl border ${
                              isExact ? 'bg-green-50 border-green-200'
                              : isPartial ? 'bg-yellow-50 border-yellow-200'
                              : isMiss ? 'bg-red-50 border-red-100'
                              : 'bg-white border-slate-200'
                            }`}>
                              <span className={`font-bebas text-base w-5 flex-shrink-0 ${pos === 1 ? 'text-yellow-500' : 'text-slate-400'}`}>
                                {POSITION_LABELS[pos - 1]}
                              </span>
                              <div className="flex-1 flex items-center gap-1.5 min-w-0">
                                {pred ? (
                                  <>
                                    <TeamFlag team={pred.predicted_team} size={18} />
                                    <span className="text-xs font-bold text-slate-700 truncate">{pred.predicted_team}</span>
                                  </>
                                ) : <span className="text-xs text-slate-300">—</span>}
                              </div>
                              {real && (
                                <div className="flex items-center gap-1 text-[10px] text-slate-500 flex-shrink-0">
                                  <span>→</span>
                                  <TeamFlag team={real.team} size={16} />
                                  <span className="font-medium">{real.team}</span>
                                </div>
                              )}
                              <span className={`font-bebas text-base w-8 text-right flex-shrink-0 ${pts > 0 ? 'text-green-600' : 'text-slate-300'}`}>
                                {pred ? `+${pts}` : '—'}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })
              })()}

              {detailModal.tab === 'jornada' && (() => {
                const byPhase = detailModal.member.journey_predictions.reduce((acc, p) => {
                  if (!acc[p.predicted_phase]) acc[p.predicted_phase] = []
                  acc[p.predicted_phase].push(p)
                  return acc
                }, {} as Record<string, typeof detailModal.member.journey_predictions>)

                const phaseOrder = ['group_stage', 'phase_of_32', 'round_of_16', 'quarter_final', 'semi_final', 'third_place', 'runner_up', 'champion']

                return phaseOrder.filter(phase => byPhase[phase]?.length).map(phase => {
                  const preds = byPhase[phase]
                  const totalPts = preds.reduce((s, p) => s + (p.points_earned ?? 0), 0)

                  return (
                    <div key={phase} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                      <div className="bg-blue-900 px-4 py-2 flex justify-between items-center">
                        <h3 className="font-bebas text-base text-white tracking-widest">{PHASE_LABELS[phase] ?? phase}</h3>
                        <span className="font-bebas text-base text-yellow-300">{totalPts} pts</span>
                      </div>
                      <div className="p-3 space-y-1.5">
                        {preds.sort((a, b) => (b.points_earned ?? 0) - (a.points_earned ?? 0)).map((p, i) => (
                          <div key={i} className={`flex items-center gap-2 p-2 rounded-xl border ${
                            (p.points_earned ?? 0) > 0 ? 'bg-green-50 border-green-200' : 'bg-white border-slate-100'
                          }`}>
                            <TeamFlag team={p.team} size={20} />
                            <span className="flex-1 text-xs font-bold text-slate-700 truncate">{p.team}</span>
                            <span className={`font-bebas text-base ${(p.points_earned ?? 0) > 0 ? 'text-green-600' : 'text-slate-300'}`}>
                              +{p.points_earned ?? 0}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
