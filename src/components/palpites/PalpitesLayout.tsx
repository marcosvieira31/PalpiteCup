"use client"
import { useState } from 'react'
import PalpitarClient from './PalpitarClient'
import GroupBetsTab from './GroupBetsTab'
import JourneyBetsTab from './JourneyBetsTab'
import Countdown from '@/components/ui/Countdown'
import { DEADLINES } from '@/lib/deadlines'
import { Game, Bet, GroupPrediction, TeamJourneyPrediction } from '@/types/database'

type Tab = 'partidas' | 'grupos' | 'jornada'

interface JokerPick {
  game_id: number
  round_number: number
}

interface Props {
  games: Game[]
  existingBets: Bet[]
  jokerPicks: JokerPick[]
  allTeams: string[]
  groupPredictions: GroupPrediction[]
  journeyPredictions: TeamJourneyPrediction[]
  userId: string
}

export default function PalpitesLayout({
  games, existingBets, jokerPicks, allTeams,
  groupPredictions, journeyPredictions, userId
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('partidas')

  const tabs = [
    { id: 'partidas' as Tab, label: '⚽', full: 'PARTIDAS' },
    { id: 'grupos' as Tab, label: '📊', full: 'GRUPOS' },
    { id: 'jornada' as Tab, label: '🗺️', full: 'ATÉ ONDE VAI' },
  ]

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-blue-900 px-4 pt-6 pb-0 sticky top-0 z-10"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }}>
        <div className="flex justify-between items-center mb-4">
          <h1 className="font-bebas text-4xl text-yellow-400 tracking-widest m-0"
            style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>
            PALPITES
          </h1>
        </div>
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-[10px] font-bebas tracking-wider rounded-t-xl transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-900'
                  : 'bg-white/10 text-white'
              }`}
            >
              {tab.label} {tab.full}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        {activeTab === 'partidas' && (
          <div className="px-4">
            <PalpitarClient
              games={games}
              existingBets={existingBets}
              jokerPicks={jokerPicks}
            />
          </div>
        )}
        {activeTab === 'grupos' && (
          <div>
            <Countdown
              deadline={DEADLINES.groups}
              label="Palpites de Classificação fecham em"
              variant="banner"
            />
            <div className="px-4 mt-4">
              <GroupBetsTab
                existingPredictions={groupPredictions}
                userId={userId}
              />
            </div>
          </div>
        )}
        {activeTab === 'jornada' && (
          <div>
            <Countdown
              deadline={DEADLINES.journey}
              label="Palpites de Jornada fecham em"
              variant="banner"
            />
            <div className="px-4 mt-4">
              <JourneyBetsTab
                allTeams={allTeams}
                existingPredictions={journeyPredictions}
                userId={userId}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
