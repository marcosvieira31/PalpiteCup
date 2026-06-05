/* eslint-disable @next/next/no-img-element */
import Header from "@/components/layout/Header";
import { Settings, HelpCircle, ChevronRight } from "lucide-react";
import LogoutButton from "@/components/profile/LogoutButton";
import { createClient } from '@/lib/supabase/server';

export default async function Perfil() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let badges: { slug: string; earned_at?: string }[] = [];
  let dbUser = null;
  if (user) {
    const { data: userBadges } = await supabase.from('badges').select('*').eq('user_id', user.id);
    badges = userBadges || [];

    const { data } = await supabase.from('users').select('username, avatar_url').eq('id', user.id).single();
    dbUser = data;
  }

  const badgeMap = [
    { slug: 'vidente', icon: '🔮', label: 'Vidente', desc: '3 placares exatos numa rodada' },
    { slug: 'atrasildo', icon: '⏰', label: 'Atrasildo', desc: 'Palpitou nos últimos 5 minutos' },
    { slug: 'cazador_zebras', icon: '🦓', label: 'Caçador de Zebras', desc: 'Acertou uma zebra' },
  ];

  return (
    <main className="min-h-screen bg-background pb-24">
      <Header title="MEU PERFIL" />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-bebas text-3xl shadow-sm overflow-hidden">
            {dbUser?.avatar_url ? <img src={dbUser.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : (dbUser?.username || "V").substring(0, 1).toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-800">{dbUser?.username || "Você"}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Minhas Conquistas</h3>
          <div className="flex gap-3 overflow-x-auto pb-4 px-2 snap-x">
            {badgeMap.map(b => {
              const hasBadge = badges.find(ub => ub.slug === b.slug);
              return (
                <div key={b.slug} className={`snap-center flex-shrink-0 w-32 p-3 rounded-2xl border flex flex-col items-center text-center gap-2 ${hasBadge ? 'bg-white border-yellow-400 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-60 grayscale'}`}>
                  <span className="text-3xl">{hasBadge ? b.icon : '🔒'}</span>
                  <span className="font-bold text-xs text-slate-800 leading-tight">{b.label}</span>
                  <p className="text-[9px] text-slate-500 leading-tight">{b.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Configurações</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Settings className="text-gray-400" size={20} />
                <span className="font-medium text-gray-700 text-sm">Editar Perfil</span>
              </div>
              <ChevronRight className="text-gray-300" size={20} />
            </button>
            <button className="w-full flex items-center justify-between p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <HelpCircle className="text-gray-400" size={20} />
                <span className="font-medium text-gray-700 text-sm">Regras de Pontuação</span>
              </div>
              <ChevronRight className="text-gray-300" size={20} />
            </button>
          <div className="p-4">
            <LogoutButton />
          </div>
        </div>
        </section>

      </div>
    </main>
  );
}
