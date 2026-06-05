import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function MyGroupsPreview({ userId }: { userId: string }) {
  const supabase = await createClient()

  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id, groups(id, name)')
    .eq('user_id', userId)
    .limit(3)

  if (!memberships || memberships.length === 0) return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
      <p className="text-slate-400 text-sm">Você não está em nenhum grupo ainda.</p>
      <Link href="/groups" className="text-green-600 font-bold text-sm mt-2 block">
        + Criar ou entrar em um grupo →
      </Link>
    </div>
  )

  return (
    <div className="space-y-3">
      {memberships.map(m => (
        <Link key={m.group_id} href={`/group/${m.group_id}`}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex justify-between items-center">
            <div>
              <p className="font-bold text-slate-800 text-sm">{(m.groups as { name?: string })?.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">Ver ranking →</p>
            </div>
            <div className="bg-green-50 rounded-xl px-3 py-2 text-center">
              <p className="font-bebas text-2xl text-green-700 leading-none">🏆</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
