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
            color: '#facc15', textShadow: '2px 2px 0 rgba(34,197,94,0.6)',
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
            color: '#facc15', textShadow: '2px 2px 0 rgba(34,197,94,0.6)',
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
            color: '#facc15', textShadow: '2px 2px 0 rgba(34,197,94,0.6)',
          }}>
            {isGlobal ? 'RANKING' : groupName?.toUpperCase()}
          </div>
          <div style={{ fontSize: '22px', color: 'rgba(255,255,255,0.85)', marginTop: '6px', fontWeight: '600' }}>
            {isGlobal ? 'Ranking global do bolão' : 'Classificação do grupo'}
          </div>
        </div>
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
        <div style={{ position: 'absolute', bottom: '40px', left: 0, right: 0, textAlign: 'center', zIndex: 1 }}>
          <div style={{ fontSize: '30px', fontWeight: '900', letterSpacing: '1px' }}>
            <span style={{ color: 'white' }}>PALPITE</span><span style={{ color: '#22c55e' }}>CUP</span>
          </div>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>palpite-cup.vercel.app</div>
        </div>
      </div>

      <div
        id="share-card-post"
        style={{
          position: 'fixed', left: '-9999px', top: 0,
          width: '600px', height: '600px',
          background: '#0a1f5c',
          fontFamily: 'Arial, sans-serif', overflow: 'hidden',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/share-backgrounds/stadium-bg-square.png"
          alt=""
          style={{ position: 'absolute', top: 0, left: 0, width: '600px', height: '600px', objectFit: 'cover', zIndex: 0 }}
        />
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
            color: '#facc15', textShadow: '2px 2px 0 rgba(34,197,94,0.6)',
          }}>
            {isGlobal ? 'RANKING' : groupName?.toUpperCase()}
          </div>
        </div>
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
        <div style={{ position: 'absolute', bottom: '20px', left: 0, right: 0, textAlign: 'center', zIndex: 1 }}>
          <div style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '1px' }}>
            <span style={{ color: 'white' }}>PALPITE</span><span style={{ color: '#22c55e' }}>CUP</span>
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>palpite-cup.vercel.app</div>
        </div>
      </div>
    </>
  )
}
