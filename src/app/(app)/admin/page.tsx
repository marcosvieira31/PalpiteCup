"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import TeamFlag from '@/components/ui/TeamFlag'

const ADMIN_EMAILS = ['marcosnd.31@gmail.com']

interface Game {
  id: number
  home_team: string | null
  away_team: string | null
  kickoff_at: string
  status: string
  group_stage: string | null
}

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false)
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'scheduled' | 'live' | 'finished'>('scheduled')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email && ADMIN_EMAILS.includes(user.email)) {
        setAuthorized(true)
      }
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (authorized) loadGames()
  }, [authorized, filter])

  const loadGames = async () => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('status', filter)
      .not('home_team', 'is', null)
      .order('kickoff_at', { ascending: filter !== 'finished' })
      .limit(30)

    if (error) console.error('LOAD ERROR:', error)
    console.log(`Filtro: ${filter}, jogos encontrados:`, data?.length)
    setGames(data ?? [])
  }

  const updateGame = async (gameId: number, status: string, homeScore: number, awayScore: number) => {
    const { data: { user } } = await supabase.auth.getUser()

    const response = await fetch('/api/admin/update-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameId,
        status,
        homeScore,
        awayScore,
        userEmail: user?.email
      })
    })

    const result = await response.json()

    if (!response.ok) {
      alert(`Erro: ${result.error}`)
      console.error('UPDATE ERROR:', result)
      return
    }

    console.log('UPDATE SUCCESS:', result)
    // Remove o jogo da lista atual imediatamente (já que mudou de status)
    setGames(prev => prev.filter(g => g.id !== gameId))
  }

  if (loading) return <p className="p-8 text-center text-slate-400">Carregando...</p>
  if (!authorized) return <p className="p-8 text-center text-red-500">Acesso negado.</p>

  return (
    <div className="pb-24">
      <div className="bg-slate-900 px-4 pt-6 pb-4">
        <h1 className="font-bebas text-3xl text-yellow-400 tracking-widest">ADMIN — RESULTADOS</h1>
        <p className="text-slate-400 text-xs mt-1">Atualização manual enquanto a API externa está fora</p>
      </div>

      <div className="flex gap-2 px-4 mt-4">
        {(['scheduled', 'live', 'finished'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-1 py-2 rounded-xl text-xs font-bebas tracking-wider ${
              filter === f ? 'bg-blue-900 text-yellow-400' : 'bg-slate-100 text-slate-500'
            }`}>
            {f === 'scheduled' ? 'AGENDADOS' : f === 'live' ? 'AO VIVO' : 'ENCERRADOS'}
          </button>
        ))}
      </div>

      <div className="px-4 mt-4 space-y-3">
        {games.length === 0 && (
          <p className="text-center text-slate-400 py-8">Nenhum jogo nesta categoria.</p>
        )}
        {games.map(game => (
          <GameRow key={game.id} game={game} onUpdate={updateGame} />
        ))}
      </div>
    </div>
  )
}

function GameRow({ game, onUpdate }: { game: Game; onUpdate: (id: number, status: string, h: number, a: number) => void }) {
  const [home, setHome] = useState(0)
  const [away, setAway] = useState(0)
  const [saving, setSaving] = useState(false)

  const kickoff = new Date(game.kickoff_at)

  const handleSave = async (status: string) => {
    setSaving(true)
    await onUpdate(game.id, status, home, away)
    setSaving(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
        {game.group_stage} · {kickoff.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
      </p>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TeamFlag team={game.home_team ?? ''} size={24} />
          <span className="font-bold text-sm">{game.home_team}</span>
        </div>
        <span className="text-xs text-slate-400">VS</span>
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">{game.away_team}</span>
          <TeamFlag team={game.away_team ?? ''} size={24} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          value={home}
          onChange={e => setHome(Number(e.target.value))}
          className="w-16 border border-slate-200 rounded-lg px-2 py-2 text-center font-bebas text-lg"
        />
        <span className="font-bebas text-lg text-slate-400">×</span>
        <input
          type="number"
          value={away}
          onChange={e => setAway(Number(e.target.value))}
          className="w-16 border border-slate-200 rounded-lg px-2 py-2 text-center font-bebas text-lg"
        />

        <button
          onClick={() => handleSave('live')}
          disabled={saving}
          className="ml-auto bg-red-500 text-white rounded-lg px-3 py-2 text-xs font-bold disabled:opacity-50"
        >
          🔴 AO VIVO
        </button>
        <button
          onClick={() => handleSave('finished')}
          disabled={saving}
          className="bg-green-500 text-white rounded-lg px-3 py-2 text-xs font-bold disabled:opacity-50"
        >
          ✅ FINALIZAR
        </button>
      </div>
    </div>
  )
}
