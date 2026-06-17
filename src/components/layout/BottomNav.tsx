"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Tv2, Zap, Users, User } from 'lucide-react'
import clsx from 'clsx'

const tabs = [
  { href: '/dashboard', label: 'HOME', icon: Home },
  { href: '/jogos', label: 'JOGOS', icon: Tv2 },
  { href: '/palpites', label: 'PALPITAR', icon: Zap, highlight: true },
  { href: '/groups', label: 'GRUPOS', icon: Users },
  { href: '/profile', label: 'PERFIL', icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white border-t border-slate-200 z-50">
      <div className="flex items-end justify-around px-2 pb-4 pt-2">
        {tabs.map(({ href, label, icon: Icon, highlight }) => {
          const active = pathname?.startsWith(href)
          if (highlight) return (
            <Link key={href} href={href} className="flex flex-col items-center -mt-6">
              <div className={clsx(
                'w-14 h-14 rounded-full flex items-center justify-center border-4 border-slate-50',
                active ? 'bg-yellow-400' : 'bg-blue-900'
              )}>
                <Icon size={24} color={active ? '#1e3a8a' : '#facc15'} />
              </div>
              <span className={clsx(
                'text-[9px] font-bold tracking-wider mt-1',
                active ? 'text-blue-900' : 'text-slate-400'
              )}>{label}</span>
            </Link>
          )
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-1 flex-1 py-1">
              <Icon size={20} color={active ? '#15803d' : '#94a3b8'} />
              <span className={clsx(
                'text-[9px] font-bold tracking-wider uppercase',
                active ? 'text-green-700' : 'text-slate-400'
              )}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
