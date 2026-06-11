import { createClient } from '@/lib/supabase/server'
import NextMatchCard from '@/components/dashboard/NextMatchCard'
import MyBetCard from '@/components/dashboard/MyBetCard'
import MyGroupsPreview from '@/components/dashboard/MyGroupsPreview'
import CountdownDashboard from '@/components/dashboard/CountdownDashboard'
import NotificationBell from '@/components/layout/NotificationBell'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { formatTime } from '@/lib/dates'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const today = new Date().toISOString().split('T')[0]

  // Próximo jogo
  const { data: nextMatches } = await supabase
    .from('games')
    .select('*')
    .eq('status', 'scheduled')
    .not('home_team', 'is', null)
    .order('kickoff_at')
    .limit(1)
  const nextMatch = nextMatches?.[0] ?? null

  // Palpite do usuário para o próximo jogo
  const { data: finalBets } = nextMatch ? await supabase
    .from('bets')
    .select('*')
    .eq('user_id', user?.id ?? '')
    .eq('game_id', nextMatch.id) : { data: [] }

  const nextGameBet = finalBets?.[0] ?? null

  // Jogos de hoje
  const { data: todayGames } = await supabase
    .from('games')
    .select('*')
    .gte('kickoff_at', `${today}T00:00:00`)
    .lte('kickoff_at', `${today}T23:59:59`)
    .order('kickoff_at')

  return (
    <div className="pb-24">
      {/* Header com próximo jogo */}
      <div className="bg-green-500 px-4 pt-6 pb-0"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.12) 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/logo.png" alt="PalpiteCup Logo" className="h-11 w-auto object-contain drop-shadow-md" />
            <div className="flex flex-col">
              <h1 className="font-bebas text-[26px] text-yellow-400 tracking-widest leading-[0.85]"
                style={{ textShadow: '2px 2px 0 #1e3a8a' }}>
                PALPITE
              </h1>
              <h1 className="font-bebas text-[26px] text-white tracking-widest leading-[0.85]"
                style={{ textShadow: '2px 2px 0 #1e3a8a' }}>
                CUP
              </h1>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white backdrop-blur-md hover:bg-white/30 transition">
              <Search size={18} />
            </button>
            {user && <NotificationBell userId={user.id} />}
          </div>
        </div>

        {nextMatch && (
          <NextMatchCard game={nextMatch} />
        )}
      </div>

      {/* Card do meu palpite */}
      {nextMatch && (
        <MyBetCard game={nextMatch} bet={nextGameBet} />
      )}

      {/* Contadores */}
      <CountdownDashboard />

      {/* MEUS GRUPOS — posição principal */}
      <div className="px-4 mt-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bebas text-xl tracking-widest text-slate-800">MEUS GRUPOS</h2>
          <Link href="/groups" className="text-xs text-green-600 font-bold">
            Ver todos →
          </Link>
        </div>
        <MyGroupsPreview userId={user?.id ?? ''} />
      </div>

      {/* JOGOS DE HOJE — abaixo dos grupos */}
      <div className="px-4 mt-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bebas text-xl tracking-widest text-slate-800">JOGOS DE HOJE</h2>
          <Link href="/jogos" className="text-xs text-green-600 font-bold">
            Ver todos →
          </Link>
        </div>

        {!todayGames || todayGames.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
            <p className="text-2xl mb-2">⚽</p>
            <p className="text-slate-500 text-sm font-medium">Nenhum jogo hoje.</p>
            <p className="text-slate-400 text-xs mt-1">A Copa começa em 11 de junho!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayGames.map(game => (
              <Link key={game.id} href={`/game/${game.id}`}>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                      {game.group_stage ?? 'Copa do Mundo'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      game.status === 'live'
                        ? 'bg-red-100 text-red-600'
                        : game.status === 'finished'
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {game.status === 'live' ? '🔴 AO VIVO'
                        : game.status === 'finished' ? 'ENCERRADO'
                        : formatTime(game.kickoff_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-sm flex-1">
                      {game.home_team ?? 'A definir'}
                    </span>
                    <span className="font-bebas text-xl text-slate-800 px-3">
                      {game.status !== 'scheduled'
                        ? `${game.home_score ?? 0} × ${game.away_score ?? 0}`
                        : 'VS'}
                    </span>
                    <span className="font-bold text-slate-800 text-sm flex-1 text-right">
                      {game.away_team ?? 'A definir'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
