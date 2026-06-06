import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import GroupsForm from '@/components/groups/GroupsForm'

export default async function GroupsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: myGroups } = await supabase
    .from('group_members')
    .select('group_id, groups(id, name, invite_code)')
    .eq('user_id', user?.id ?? '')

  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-slate-50 px-4 pt-8 pb-24">
      <h1 className="font-bebas text-3xl tracking-widest text-slate-800 mb-6">Meus Grupos</h1>
      
      {myGroups && myGroups.length > 0 && (
        <div className="mb-6">
          <div className="space-y-2">
            {myGroups.map(m => (
              <Link key={m.group_id} href={`/group/${m.group_id}`}>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 flex justify-between items-center">
                  <span className="font-bold text-slate-800">{(m.groups as { name?: string })?.name}</span>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-lg font-mono">
                    {(m.groups as { invite_code?: string })?.invite_code}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Link href="/groups/public"
        className="block w-full bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 text-center mb-4">
        <p className="font-bebas text-lg tracking-wider text-blue-700">🌐 VER GRUPOS PÚBLICOS</p>
        <p className="text-xs text-blue-500 mt-0.5">Encontre e entre em grupos abertos</p>
      </Link>

      <GroupsForm />
    </div>
  )
}
