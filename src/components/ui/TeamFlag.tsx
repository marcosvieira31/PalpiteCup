"use client"
import { useState } from 'react'
import { getFlagUrl } from '@/lib/flags'

interface Props {
  team: string
  size?: number
  className?: string
}

export default function TeamFlag({ team, size = 40, className = '' }: Props) {
  const [error, setError] = useState(false)
  const flagUrl = getFlagUrl(team, size)

  if (!flagUrl || error) return (
    <div className={`bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500 flex-shrink-0 ${className}`}
      style={{ width: size, height: size, minWidth: size }}>
      {team?.substring(0, 3).toUpperCase()}
    </div>
  )

  return (
    <div className={`rounded-full overflow-hidden border border-slate-200 flex-shrink-0 ${className}`}
      style={{ width: size, height: size, minWidth: size }}>
      <img
        src={flagUrl}
        alt={team}
        width={size}
        height={size}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={() => setError(true)}
      />
    </div>
  )
}
