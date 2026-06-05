"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { GroupStanding } from '@/types/database'

export default function GruposTab() {
  const [standings, setStandings] = useState<GroupStanding[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('group_standings')
      .select('*')
      .order('group_name')
      .order('points', { ascending: false })
      .order('goal_diff', { ascending: false })
      .then(({ data }) => {
        setStandings(data ?? [])
        setLoading(false)
      })

    const channel = supabase
      .channel('standings-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'group_standings'
      }, () => {
        supabase.from('group_standings').select('*')
          .order('group_name').order('points', { ascending: false })
          .then(({ data }) => setStandings(data ?? []))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const groups = Array.from(new Set(standings.map(s => s.group_name))).sort()

  if (loading) return <p className="text-center text-slate-400 py-8">Carregando...</p>

  return (
    <div className="space-y-6">
      {groups.map(groupName => {
        const teams = standings.filter(s => s.group_name === groupName)
        return (
          <div key={groupName} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-green-500 px-4 py-2">
              <h3 className="font-bebas text-lg text-white tracking-widest">{groupName}</h3>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-2 text-slate-400 font-medium">Time</th>
                  <th className="text-center px-2 py-2 text-slate-400 font-medium">J</th>
                  <th className="text-center px-2 py-2 text-slate-400 font-medium">V</th>
                  <th className="text-center px-2 py-2 text-slate-400 font-medium">E</th>
                  <th className="text-center px-2 py-2 text-slate-400 font-medium">D</th>
                  <th className="text-center px-2 py-2 text-slate-400 font-medium">SG</th>
                  <th className="text-center px-2 py-2 text-green-700 font-bold">P</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team, idx) => (
                  <tr key={team.team}
                    className={`border-b border-slate-50 ${idx < 2 ? 'bg-green-50' : ''}`}>
                    <td className="px-4 py-2 font-medium text-slate-800 flex items-center gap-2">
                      {idx < 2 && <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />}
                      {idx === 2 && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />}
                      {idx === 3 && <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block" />}
                      {team.team}
                    </td>
                    <td className="text-center px-2 py-2 text-slate-600">{team.played}</td>
                    <td className="text-center px-2 py-2 text-slate-600">{team.wins}</td>
                    <td className="text-center px-2 py-2 text-slate-600">{team.draws}</td>
                    <td className="text-center px-2 py-2 text-slate-600">{team.losses}</td>
                    <td className="text-center px-2 py-2 text-slate-600">{team.goal_diff}</td>
                    <td className="text-center px-2 py-2 font-bold text-green-700">{team.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2 flex gap-4 text-[10px] text-slate-400">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Classificado</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" /> Possível vaga</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
