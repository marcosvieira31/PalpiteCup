"use client"
import { useState } from 'react'
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
}

export default function RankingShareCard({ members, groupName, isGlobal }: Props) {
  const [generating, setGenerating] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const top5 = members.slice(0, 5)

  const handleGenerate = async (fmt: 'story' | 'post') => {
    setShowOptions(false)
    setGenerating(true)
    // Pequeno delay para o DOM renderizar
    await new Promise(r => setTimeout(r, 100))
    await generateShareImage(
      `share-card-${fmt}`,
      `palpitecup-${isGlobal ? 'global' : groupName?.replace(/\s/g, '-').toLowerCase()}`
    )
    setGenerating(false)
  }

  const medals = ['👑', '🥈', '🥉', '4️⃣', '5️⃣']

  return (
    <div>
      {/* Botões de geração */}
      <div className="relative mt-3">
        <button
          onClick={() => setShowOptions(!showOptions)}
          disabled={generating}
          className="w-full bg-gradient-to-r from-green-600 to-blue-900 text-white font-bebas tracking-wider rounded-xl py-3 text-sm disabled:opacity-50 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          {generating ? '⏳ GERANDO...' : '📸 COMPARTILHAR RANKING'}
        </button>

        {showOptions && !generating && (
          <div className="absolute bottom-14 left-0 right-0 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-10">
            <button
              onClick={() => handleGenerate('story')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 border-b border-slate-100"
            >
              <span className="text-2xl">📱</span>
              <div className="text-left">
                <p className="font-bold text-slate-800 text-sm">Stories</p>
                <p className="text-xs text-slate-400">Formato vertical (9:16)</p>
              </div>
            </button>
            <button
              onClick={() => handleGenerate('post')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
            >
              <span className="text-2xl">🖼️</span>
              <div className="text-left">
                <p className="font-bold text-slate-800 text-sm">Post</p>
                <p className="text-xs text-slate-400">Formato quadrado (1:1)</p>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Card Stories (9:16) — renderizado fora da tela */}
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
        {/* Halftone background */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.15) 2px, transparent 2px)',
          backgroundSize: '20px 20px',
        }} />

        {/* Header */}
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

        {/* Ranking */}
        <div style={{ position: 'relative', zIndex: 1, padding: '0 32px' }}>
          {top5.map((member, idx) => (
            <div key={member.user_id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              background: idx === 0 ? 'rgba(250,204,21,0.2)' : 'rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '12px',
              border: idx === 0 ? '2px solid rgba(250,204,21,0.5)' : '1px solid rgba(255,255,255,0.15)',
            }}>
              <div style={{ fontSize: '28px', width: '36px', textAlign: 'center' }}>
                {medals[idx]}
              </div>
              <div style={{
                width: '52px', height: '52px',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '2px solid rgba(255,255,255,0.3)',
                flexShrink: 0,
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={member.avatar_url ?? '/avatars/vini-jr.png'}
                  alt={member.username}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  crossOrigin="anonymous"
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '22px', fontWeight: '800', color: idx === 0 ? '#facc15' : 'white', letterSpacing: '0.5px' }}>
                  {member.username}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '36px', fontWeight: '900', color: idx === 0 ? '#facc15' : 'white', lineHeight: 1 }}>
                  {member.points_total}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', letterSpacing: '1px' }}>
                  PONTOS
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute', bottom: '48px', left: 0, right: 0,
          textAlign: 'center', zIndex: 1,
        }}>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#facc15', letterSpacing: '3px', textShadow: '2px 2px 0 #1e3a8a' }}>
            PALPITECUP
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
          background: 'linear-gradient(135deg, #15803d 0%, #22c55e 50%, #1e3a8a 100%)',
          fontFamily: 'Arial, sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* Halftone */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.15) 2px, transparent 2px)',
          backgroundSize: '18px 18px',
        }} />

        {/* Header */}
        <div style={{ position: 'relative', zIndex: 1, padding: '36px 36px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: 'bold', letterSpacing: '3px', textTransform: 'uppercase' }}>
              🏆 COPA 2026
            </div>
            <div style={{ fontSize: '36px', fontWeight: '900', color: '#facc15', letterSpacing: '2px', textShadow: '2px 2px 0 #1e3a8a', lineHeight: 1.1 }}>
              {isGlobal ? 'RANKING\nGLOBAL' : groupName?.toUpperCase()}
            </div>
          </div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#facc15', letterSpacing: '2px', textShadow: '2px 2px 0 #1e3a8a', textAlign: 'right' }}>
            PALPITE<br />CUP
          </div>
        </div>

        {/* Ranking compacto */}
        <div style={{ position: 'relative', zIndex: 1, padding: '0 28px' }}>
          {top5.map((member, idx) => (
            <div key={member.user_id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: idx === 0 ? 'rgba(250,204,21,0.2)' : 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '10px 14px',
              marginBottom: '8px',
              border: idx === 0 ? '1.5px solid rgba(250,204,21,0.5)' : '1px solid rgba(255,255,255,0.15)',
            }}>
              <div style={{ fontSize: '20px', width: '28px', textAlign: 'center' }}>
                {medals[idx]}
              </div>
              <div style={{
                width: '40px', height: '40px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1.5px solid rgba(255,255,255,0.3)',
                flexShrink: 0,
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={member.avatar_url ?? '/avatars/vini-jr.png'}
                  alt={member.username}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  crossOrigin="anonymous"
                />
              </div>
              <div style={{ flex: 1, fontSize: '16px', fontWeight: '800', color: idx === 0 ? '#facc15' : 'white' }}>
                {member.username}
              </div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: idx === 0 ? '#facc15' : 'white', lineHeight: 1 }}>
                {member.points_total}
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', marginLeft: '3px' }}>pts</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute', bottom: '24px', left: 0, right: 0,
          textAlign: 'center', zIndex: 1,
        }}>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
            palpite-cup.vercel.app
          </div>
        </div>
      </div>
    </div>
  )
}
