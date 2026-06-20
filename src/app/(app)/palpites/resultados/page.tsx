import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import TeamFlag from '@/components/ui/TeamFlag'

export default async function ResultadosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Busca jogos finalizados
  const { data: games } = await supabase
    .from('games')
    .select('*')
    .eq('status', 'finished')
    .order('kickoff_at', { ascending: false })

  if (!games || games.length === 0) return (
    <div className="pb-24">
      <div className="bg-blue-900 px-4 pt-6 pb-6"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }}>
        <Link href="/palpites" className="text-white/60 text-sm mb-3 flex items-center gap-1">‹ Voltar</Link>
        <h1 className="font-bebas text-4xl text-yellow-400 tracking-widest">RESULTADOS</h1>
      </div>
      <div className="px-4 mt-8 text-center">
        <p className="text-4xl mb-3">⏳</p>
        <p className="text-slate-500 font-medium">Nenhum jogo finalizado ainda.</p>
      </div>
    </div>
  )

  // Busca todos os palpites dos jogos finalizados
  const gameIds = games.map(g => g.id)
  const { data: allBets } = await supabase
    .from('bets')
    .select('*, users(username, avatar_url)')
    .in('game_id', gameIds)
    .order('points_earned', { ascending: false })

  const { data: allJokerPicks } = await supabase
    .from('joker_picks')
    .select('user_id, game_id')
    .in('game_id', gameIds)

  const jokerSet = new Set(
    (allJokerPicks ?? []).map(jp => `${jp.user_id}-${jp.game_id}`)
  )

  const allBetsWithJoker = (allBets ?? []).map(b => ({
    ...b,
    has_joker: jokerSet.has(`${b.user_id}-${b.game_id}`)
  }))

  return (
    <div className="pb-24">
      <div className="bg-blue-900 px-4 pt-6 pb-6"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }}>
        <Link href="/palpites" className="text-white/60 text-sm mb-3 flex items-center gap-1">‹ Voltar</Link>
        <h1 className="font-bebas text-4xl text-yellow-400 tracking-widest"
          style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>
          PALPITES REVELADOS
        </h1>
        <p className="text-blue-200 text-sm mt-1">{games.length} jogo(s) finalizado(s)</p>
      </div>

      <div className="px-4 mt-4 space-y-6">
        {games.map(game => {
          const gameBets = allBetsWithJoker.filter(b => b.game_id === game.id)
            .sort((a, b) => b.points_earned - a.points_earned)

          return (
            <div key={game.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Resultado do jogo */}
              <div className="bg-slate-800 px-4 py-3">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                  {game.group_stage ?? 'Copa do Mundo'} · ENCERRADO
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <TeamFlag team={game.home_team ?? ''} size={28} />
                    <span className="font-bold text-white text-sm">{game.home_team}</span>
                  </div>
                  <span className="font-bebas text-2xl text-white px-3">
                    {game.home_score} × {game.away_score}
                  </span>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className="font-bold text-white text-sm">{game.away_team}</span>
                    <TeamFlag team={game.away_team ?? ''} size={28} />
                  </div>
                </div>
              </div>

              {/* Palpites */}
              {gameBets.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-4">Nenhum palpite para este jogo.</p>
              ) : (
                <div className="divide-y divide-slate-50">
                  {gameBets.map((bet, idx) => {
                    const isMe = bet.user_id === user?.id
                    const isExact = bet.home_bet === game.home_score && bet.away_bet === game.away_score
                    const betDiff = bet.home_bet - bet.away_bet
                    const realDiff = (game.home_score ?? 0) - (game.away_score ?? 0)
                    const isDiff = betDiff === realDiff
                    const betWinner = bet.home_bet > bet.away_bet ? 'home' : bet.home_bet < bet.away_bet ? 'away' : 'draw'
                    const realWinner = (game.home_score ?? 0) > (game.away_score ?? 0) ? 'home' : (game.home_score ?? 0) < (game.away_score ?? 0) ? 'away' : 'draw'
                    const isWinner = betWinner === realWinner

                    const resultIcon = isExact ? '🎯' : isDiff ? '✅' : isWinner ? '👍' : '❌'
                    const resultColor = isExact ? 'text-green-600' : isDiff ? 'text-blue-600' : isWinner ? 'text-yellow-600' : 'text-red-400'

                    return (
                      <div key={bet.id}
                        className={`flex items-center gap-3 px-4 py-3 ${isMe ? 'bg-green-50' : ''}`}>
                        {/* Posição */}
                        <span className="font-bebas text-lg text-slate-300 w-5 flex-shrink-0">
                          {idx + 1}
                        </span>

                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={bet.users?.avatar_url ?? '/avatars/vini-jr.png'}
                            alt={bet.users?.username ?? ''}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Nome */}
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm truncate ${isMe ? 'text-green-700' : 'text-slate-800'}`}>
                            {bet.users?.username ?? 'Usuário'} {isMe && '(você)'}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="font-bebas text-sm text-slate-600">
                              {bet.home_bet} × {bet.away_bet}
                            </span>
                            {bet.has_joker && (
                              <span className="text-[9px] bg-yellow-100 text-yellow-700 font-bold px-1.5 rounded-full">⚡</span>
                            )}
                          </div>
                        </div>

                        {/* Resultado */}
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-lg">{resultIcon}</span>
                          {bet.points_earned > 0 && (
                            <span className={`font-bebas text-lg leading-none ${resultColor}`}>
                              +{bet.points_earned}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
