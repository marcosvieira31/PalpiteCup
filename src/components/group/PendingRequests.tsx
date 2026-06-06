"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { handleRequest } from '@/app/(app)/groups/actions'

interface Request {
  id: number
  user_id: string
  status: string
  users: { username: string; avatar_url: string | null }
}

export default function PendingRequests({ groupId }: { groupId: string | number }) {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState<number | null>(null)

  useEffect(() => {
    supabase
      .from('group_requests')
      .select('*, users(username, avatar_url)')
      .eq('group_id', String(groupId))
      .eq('status', 'pending')
      .then(({ data }) => setRequests((data as Request[]) ?? []))

    const channel = supabase
      .channel(`requests-${groupId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'group_requests',
        filter: `group_id=eq.${groupId}`
      }, () => {
        supabase.from('group_requests')
          .select('*, users(username, avatar_url)')
          .eq('group_id', String(groupId)).eq('status', 'pending')
          .then(({ data }) => setRequests((data as Request[]) ?? []))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [groupId])

  if (requests.length === 0) return null

  const handle = async (id: number, action: 'approved' | 'rejected') => {
    setLoading(id)
    await handleRequest(id, action)
    setRequests(prev => prev.filter(r => r.id !== id))
    setLoading(null)
  }

  return (
    <div className="bg-yellow-50 rounded-2xl border border-yellow-200 p-4 mb-4">
      <p className="font-bebas text-lg tracking-wider text-yellow-800 mb-3">
        ⏳ SOLICITAÇÕES PENDENTES ({requests.length})
      </p>
      <div className="space-y-3">
        {requests.map(req => (
          <div key={req.id} className="flex items-center gap-3 bg-white rounded-xl p-3">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 overflow-hidden flex-shrink-0">
              {req.users?.avatar_url
                ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={req.users.avatar_url} alt="" className="w-full h-full object-cover" />
                  </>
                )
                : req.users?.username?.substring(0, 2).toUpperCase()}
            </div>
            <p className="font-bold text-slate-800 text-sm flex-1">{req.users?.username}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handle(req.id, 'rejected')}
                disabled={loading === req.id}
                className="px-3 py-1.5 rounded-xl bg-red-100 text-red-600 font-bebas text-xs tracking-wider"
              >
                ✕
              </button>
              <button
                onClick={() => handle(req.id, 'approved')}
                disabled={loading === req.id}
                className="px-3 py-1.5 rounded-xl bg-green-500 text-white font-bebas text-xs tracking-wider"
              >
                ✓
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
