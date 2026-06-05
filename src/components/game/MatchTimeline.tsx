"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import EventCard from './EventCard'
import { Database } from '@/types/database'

type MatchEvent = Database['public']['Tables']['match_events']['Row'];

export default function MatchTimeline({ gameId }: { gameId: string }) {
  const [events, setEvents] = useState<MatchEvent[]>([])

  useEffect(() => {
    supabase
      .from('match_events')
      .select('*')
      .eq('game_id', gameId)
      .order('minute', { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
           setEvents(data);
        }
      })

    const channel = supabase
      .channel(`game-${gameId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'match_events',
        filter: `game_id=eq.${gameId}`
      }, (payload) => {
        setEvents(prev => [payload.new as MatchEvent, ...prev].sort((a, b) => b.minute - a.minute))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [gameId])

  return (
    <div className="relative px-4 py-8 overflow-hidden min-h-[400px]">
      <div className="absolute left-1/2 top-0 bottom-0 w-px border-l-2 border-dashed border-slate-300 -translate-x-1/2" />
      <div className="flex flex-col gap-6 relative">
        {events.map(event => (
          <EventCard key={event.id} {...event} />
        ))}
        {events.length === 0 && (
           <div className="text-center text-slate-400 bg-white p-4 rounded-2xl shadow-sm z-10 w-3/4 mx-auto border border-slate-200 mt-10">
             Eventos da partida aparecerão aqui ao vivo. ⚽
           </div>
        )}
      </div>
    </div>
  )
}
