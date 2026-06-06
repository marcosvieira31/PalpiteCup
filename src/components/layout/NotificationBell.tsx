"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NotificationBell({ userId }: { userId: string }) {
  const [count, setCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)
      setNotifications(data ?? [])
      setCount(data?.filter(n => !n.read).length ?? 0)
    }
    fetch()

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, () => fetch())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  const markAllRead = async () => {
    await supabase.from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
    setCount(0)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleNotification = async (n: any) => {
    if (!n.read) {
      await supabase.from('notifications').update({ read: true }).eq('id', n.id)
      setCount(prev => Math.max(0, prev - 1))
    }
    if (n.data?.group_id) router.push(`/group/${n.data.group_id}`)
    setOpen(false)
  }

  return (
    <div className="relative z-50">
      <button
        onClick={() => { setOpen(!open); if (!open) markAllRead() }}
        className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white relative"
      >
        🔔
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
          <div className="p-3 border-b border-slate-100 flex justify-between items-center">
            <p className="font-bebas tracking-wider text-slate-700">NOTIFICAÇÕES</p>
            <button onClick={() => setOpen(false)} className="text-slate-400 text-lg leading-none">×</button>
          </div>
          {notifications.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-6">Nenhuma notificação</p>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {notifications.map(n => (
                <button key={n.id} onClick={() => handleNotification(n)}
                  className={`w-full text-left p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-blue-50' : ''}`}>
                  <p className="font-bold text-slate-800 text-sm">{n.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
