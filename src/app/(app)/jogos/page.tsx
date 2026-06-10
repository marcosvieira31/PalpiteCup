"use client"
import { useState } from 'react'
import PartidaTab from '@/components/jogos/PartidaTab'
import GruposTab from '@/components/jogos/GruposTab'
import BracketTab from '@/components/jogos/BracketTab'

type Tab = 'partidas' | 'grupos' | 'bracket'

export default function JogosPage() {
  const [activeTab, setActiveTab] = useState<Tab>('partidas')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'partidas', label: '⚽ PARTIDAS' },
    { id: 'grupos', label: '📊 GRUPOS' },
    { id: 'bracket', label: '⚔️ BRACKET' },
  ]

  return (
    <div className="pb-24">
      <div className="bg-green-500 px-4 pt-6 pb-0 sticky top-0 z-10"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.12) 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }}>
        <h1 className="font-bebas text-4xl text-yellow-400 tracking-widest mb-4"
          style={{ textShadow: '2px 2px 0 #1e3a8a' }}>
          COPA 2026
        </h1>
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-xs font-bebas tracking-wider rounded-t-xl transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-green-700'
                  : 'bg-white/20 text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className={activeTab === 'bracket' ? '' : 'px-4 mt-4'}>
        {activeTab === 'partidas' && <PartidaTab />}
        {activeTab === 'grupos' && <GruposTab />}
        {activeTab === 'bracket' && <BracketTab />}
      </div>
    </div>
  )
}
