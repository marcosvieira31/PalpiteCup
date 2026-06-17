"use client"
import { useEffect, useState } from 'react'
import { getTimeLeft } from '@/lib/deadlines'

interface Props {
  deadline: Date
  label: string
  variant?: 'banner' | 'compact' | 'card' | 'mini'
  onExpire?: () => void
}

export default function Countdown({ deadline, label, variant = 'banner', onExpire }: Props) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(deadline))

  useEffect(() => {
    const timer = setInterval(() => {
      const tl = getTimeLeft(deadline)
      setTimeLeft(tl)
      if (tl.expired) {
        clearInterval(timer)
        onExpire?.()
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [deadline, onExpire])

  if (variant === 'compact') return (
    <span className={`text-xs font-bold ${timeLeft.expired ? 'text-red-500' : 'text-yellow-300'}`}>
      {timeLeft.expired ? '🔒 ENCERRADO' : `⏱ ${timeLeft.label}`}
    </span>
  )

  if (variant === 'card') return (
    <div className={`rounded-2xl p-4 ${
      timeLeft.expired
        ? 'bg-red-50 border border-red-100'
        : timeLeft.days === 0
        ? 'bg-orange-50 border border-orange-200'
        : 'bg-blue-50 border border-blue-100'
    }`}>
      <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${
        timeLeft.expired ? 'text-red-600' : timeLeft.days === 0 ? 'text-orange-600' : 'text-blue-600'
      }`}>
        {timeLeft.expired ? '🔒' : '⏱'} {label}
      </p>
      {timeLeft.expired ? (
        <p className="font-bebas text-xl text-red-600 tracking-wider">PALPITES ENCERRADOS</p>
      ) : (
        <div className="flex gap-3">
          {timeLeft.days > 0 && (
            <div className="text-center">
              <p className={`font-bebas text-3xl leading-none ${timeLeft.days === 0 ? 'text-orange-600' : 'text-blue-700'}`}>
                {String(timeLeft.days).padStart(2, '0')}
              </p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">dias</p>
            </div>
          )}
          <div className="text-center">
            <p className={`font-bebas text-3xl leading-none ${timeLeft.days === 0 ? 'text-orange-600' : 'text-blue-700'}`}>
              {String(timeLeft.hours).padStart(2, '0')}
            </p>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">horas</p>
          </div>
          <div className="font-bebas text-3xl text-slate-300 leading-none">:</div>
          <div className="text-center">
            <p className={`font-bebas text-3xl leading-none ${timeLeft.days === 0 ? 'text-orange-600' : 'text-blue-700'}`}>
              {String(timeLeft.minutes).padStart(2, '0')}
            </p>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">min</p>
          </div>
          <div className="font-bebas text-3xl text-slate-300 leading-none">:</div>
          <div className="text-center">
            <p className={`font-bebas text-3xl leading-none ${timeLeft.days === 0 ? 'text-orange-600' : 'text-blue-700'}`}>
              {String(timeLeft.seconds).padStart(2, '0')}
            </p>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">seg</p>
          </div>
        </div>
      )}
    </div>
  )

  if (variant === 'mini') return (
    <div className={`rounded-xl px-3 py-2 flex items-center justify-between ${
      timeLeft.expired
        ? 'bg-red-50 border border-red-100'
        : timeLeft.days === 0
        ? 'bg-orange-50 border border-orange-200'
        : 'bg-blue-50 border border-blue-100'
    }`}>
      <p className={`text-[11px] font-bold uppercase tracking-wide truncate pr-2 ${
        timeLeft.expired ? 'text-red-600' : timeLeft.days === 0 ? 'text-orange-600' : 'text-blue-600'
      }`}>
        {timeLeft.expired ? '🔒' : '⏱'} {label}
      </p>
      {timeLeft.expired ? (
        <p className="font-bebas text-sm text-red-600 tracking-wider whitespace-nowrap">ENCERRADO</p>
      ) : (
        <p className={`font-bebas text-base tracking-wider whitespace-nowrap ${
          timeLeft.days === 0 ? 'text-orange-600' : 'text-blue-700'
        }`}>
          {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}{String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </p>
      )}
    </div>
  )

  // Banner (default)
  return (
    <div className={`px-4 py-2 flex justify-between items-center ${
      timeLeft.expired ? 'bg-red-600'
      : timeLeft.days === 0 ? 'bg-orange-500'
      : 'bg-blue-900'
    }`}>
      <p className="text-white text-xs font-bold">{timeLeft.expired ? '🔒' : '⏱'} {label}</p>
      <p className={`font-bebas tracking-wider text-sm ${
        timeLeft.expired ? 'text-white' : 'text-yellow-400'
      }`}>
        {timeLeft.expired ? 'ENCERRADO' : timeLeft.label}
      </p>
    </div>
  )
}
