import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function MyGroupsPreview({ userId }: { userId: string }) {
  const supabase = await createClient()

  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id, groups(id, name, invite_code)')
    .eq('user_id', userId)
    .limit(3)

  if (!memberships || memberships.length === 0) return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-5 text-center">
      <p className="text-slate-400 text-sm">Você não está em nenhum grupo ainda.</p>
      <Link href="/groups"
        className="mt-2 inline-block text-green-600 font-bold text-sm">
        + Criar ou entrar em um grupo →
      </Link>
    </div>
  )

  return (
    <div className="space-y-3">
      {memberships.map(m => {
        const group = m.groups as unknown as { id: string; name: string; invite_code: string } | null
        if (!group) return null
        return (
          <Link key={m.group_id} href={`/group/${m.group_id}`} className="block">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex justify-between items-center active:scale-95 transition-transform">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <span className="text-xl">👥</span>
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{group.name}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{group.invite_code}</p>
                </div>
              </div>
              <span className="text-slate-300 text-xl">›</span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
