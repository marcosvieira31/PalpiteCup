"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function useUnreadCount(groupId: number | string, userId: string) {
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchUnread = async () => {
    // Busca último timestamp de leitura
    const { data: status } = await supabase
      .from('chat_read_status')
      .select('last_read_at')
      .eq('group_id', String(groupId))
      .eq('user_id', userId)
      .single()

    const lastReadAt = status?.last_read_at ?? '1970-01-01'

    // Conta mensagens novas desde a última leitura
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', String(groupId))
      .neq('user_id', userId)
      .gt('created_at', lastReadAt)

    setUnreadCount(count ?? 0)
  }

  const markAsRead = async () => {
    await supabase
      .from('chat_read_status')
      .upsert({
        user_id: userId,
        group_id: String(groupId),
        last_read_at: new Date().toISOString()
      }, { onConflict: 'user_id,group_id' })
    setUnreadCount(0)
  }

  useEffect(() => {
    if (!userId) return
    fetchUnread()

    // Escuta mensagens novas em tempo real
    const channel = supabase
      .channel(`unread-${groupId}-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `group_id=eq.${groupId}`
      }, (payload) => {
        if (payload.new.user_id !== userId) {
          setUnreadCount(prev => prev + 1)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [groupId, userId])

  return { unreadCount, markAsRead }
}
