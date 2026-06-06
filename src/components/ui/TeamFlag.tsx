"use client"
import { useState, useEffect } from 'react'
import { getFlagUrl } from '@/lib/flags'

interface Props {
  team: string
  size?: number
  className?: string
}

export default function TeamFlag({ team, size = 40, className = '' }: Props) {
  const [imgError, setImgError] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setImgError(false)
  }, [team])

  const flagUrl = getFlagUrl(team, size)

  const Fallback = () => (
    <div
      className={`bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 flex-shrink-0 ${className}`}
      style={{ width: size, height: size, minWidth: size, fontSize: size * 0.28 }}>
      {team?.substring(0, 3).toUpperCase()}
    </div>
  )

  if (!mounted || !flagUrl || imgError) return <Fallback />

  return (
    <div
      className={`rounded-full overflow-hidden border border-slate-200 flex-shrink-0 ${className}`}
      style={{ width: size, height: size, minWidth: size }}
      suppressHydrationWarning>
      <img
        src={flagUrl}
        alt={team}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={() => setImgError(true)}
        suppressHydrationWarning
      />
    </div>
  )
}
