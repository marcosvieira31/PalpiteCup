import { createClient } from '@/lib/supabase/server'
import CopaGameRow from '@/components/game/CopaGameRow'
import { Game } from '@/types/database'

export default async function CopaPage() {
  const supabase = await createClient()

  const { data: games } = await supabase
    .from('games')
    .select('*')
    .order('kickoff_at')

  // Agrupar por group_stage
  const grouped = (games ?? []).reduce((acc, game) => {
    const key = game.group_stage ?? 'Fase Final'
    if (!acc[key]) acc[key] = []
    acc[key].push(game as Game)
    return acc
  }, {} as Record<string, Game[]>)

  return (
    <div className="pb-24">
      <div className="bg-green-500 px-4 pt-6 pb-8"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.12) 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }}>
        <h1 className="font-bebas text-4xl text-yellow-400 tracking-widest"
          style={{ textShadow: '2px 2px 0 #1e3a8a' }}>
          COPA 2026
        </h1>
        <p className="text-white text-sm mt-1">Todos os 104 jogos da competição</p>
      </div>

      <div className="px-4 mt-6 space-y-8">
        {Object.entries(grouped).map(([groupName, groupGames]) => (
          <section key={groupName}>
            <h2 className="font-bebas text-2xl tracking-widest text-slate-800 mb-4 uppercase">
              {groupName}
            </h2>
            <div className="space-y-3">
              {groupGames.map(game => (
                <CopaGameRow key={game.id} game={game} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
