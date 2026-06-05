import Image from 'next/image'
import { getFlagUrl } from '@/lib/flags'

interface Props {
  team: string
  size?: number
  className?: string
}

export default function TeamFlag({ team, size = 40, className = '' }: Props) {
  const flagUrl = getFlagUrl(team, size)

  if (!flagUrl) return (
    <div className={`bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-500 ${className}`}
      style={{ width: size, height: size }}>
      {team?.substring(0, 2).toUpperCase()}
    </div>
  )

  return (
    <div className={`rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}>
      <Image
        src={flagUrl}
        alt={team}
        width={size}
        height={size}
        className="w-full h-full object-cover"
        unoptimized
      />
    </div>
  )
}
