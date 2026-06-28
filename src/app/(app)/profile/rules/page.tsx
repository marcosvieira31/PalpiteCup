import Link from 'next/link'

const rules = [
  {
    icon: '🎯',
    title: 'Placar Exato',
    points: 5,
    description: 'Acertou o resultado exato do jogo.',
    color: 'bg-green-50 border-green-200',
    textColor: 'text-green-700',
  },
  {
    icon: '✅',
    title: 'Vencedor + Diferença',
    points: 3,
    description: 'Acertou quem venceu e a diferença de gols. Em empates: qualquer placar empatado (ex: 1×1, 0×0) vale 3 pts.',
    color: 'bg-blue-50 border-blue-200',
    textColor: 'text-blue-700',
  },
  {
    icon: '👍',
    title: 'Apenas o Vencedor',
    points: 1,
    description: 'Acertou quem venceu mas errou a diferença de gols. Não se aplica em empates.',
    color: 'bg-slate-50 border-slate-200',
    textColor: 'text-slate-700',
  },
]



export default function RulesPage() {
  return (
    <div className="pb-24">
      <div className="bg-blue-900 px-4 pt-6 pb-6"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }}>
        <Link href="/profile" className="text-white/60 text-sm mb-3 flex items-center gap-1">
          ‹ Voltar
        </Link>
        <h1 className="font-bebas text-4xl text-yellow-400 tracking-widest"
          style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>
          REGRAS
        </h1>
        <p className="text-blue-200 text-sm mt-1">Como funcionam os pontos</p>
      </div>

      <div className="px-4 mt-6 space-y-6">

        {/* Palpites de Jogos */}
        <section>
          <h2 className="font-bebas text-2xl tracking-widest text-slate-700 mb-3">
            ⚽ PALPITES DE JOGOS
          </h2>
          <div className="space-y-3">
            {rules.map(rule => (
              <div key={rule.title} className={`rounded-2xl border p-4 ${rule.color}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{rule.icon}</span>
                    <div>
                      <p className={`font-bold text-sm ${rule.textColor}`}>{rule.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{rule.description}</p>
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <p className={`font-bebas text-2xl ${rule.textColor}`}>
                      {rule.multiplier ? '×2' : `+${rule.points}`}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {rule.multiplier ? 'multiplicador' : 'pontos'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Exemplo prático */}
        <section className="bg-slate-800 rounded-2xl p-4">
          <h3 className="font-bebas text-lg text-yellow-400 tracking-wider mb-3">
            💡 EXEMPLO PRÁTICO
          </h3>
          <div className="space-y-2 text-sm text-slate-300">
            <p className="text-slate-400 text-xs mb-3">Jogo: Brasil 2 × 1 Argentina</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <span>🎯</span>
                  <span>Palpite <span className="text-green-400 font-bold">2×1</span></span>
                </div>
                <span className="text-yellow-400 font-bold">+5 pts</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <span>✅</span>
                  <div>
                    <span>Palpite <span className="text-blue-300 font-bold">3×2</span></span>
                    <p className="text-[10px] text-slate-500">vencedor + diferença de 1 gol</p>
                  </div>
                </div>
                <span className="text-yellow-400 font-bold">+3 pts</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <span>✅</span>
                  <div>
                    <span>Palpite <span className="text-blue-300 font-bold">1×0</span></span>
                    <p className="text-[10px] text-slate-500">vencedor + diferença de 1 gol</p>
                  </div>
                </div>
                <span className="text-yellow-400 font-bold">+3 pts</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <span>👍</span>
                  <div>
                    <span>Palpite <span className="text-slate-300 font-bold">2×0</span></span>
                    <p className="text-[10px] text-slate-500">só o vencedor (diferença errada)</p>
                  </div>
                </div>
                <span className="text-yellow-400 font-bold">+1 pt</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <span>❌</span>
                  <div>
                    <span>Palpite <span className="text-red-400 font-bold">0×1</span></span>
                    <p className="text-[10px] text-slate-500">errou o vencedor</p>
                  </div>
                </div>
                <span className="text-slate-500 font-bold">0 pts</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <span>❌</span>
                  <div>
                    <span>Palpite <span className="text-red-400 font-bold">1×1</span></span>
                    <p className="text-[10px] text-slate-500">errou o vencedor (palpitou empate)</p>
                  </div>
                </div>
                <span className="text-slate-500 font-bold">0 pts</span>
              </div>
            </div>
          </div>

          {/* Exemplo de empate */}
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-slate-400 text-xs mb-3">Jogo com empate: França 2 × 2 Alemanha</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <span>🎯</span>
                  <span>Palpite <span className="text-green-400 font-bold">2×2</span></span>
                </div>
                <span className="text-yellow-400 font-bold">+5 pts</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <span>✅</span>
                  <div>
                    <span>Palpite <span className="text-blue-300 font-bold">1×1</span></span>
                    <p className="text-[10px] text-slate-500">empate + diferença zero</p>
                  </div>
                </div>
                <span className="text-yellow-400 font-bold">+3 pts</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <span>✅</span>
                  <div>
                    <span>Palpite <span className="text-blue-300 font-bold">0×0</span></span>
                    <p className="text-[10px] text-slate-500">empate + diferença zero</p>
                  </div>
                </div>
                <span className="text-yellow-400 font-bold">+3 pts</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <div className="flex items-center gap-2">
                  <span>❌</span>
                  <div>
                    <span>Palpite <span className="text-red-400 font-bold">2×1</span></span>
                    <p className="text-[10px] text-slate-500">errou — palpitou vitória</p>
                  </div>
                </div>
                <span className="text-slate-500 font-bold">0 pts</span>
              </div>
            </div>
          </div>
        </section>

        {/* Palpites de Grupos */}
        <section>
          <h2 className="font-bebas text-2xl tracking-widest text-slate-700 mb-3">
            📊 PALPITES DE GRUPOS
          </h2>
          <div className="space-y-3">
            {[
              { icon: '🥇', title: '1º Colocado Exato', points: 5, desc: 'Acertou o 1º do grupo' },
              { icon: '🎯', title: 'Posição Exata', points: 3, desc: 'Acertou a posição exata de um time' },
              { icon: '✅', title: 'Classificado (Top 2)', points: 1, desc: 'Acertou se o time se classificou' },
            ].map(rule => (
              <div key={rule.title} className="bg-blue-50 rounded-2xl border border-blue-100 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{rule.icon}</span>
                  <div>
                    <p className="font-bold text-sm text-blue-800">{rule.title}</p>
                    <p className="text-xs text-slate-500">{rule.desc}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bebas text-2xl text-blue-700">+{rule.points}</p>
                  <p className="text-[10px] text-slate-400">pontos</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bracket */}
        <section>
          <h2 className="font-bebas text-2xl tracking-widest text-slate-700 mb-3">
            ⚔️ BRACKET MATA-MATA
          </h2>
          <div className="space-y-2">
            {[
              { round: 'Fase de 32', points: 2 },
              { round: 'Oitavas de Final', points: 3 },
              { round: 'Quartas de Final', points: 5 },
              { round: 'Semifinal', points: 8 },
              { round: 'Finalista', points: 15 },
              { round: 'Campeão', points: 30 },
            ].map(rule => (
              <div key={rule.round} className="bg-white rounded-2xl border border-slate-200 p-3 flex justify-between items-center">
                <p className="font-bold text-slate-800 text-sm">{rule.round}</p>
                <div className="text-right">
                  <p className="font-bebas text-xl text-blue-900">+{rule.points}</p>
                  <p className="text-[10px] text-slate-400">pontos</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Até onde vai */}
        <section>
          <h2 className="font-bebas text-2xl tracking-widest text-slate-700 mb-3">
            🗺️ ATÉ ONDE VAI
          </h2>
          <div className="space-y-3">
            {[
              { icon: '🎯', title: 'Fase Exata', points: 5, desc: 'Acertou exatamente até onde a seleção foi' },
              { icon: '✅', title: 'Passou da Fase de Grupos', points: 2, desc: 'Acertou se a seleção se classificou' },
            ].map(rule => (
              <div key={rule.title} className="bg-green-50 rounded-2xl border border-green-100 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{rule.icon}</span>
                  <div>
                    <p className="font-bold text-sm text-green-800">{rule.title}</p>
                    <p className="text-xs text-slate-500">{rule.desc}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bebas text-2xl text-green-700">+{rule.points}</p>
                  <p className="text-[10px] text-slate-400">pontos</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Desempate */}
        <section className="bg-green-50 rounded-2xl border border-green-100 p-4">
          <h3 className="font-bebas text-lg text-green-700 tracking-wider mb-2">
            🤝 CRITÉRIO DE DESEMPATE
          </h3>
          <div className="space-y-1 text-xs text-green-700">
            <p>1. Maior número de pontos totais</p>
            <p>2. Maior número de placares exatos</p>
            <p>3. Maior número de acertos do vencedor</p>
            <p>4. Palpite mais recente (desempate final)</p>
          </div>
        </section>

      </div>
    </div>
  )
}
