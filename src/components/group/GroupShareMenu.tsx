"use client"
import { useState } from 'react'
import { generateRankingShareImage } from '@/components/share/RankingShareCard'
import { generateLiveBetsShareImage } from '@/components/group/LiveBetsShareCard'

interface Props {
  groupName: string
  hasLiveGame: boolean
}

type Step = 'closed' | 'choose-type' | 'choose-format'
type ShareType = 'ranking' | 'live'

export default function GroupShareMenu({ groupName, hasLiveGame }: Props) {
  const [step, setStep] = useState<Step>('closed')
  const [shareType, setShareType] = useState<ShareType | null>(null)
  const [generating, setGenerating] = useState(false)

  const reset = () => {
    setStep('closed')
    setShareType(null)
  }

  const handleChooseType = (type: ShareType) => {
    setShareType(type)
    setStep('choose-format')
  }

  const handleGenerate = async (fmt: 'story' | 'post') => {
    if (!shareType) return
    setGenerating(true)
    reset()
    if (shareType === 'ranking') {
      await generateRankingShareImage(fmt, groupName, false)
    } else {
      await generateLiveBetsShareImage(fmt, groupName)
    }
    setGenerating(false)
  }

  return (
    <div className="relative mt-3">
      <button
        onClick={() => setStep(step === 'closed' ? 'choose-type' : 'closed')}
        disabled={generating}
        className="w-full bg-gradient-to-r from-green-600 to-blue-900 text-white font-bebas tracking-wider rounded-xl py-3 text-sm disabled:opacity-50 active:scale-95 transition-transform flex items-center justify-center gap-2"
      >
        {generating ? '⏳ GERANDO...' : '📸 COMPARTILHAR'}
      </button>

      {step === 'choose-type' && !generating && (
        <div className="absolute bottom-14 left-0 right-0 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-10">
          {hasLiveGame && (
            <button
              onClick={() => handleChooseType('live')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 border-b border-slate-100"
            >
              <span className="text-2xl">🔴</span>
              <div className="text-left">
                <p className="font-bold text-slate-800 text-sm">Palpites Ao Vivo</p>
                <p className="text-xs text-slate-400">Palpites dos jogos em andamento</p>
              </div>
            </button>
          )}
          <button
            onClick={() => handleChooseType('ranking')}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
          >
            <span className="text-2xl">🏆</span>
            <div className="text-left">
              <p className="font-bold text-slate-800 text-sm">Ranking</p>
              <p className="text-xs text-slate-400">Classificação do grupo</p>
            </div>
          </button>
        </div>
      )}

      {step === 'choose-format' && !generating && (
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
  )
}
