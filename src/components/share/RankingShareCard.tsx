"use client"
import { generateShareImage } from '@/lib/share-image'

interface Member {
  user_id: string
  username: string
  avatar_url: string | null
  points_total: number
}

interface Props {
  members: Member[]
  groupName?: string
  isGlobal?: boolean
  hideButton?: boolean
}

export async function generateRankingShareImage(fmt: 'story' | 'post', groupName?: string, isGlobal?: boolean) {
  await new Promise(r => setTimeout(r, 100))
  await generateShareImage(
    `share-card-${fmt}`,
    `palpitecup-${isGlobal ? 'global' : groupName?.replace(/\s/g, '-').toLowerCase()}`
  )
}

export default function RankingShareCard({ members, groupName, isGlobal, hideButton }: Props) {
  const top5 = members.slice(0, 5)
  const medals = ['👑', '🥈', '🥉', '4️⃣', '5️⃣']

  if (hideButton) {
    return <RankingShareCardHidden members={members} groupName={groupName} isGlobal={isGlobal} />
  }

  return (
    <div>
      {/* Card Stories (9:16) — renderizado fora da tela */}
      <div
        id="share-card-story"
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '540px',
          height: '960px',
          background: '#0a1f5c',
          fontFamily: 'Arial, sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/share-backgrounds/stadium-bg.png"
          alt=""
          style={{ position: 'absolute', top: 0, left: 0, width: '540px', height: '960px', objectFit: 'cover', zIndex: 0 }}
        />
        {/* Header */}
        <div style={{ position: 'relative', zIndex: 1, padding: '56px 40px 28px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#ef4444', color: 'white', fontSize: '16px', fontWeight: 'bold',
            padding: '6px 16px', borderRadius: '999px', letterSpacing: '1px', marginBottom: '20px',
          }}>
            <span style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%' }} />
            RANKING
          </div>
          <div style={{
            fontSize: '54px', fontWeight: '900', letterSpacing: '1px', lineHeight: 1,
            background: 'linear-gradient(90deg, #facc15 0%, #22c55e 100%)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            textShadow: 'none',
          }}>
            {isGlobal ? 'RANKING' : groupName?.toUpperCase()}
          </div>
          <div style={{ fontSize: '22px', color: 'rgba(255,255,255,0.85)', marginTop: '6px', fontWeight: '600' }}>
            {isGlobal ? 'Ranking global do bolão' : 'Classificação do grupo'}
          </div>
        </div>

        {/* Ranking */}
        <div style={{ position: 'relative', zIndex: 1, padding: '8px 36px' }}>
          <div style={{
            background: 'rgba(15,30,80,0.55)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.15)',
            padding: '8px', backdropFilter: 'blur(2px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 'bold', letterSpacing: '1px' }}>
              <span style={{ width: '24px' }}>👤</span>
              <span style={{ flex: 1 }}>PARTICIPANTES</span>
              <span>PONTOS</span>
            </div>
            {top5.map((member, idx) => (
              <div key={member.user_id} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                background: 'rgba(30,58,138,0.55)',
                borderRadius: '14px', padding: '14px 16px', marginBottom: idx === top5.length - 1 ? 0 : '8px',
              }}>
                <div style={{ width: '32px', textAlign: 'center', fontSize: idx < 3 ? '26px' : '20px', color: idx >= 3 ? 'rgba(255,255,255,0.5)' : undefined, fontWeight: '800' }}>
                  {medals[idx]}
                </div>
                <div style={{ flex: 1, fontSize: '20px', fontWeight: '800', color: 'white' }}>
                  {member.username}
                </div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#facc15' }}>
                  {member.points_total}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute', bottom: '40px', left: 0, right: 0,
          textAlign: 'center', zIndex: 1,
        }}>
          <div style={{ fontSize: '30px', fontWeight: '900', letterSpacing: '1px' }}>
            <span style={{ color: 'white' }}>PALPITE</span><span style={{ color: '#22c55e' }}>CUP</span>
          </div>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
            palpite-cup.vercel.app
          </div>
        </div>
      </div>

      {/* Card Post (1:1) — renderizado fora da tela */}
      <div
        id="share-card-post"
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '600px',
          height: '600px',
          background: '#0a1f5c',
          fontFamily: 'Arial, sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/share-backgrounds/stadium-bg-square.png"
          alt=""
          style={{ position: 'absolute', top: 0, left: 0, width: '600px', height: '600px', objectFit: 'cover', zIndex: 0 }}
        />
        {/* Header */}
        <div style={{ position: 'relative', zIndex: 1, padding: '32px 32px 14px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: '#ef4444', color: 'white', fontSize: '12px', fontWeight: 'bold',
            padding: '4px 12px', borderRadius: '999px', letterSpacing: '1px', marginBottom: '10px',
          }}>
            <span style={{ width: '6px', height: '6px', background: 'white', borderRadius: '50%' }} />
            RANKING
          </div>
          <div style={{
            fontSize: '34px', fontWeight: '900', letterSpacing: '1px', lineHeight: 1,
            background: 'linear-gradient(90deg, #facc15 0%, #22c55e 100%)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
          }}>
            {isGlobal ? 'RANKING' : groupName?.toUpperCase()}
          </div>
        </div>

        {/* Ranking compacto */}
        <div style={{ position: 'relative', zIndex: 1, padding: '0 26px' }}>
          <div style={{ background: 'rgba(15,30,80,0.55)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.15)', padding: '6px' }}>
            {top5.map((member, idx) => (
              <div key={member.user_id} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: 'rgba(30,58,138,0.55)',
                borderRadius: '10px', padding: '9px 12px', marginBottom: idx === top5.length - 1 ? 0 : '6px',
              }}>
                <div style={{ width: '22px', textAlign: 'center', fontSize: idx < 3 ? '18px' : '14px', fontWeight: '800' }}>
                  {medals[idx]}
                </div>
                <div style={{ flex: 1, fontSize: '15px', fontWeight: '800', color: 'white' }}>
                  {member.username}
                </div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#facc15' }}>
                  {member.points_total}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute', bottom: '20px', left: 0, right: 0,
          textAlign: 'center', zIndex: 1,
        }}>
          <div style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '1px' }}>
            <span style={{ color: 'white' }}>PALPITE</span><span style={{ color: '#22c55e' }}>CUP</span>
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
            palpite-cup.vercel.app
          </div>
        </div>
      </div>
    </div>
  )
}

function RankingShareCardHidden({ members, groupName, isGlobal }: Props) {
  const top5 = members.slice(0, 5)
  const medals = ['👑', '🥈', '🥉', '4️⃣', '5️⃣']

  return (
    <>
      <div
        id="share-card-story"
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '540px',
          height: '960px',
          background: 'linear-gradient(135deg, #15803d 0%, #22c55e 40%, #1e3a8a 100%)',
          fontFamily: 'Arial, sans-serif',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.15) 2px, transparent 2px)',
          backgroundSize: '20px 20px',
        }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '48px 40px 32px' }}>
          <div style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', fontWeight: 'bold', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '8px' }}>
            🏆 BOLÃO DA COPA 2026
          </div>
          <div style={{ fontSize: '52px', fontWeight: '900', color: '#facc15', letterSpacing: '2px', textShadow: '3px 3px 0 #1e3a8a', lineHeight: 1 }}>
            {isGlobal ? 'RANKING' : groupName?.toUpperCase()}
          </div>
          <div style={{ fontSize: '24px', color: 'rgba(255,255,255,0.8)', marginTop: '8px' }}>
            {isGlobal ? 'GLOBAL' : 'DO GRUPO'}
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 1, padding: '0 32px' }}>
          {top5.map((member, idx) => (
            <div key={member.user_id} style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              background: idx === 0 ? 'rgba(250,204,21,0.2)' : 'rgba(255,255,255,0.1)',
              borderRadius: '16px', padding: '16px 20px', marginBottom: '12px',
              border: idx === 0 ? '2px solid rgba(250,204,21,0.5)' : '1px solid rgba(255,255,255,0.15)',
            }}>
              <div style={{ fontSize: '28px', width: '36px', textAlign: 'center' }}>{medals[idx]}</div>
              <div style={{ width: '52px', height: '52px', borderRadius: '12px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.3)', flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={member.avatar_url ?? '/avatars/vini-jr.png'} alt={member.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '22px', fontWeight: '800', color: idx === 0 ? '#facc15' : 'white', letterSpacing: '0.5px' }}>{member.username}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '36px', fontWeight: '900', color: idx === 0 ? '#facc15' : 'white', lineHeight: 1 }}>{member.points_total}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', letterSpacing: '1px' }}>PONTOS</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', bottom: '48px', left: 0, right: 0, textAlign: 'center', zIndex: 1 }}>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#facc15', letterSpacing: '3px', textShadow: '2px 2px 0 #1e3a8a' }}>PALPITECUP</div>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>palpite-cup.vercel.app</div>
        </div>
      </div>

      <div
        id="share-card-post"
        style={{
          position: 'fixed', left: '-9999px', top: 0,
          width: '600px', height: '600px',
          background: 'linear-gradient(135deg, #15803d 0%, #22c55e 50%, #1e3a8a 100%)',
          fontFamily: 'Arial, sans-serif', overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.15) 2px, transparent 2px)',
          backgroundSize: '18px 18px',
        }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '36px 36px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: 'bold', letterSpacing: '3px', textTransform: 'uppercase' }}>🏆 COPA 2026</div>
            <div style={{ fontSize: '36px', fontWeight: '900', color: '#facc15', letterSpacing: '2px', textShadow: '2px 2px 0 #1e3a8a', lineHeight: 1.1 }}>
              {isGlobal ? 'RANKING\nGLOBAL' : groupName?.toUpperCase()}
            </div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#facc15', letterSpacing: '2px', textShadow: '2px 2px 0 #1e3a8a', textAlign: 'right' }}>
            PALPITE<br />CUP
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 1, padding: '0 28px' }}>
          {top5.map((member, idx) => (
            <div key={member.user_id} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: idx === 0 ? 'rgba(250,204,21,0.2)' : 'rgba(255,255,255,0.1)',
              borderRadius: '12px', padding: '10px 14px', marginBottom: '8px',
              border: idx === 0 ? '1.5px solid rgba(250,204,21,0.5)' : '1px solid rgba(255,255,255,0.15)',
            }}>
              <div style={{ fontSize: '20px', width: '28px', textAlign: 'center' }}>{medals[idx]}</div>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.3)', flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={member.avatar_url ?? '/avatars/vini-jr.png'} alt={member.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1, fontSize: '16px', fontWeight: '800', color: idx === 0 ? '#facc15' : 'white' }}>{member.username}</div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: idx === 0 ? '#facc15' : 'white', lineHeight: 1 }}>
                {member.points_total}
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', marginLeft: '3px' }}>pts</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', bottom: '24px', left: 0, right: 0, textAlign: 'center', zIndex: 1 }}>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>palpite-cup.vercel.app</div>
        </div>
      </div>
    </>
  )
}
