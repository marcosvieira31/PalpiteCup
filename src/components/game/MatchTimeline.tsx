"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import EventCard from './EventCard'
import { Database } from '@/types/database'

type MatchEvent = Database['public']['Tables']['match_events']['Row'];

const mockEvents: MatchEvent[] = [
  { id: '1', game_id: 'mock', type: 'goal', minute: 45, team: 'Brasil', player_name: 'Vinicius Jr.', assist_name: 'Rodrygo', player_out: null, created_at: '' },
  { id: '2', game_id: 'mock', type: 'yellow_card', minute: 34, team: 'Argentina', player_name: 'De Paul', assist_name: null, player_out: null, created_at: '' },
  { id: '3', game_id: 'mock', type: 'substitution', minute: 25, team: 'Brasil', player_name: 'Endrick', player_out: 'Richarlison', assist_name: null, created_at: '' },
  { id: '4', game_id: 'mock', type: 'goal', minute: 12, team: 'Argentina', player_name: 'Messi', assist_name: 'Di María', player_out: null, created_at: '' },
]

export default function MatchTimeline({ gameId }: { gameId: string }) {
  const [events, setEvents] = useState<MatchEvent[]>(mockEvents)

  useEffect(() => {
    // Fetch initial
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
             Nenhum evento registrado.
           </div>
        )}
      </div>
    </div>
  )
}
