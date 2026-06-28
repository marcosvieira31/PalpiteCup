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

  const CardContent = ({ width, height, compact }: { width: number; height: number; compact: boolean }) => {
    const bgImage = compact ? '/share-backgrounds/stadium-bg-square.png' : '/share-backgrounds/stadium-bg.png'

    return (
      <div style={{
        width: `${width}px`,
        height: `${height}px`,
        background: '#0a1f5c',
        fontFamily: 'Arial, sans-serif',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bgImage}
          alt=""
          style={{ position: 'absolute', top: 0, left: 0, width: `${width}px`, height: `${height}px`, objectFit: 'cover', zIndex: 0 }}
        />
        <div style={{ position: 'relative', zIndex: 1, padding: compact ? '28px 26px 12px' : '48px 40px 20px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: compact ? '6px' : '8px',
            background: '#ef4444', color: 'white', fontSize: compact ? '12px' : '16px', fontWeight: 'bold',
            padding: compact ? '4px 12px' : '6px 16px', borderRadius: '999px', letterSpacing: '1px',
            marginBottom: compact ? '10px' : '18px',
          }}>
            <span style={{ width: compact ? '6px' : '8px', height: compact ? '6px' : '8px', background: 'white', borderRadius: '50%' }} />
            AO VIVO
          </div>
          <div style={{
            fontSize: compact ? '32px' : '50px', fontWeight: '900', letterSpacing: '1px', lineHeight: 1,
            color: '#facc15', textShadow: '2px 2px 0 rgba(34,197,94,0.6)',
          }}>
            {groupName.toUpperCase()}
          </div>
          <div style={{ fontSize: compact ? '14px' : '20px', color: 'rgba(255,255,255,0.85)', marginTop: compact ? '4px' : '6px', fontWeight: '600' }}>
            Palpites dos jogos rolando agora
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, padding: `0 ${compact ? 22 : 32}px`, overflowY: 'auto' }}>
          {liveGames.map(game => {
            const bets = betsForGame(game.id)
            return (
              <div key={game.id} style={{
                background: 'rgba(15,30,80,0.55)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: compact ? '14px' : '18px',
                padding: compact ? '12px' : '16px',
                marginBottom: compact ? '10px' : '14px',
              }}>
                <div style={{
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: compact ? '10px' : '14px',
                  marginBottom: compact ? '8px' : '12px',
                }}>
                  <span style={{ color: 'white', fontWeight: '800', fontSize: compact ? '13px' : '17px' }}>{game.home_team}</span>
                  <span style={{
                    color: '#facc15', fontWeight: '900', fontSize: compact ? '20px' : '28px',
                    background: 'rgba(30,58,138,0.7)', borderRadius: '8px', padding: compact ? '3px 12px' : '5px 16px',
                  }}>
                    {game.home_score ?? 0} × {game.away_score ?? 0}
                  </span>
                  <span style={{ color: 'white', fontWeight: '800', fontSize: compact ? '13px' : '17px' }}>{game.away_team}</span>
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
                      background: 'rgba(30,58,138,0.4)', borderRadius: '10px',
                      padding: compact ? '6px 10px' : '8px 14px',
                    }}>
                      <span style={{ color: 'white', fontWeight: '700', fontSize: compact ? '12px' : '15px' }}>
                        {bet.users?.username ?? 'Usuário'}
                      </span>
                      <span style={{ color: '#facc15', fontWeight: '800', fontSize: compact ? '13px' : '17px' }}>
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
          position: 'absolute', bottom: compact ? '14px' : '24px', left: 0, right: 0,
          textAlign: 'center', zIndex: 1,
        }}>
          <div style={{ fontSize: compact ? '18px' : '28px', fontWeight: '900', letterSpacing: '1px' }}>
            <span style={{ color: 'white' }}>PALPITE</span><span style={{ color: '#22c55e' }}>CUP</span>
          </div>
          <div style={{ fontSize: compact ? '10px' : '13px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
            palpite-cup.vercel.app
          </div>
        </div>
      </div>
    )
  }

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
