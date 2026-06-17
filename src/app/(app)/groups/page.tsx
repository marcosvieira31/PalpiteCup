import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import GroupsActions from '@/components/groups/GroupsActions'

export default async function GroupsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: myGroups } = await supabase
    .from('group_members')
    .select('group_id, groups(id, name, invite_code, type)')
    .eq('user_id', user?.id ?? '')

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-green-500 px-4 pt-6 pb-6"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.12) 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }}>
        <h1 className="font-bebas text-4xl text-yellow-400 tracking-widest"
          style={{ textShadow: '2px 2px 0 #1e3a8a' }}>
          GRUPOS
        </h1>
        <p className="text-white text-sm mt-1">Seus bolões da Copa</p>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Botões de ação */}
        <GroupsActions />

        {/* Ranking Global */}
        <Link href="/groups/global" className="block mt-1">
          <div className="bg-blue-900 rounded-2xl shadow-sm p-4 flex justify-between items-center active:scale-95 transition-transform">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-xl">
                🏆
              </div>
              <div>
                <p className="font-bold text-yellow-400 text-sm">Ranking Global</p>
                <p className="text-xs text-blue-200 mt-0.5">Todos os usuários do PalpiteCup</p>
              </div>
            </div>
            <span className="text-blue-300 text-xl">›</span>
          </div>
        </Link>

        {/* Meus grupos */}
        {myGroups && myGroups.length > 0 ? (
          <div className="space-y-3 mt-2">
            <p className="font-bebas text-lg tracking-widest text-slate-600 uppercase">
              Meus Grupos ({myGroups.length})
            </p>
            {myGroups.map(m => {
              const group = m.groups as { id: number; name: string; invite_code: string; type: string } | null
              if (!group) return null
              const typeIcon = group.type === 'open' ? '🌐' : group.type === 'moderated' ? '👋' : '🔒'
              return (
                <Link key={m.group_id} href={`/group/${m.group_id}`} className="block">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex justify-between items-center active:scale-95 transition-transform">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-xl">
                        {typeIcon}
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
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-6 text-center mt-2">
            <p className="text-3xl mb-2">👥</p>
            <p className="text-slate-500 text-sm font-medium">Você não está em nenhum grupo.</p>
            <p className="text-slate-400 text-xs mt-1">Crie um ou entre em um grupo público!</p>
          </div>
        )}
      </div>
    </div>
  )
}
