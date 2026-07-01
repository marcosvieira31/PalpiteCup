import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import TeamFlag from '@/components/ui/TeamFlag'
import { formatDateShort } from '@/lib/dates'
import { calculateBetPoints } from '@/lib/scoring'

export const dynamic = 'force-dynamic'

interface Props {
  params: { id: string }
  searchParams: { groupId?: string; groupName?: string }
}

export default async function UserBetsPage({ params, searchParams }: Props) {
  const supabase = await createClient()

  // Busca dados do usuário
  const { data: profile } = await supabase
    .from('users')
    .select('id, username, avatar_url, points_total')
    .eq('id', params.id)
    .single()

  if (!profile) notFound()

  // Busca jogos finalizados e ao vivo (ao vivo mostra placar/pontos provisórios)
  const gamesQuery = supabase
    .from('games')
    .select('*')
    .in('status', ['finished', 'live'])
    .order('kickoff_at', { ascending: false })

  // Se veio de um grupo com filtro, aplica o filtro
  if (searchParams.groupId) {
    const { data: group } = await supabase
      .from('groups')
      .select('filter_teams, filter_phases')
      .eq('id', searchParams.groupId)
      .single()

    if (group?.filter_teams?.length) {
      // Filtra jogos pelo time
      // Isso seria feito adicionando `.in('home_team', group.filter_teams).or(`away_team.in.(${group.filter_teams.join(',')})`)` no Supabase,
      // mas como é complexo fazer OR misto no supabase JS, filtramos no JS depois caso tenha filtro.
    }
  }

  const { data: gamesData } = await gamesQuery
  let games = gamesData ?? []

  if (searchParams.groupId) {
    const { data: group } = await supabase
      .from('groups')
      .select('filter_teams, filter_phases')
      .eq('id', searchParams.groupId)
      .single()

    if (group?.filter_teams?.length && group.filter_teams.length > 0) {
      games = games.filter(g => 
        group.filter_teams?.includes(g.home_team ?? '') || 
        group.filter_teams?.includes(g.away_team ?? '')
      )
    }
    if (group?.filter_phases?.length && group.filter_phases.length > 0) {
      games = games.filter(g => 
        group.filter_phases?.includes(g.group_stage ?? '') ||
        (g.group_stage && group.filter_phases?.includes(g.group_stage.replace('Grupo ', 'Fase de Grupos'))) ||
        group.filter_phases?.includes('Mata-Mata') && g.group_stage && !g.group_stage.startsWith('Grupo')
      )
    }
  }


  // Busca palpites do usuário
  const gameIds = (games ?? []).map(g => g.id)
  const { data: bets } = await supabase
    .from('bets')
    .select('*')
    .eq('user_id', params.id)
    .in('game_id', gameIds.length > 0 ? gameIds : ['00000000-0000-0000-0000-000000000000'])


  const totalPoints = (bets ?? []).reduce((sum, b) => {
    const game = games?.find(g => g.id === b.game_id)
    if (!game) return sum
    if (game.status === 'live') {
      if (game.home_score === null || game.away_score === null) return sum
      return sum + calculateBetPoints(b.home_bet, b.away_bet, game.home_score, game.away_score)
    }
    return sum + (b.points_earned ?? 0)
  }, 0)
  const exactScores = (bets ?? []).filter(b => {
    const game = games?.find(g => g.id === b.game_id)
    return game && b.home_bet === game.home_score && b.away_bet === game.away_score
  }).length

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-blue-900 px-4 pt-6 pb-6"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }}>
        <Link href={searchParams.groupId ? `/group/${searchParams.groupId}` : '/groups/global'}
          className="text-white/60 text-sm mb-3 flex items-center gap-1">
          ‹ Voltar
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-16 rounded-2xl overflow-hidden border-2 border-white/30 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.avatar_url ?? '/avatars/vini-jr.png'}
              alt={profile.username}
              className="w-full aspect-[3/4] object-cover"
            />
          </div>
          <div>
            <h1 className="font-bebas text-3xl text-yellow-400 tracking-widest"
              style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>
              {profile.username}
            </h1>
            <p className="text-blue-200 text-sm mt-1">
              {searchParams.groupName
                ? `Palpites em ${searchParams.groupName}`
                : 'Palpites nos jogos encerrados e ao vivo'}
            </p>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="font-bebas text-2xl text-yellow-400">{totalPoints}</p>
            <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Pontos</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="font-bebas text-2xl text-white">{bets?.length ?? 0}</p>
            <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Palpites</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="font-bebas text-2xl text-green-400">{exactScores}</p>
            <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Exatos</p>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {!games || games.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-3xl mb-2">⏳</p>
            <p className="text-slate-500">Nenhum jogo finalizado ou ao vivo ainda.</p>
          </div>
        ) : (
          games.map(game => {
            const bet = (bets ?? []).find(b => b.game_id === game.id)
            const isLive = game.status === 'live'

            const isExact = bet && bet.home_bet === game.home_score && bet.away_bet === game.away_score
            const betDiff = bet ? bet.home_bet - bet.away_bet : null
            const realDiff = (game.home_score ?? 0) - (game.away_score ?? 0)
            const isDiff = betDiff !== null && betDiff === realDiff && !isExact
            const betWinner = bet ? (bet.home_bet > bet.away_bet ? 'home' : bet.home_bet < bet.away_bet ? 'away' : 'draw') : null
            const realWinner = (game.home_score ?? 0) > (game.away_score ?? 0) ? 'home' : (game.home_score ?? 0) < (game.away_score ?? 0) ? 'away' : 'draw'
            const isWinner = betWinner === realWinner && !isExact && !isDiff

            const livePoints = bet && game.home_score !== null && game.away_score !== null
              ? calculateBetPoints(bet.home_bet, bet.away_bet, game.home_score, game.away_score)
              : 0

            const resultIcon = !bet ? '—' : isExact ? '🎯' : isDiff ? '✅' : isWinner ? '👍' : '❌'
            const resultColor = !bet ? 'text-slate-300' : isExact ? 'text-green-600' : isDiff ? 'text-blue-600' : isWinner ? 'text-yellow-600' : 'text-red-400'

            return (
              <div key={game.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Resultado */}
                <div className={`px-4 py-2 flex items-center justify-between ${isLive ? 'bg-red-600' : 'bg-slate-800'}`}>
                  <span className="text-slate-200 text-[10px] font-bold uppercase tracking-wider">
                    {game.group_stage} · {formatDateShort(game.kickoff_at)}
                  </span>
                  {isLive ? (
                    <span className="flex items-center gap-1 text-white text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      AO VIVO
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[10px] font-bold">ENCERRADO</span>
                  )}
                </div>

                <div className="px-4 py-3">
                  {/* Placar real */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1">
                      <TeamFlag team={game.home_team ?? ''} size={24} />
                      <span className="font-bold text-slate-700 text-xs">{game.home_team}</span>
                    </div>
                    <span className="font-bebas text-xl text-slate-800 px-2">
                      {game.home_score} × {game.away_score}
                    </span>
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <span className="font-bold text-slate-700 text-xs">{game.away_team}</span>
                      <TeamFlag team={game.away_team ?? ''} size={24} />
                    </div>
                  </div>

                  {/* Palpite */}
                  {bet ? (
                    isLive ? (
                      <div className="flex items-center justify-between rounded-xl px-3 py-2 bg-yellow-50 border border-yellow-300">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">⏳</span>
                          <div>
                            <span className="text-sm font-bold text-yellow-800">
                              Palpite: {bet.home_bet} × {bet.away_bet}
                            </span>
                            <p className="text-[10px] text-yellow-600">resultado pode mudar</p>
                          </div>
                        </div>
                        <span className="font-bebas text-xl text-yellow-700">
                          +{livePoints} pts
                        </span>
                      </div>
                    ) : (
                      <div className={`flex items-center justify-between rounded-xl px-3 py-2 ${
                        isExact ? 'bg-green-50 border border-green-200'
                        : isDiff ? 'bg-blue-50 border border-blue-200'
                        : isWinner ? 'bg-yellow-50 border border-yellow-200'
                        : 'bg-red-50 border border-red-100'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{resultIcon}</span>
                          <span className="text-sm font-bold text-slate-700">
                            Palpite: {bet.home_bet} × {bet.away_bet}
                          </span>
                        </div>
                        {(bet.points_earned ?? 0) > 0 && (
                          <span className={`font-bebas text-xl ${resultColor}`}>
                            +{bet.points_earned} pts
                          </span>
                        )}
                      </div>
                    )
                  ) : (
                    <div className="bg-slate-50 rounded-xl px-3 py-2 text-center">
                      <span className="text-slate-400 text-xs">Não palpitou neste jogo</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
