"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { generateShareImage } from '@/lib/share-image'

interface LiveGameInfo {
  id: number | string
  home_team: string | null
  away_team: string | null
  home_score: number | null
  away_score: number | null
  status: string
  group_stage?: string | null
}

export interface LiveBetWithUser {
  user_id: string
  game_id: number | string
  home_bet: number
  away_bet: number
  used_joker: boolean
  users: { username: string; avatar_url: string | null } | null
}

interface Props {
  liveGames: LiveGameInfo[]
  liveBets: LiveBetWithUser[]
  groupName: string
}

export async function generateLiveBetsShareImage(fmt: 'story' | 'post', groupName: string) {
  await new Promise(r => setTimeout(r, 100))
  await generateShareImage(
    `live-bets-share-card-${fmt}`,
    `palpitecup-ao-vivo-${groupName.replace(/\s/g, '-').toLowerCase()}`
  )
}

export default function LiveBetsShareCard({ liveGames: initialGames, liveBets: initialBets, groupName }: Props) {
  const [liveGames, setLiveGames] = useState<LiveGameInfo[]>(initialGames)

  useEffect(() => {
    const channel = supabase
      .channel(`group-share-live-${groupName}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'games'
      }, (payload) => {
        const updated = payload.new as { id: number | string; status: string; home_score: number | null; away_score: number | null }
        setLiveGames(prev => {
          if (updated.status !== 'live') {
            return prev.filter(g => String(g.id) !== String(updated.id))
          }
          const exists = prev.some(g => String(g.id) === String(updated.id))
          if (exists) {
            return prev.map(g => String(g.id) === String(updated.id) ? { ...g, ...updated } : g)
          }
          return prev
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [groupName])

  if (liveGames.length === 0) return null

  const betsForGame = (gameId: number | string) =>
    initialBets.filter(b => String(b.game_id) === String(gameId))

  const CardContent = ({ width, height, compact }: { width: number; height: number; compact: boolean }) => (
    <div style={{
      width: `${width}px`,
      height: `${height}px`,
      background: 'linear-gradient(135deg, #1e3a8a 0%, #1e3a8a 40%, #15803d 100%)',
      fontFamily: 'Arial, sans-serif',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 2px, transparent 2px)',
        backgroundSize: '20px 20px',
      }} />

      <div style={{ position: 'relative', zIndex: 1, padding: compact ? '32px 28px 16px' : '48px 40px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{
            background: '#ef4444', color: 'white', fontSize: compact ? '11px' : '14px', fontWeight: 'bold',
            padding: '4px 10px', borderRadius: '999px', letterSpacing: '1px',
          }}>
            🔴 AO VIVO
          </div>
        </div>
        <div style={{ fontSize: compact ? '30px' : '44px', fontWeight: '900', color: '#facc15', letterSpacing: '1px', textShadow: '2px 2px 0 #15803d', lineHeight: 1 }}>
          {groupName.toUpperCase()}
        </div>
        <div style={{ fontSize: compact ? '16px' : '20px', color: 'rgba(255,255,255,0.8)', marginTop: '6px' }}>
          Palpites dos jogos rolando agora
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, padding: `0 ${compact ? 24 : 32}px`, overflowY: 'auto' }}>
        {liveGames.map(game => {
          const bets = betsForGame(game.id)
          return (
            <div key={game.id} style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: compact ? '12px' : '16px',
              padding: compact ? '12px' : '16px',
              marginBottom: compact ? '10px' : '14px',
            }}>
              <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: compact ? '10px' : '14px',
                marginBottom: compact ? '8px' : '12px',
              }}>
                <span style={{ color: 'white', fontWeight: '800', fontSize: compact ? '14px' : '18px' }}>{game.home_team}</span>
                <span style={{
                  color: '#facc15', fontWeight: '900', fontSize: compact ? '22px' : '30px',
                  background: 'rgba(0,0,0,0.25)', borderRadius: '8px', padding: compact ? '2px 10px' : '4px 14px',
                }}>
                  {game.home_score ?? 0} × {game.away_score ?? 0}
                </span>
                <span style={{ color: 'white', fontWeight: '800', fontSize: compact ? '14px' : '18px' }}>{game.away_team}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '4px' : '6px' }}>
                {bets.length === 0 && (
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: compact ? '12px' : '14px', textAlign: 'center' }}>
                    Nenhum palpite registrado
                  </div>
                )}
                {bets.map(bet => (
                  <div key={bet.user_id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'rgba(255,255,255,0.08)', borderRadius: '10px',
                    padding: compact ? '6px 10px' : '8px 14px',
                  }}>
                    <span style={{ color: 'white', fontWeight: '700', fontSize: compact ? '13px' : '15px' }}>
                      {bet.users?.username ?? 'Usuário'}{bet.used_joker ? ' ⚡' : ''}
                    </span>
                    <span style={{ color: '#facc15', fontWeight: '800', fontSize: compact ? '14px' : '17px' }}>
                      {bet.home_bet} × {bet.away_bet}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{
        position: 'absolute', bottom: compact ? '16px' : '24px', left: 0, right: 0,
        textAlign: 'center', zIndex: 1,
      }}>
        <div style={{ fontSize: compact ? '20px' : '26px', fontWeight: '900', color: '#facc15', letterSpacing: '2px', textShadow: '2px 2px 0 #15803d' }}>
          PALPITECUP
        </div>
        <div style={{ fontSize: compact ? '11px' : '13px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
          palpite-cup.vercel.app
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div id="live-bets-share-card-story" style={{ position: 'fixed', left: '-9999px', top: 0 }}>
        <CardContent width={540} height={960} compact={false} />
      </div>
      <div id="live-bets-share-card-post" style={{ position: 'fixed', left: '-9999px', top: 0 }}>
        <CardContent width={600} height={600} compact={true} />
      </div>
    </>
  )
}
