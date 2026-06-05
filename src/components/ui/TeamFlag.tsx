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
      style={{ width: size, height: size, minWidth: size }}>
      {team?.substring(0, 2).toUpperCase()}
    </div>
  )

  return (
    <div className={`rounded-full overflow-hidden border border-slate-200 flex-shrink-0 ${className}`}
      style={{ width: size, height: size, minWidth: size }}>
      <img
        src={flagUrl}
        alt={team}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  )
}
