import { Bell, Search, Zap } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-background pb-24">
      {/* TOP GREEN SECTION */}
      <div className="bg-primary bg-halftone px-4 pt-12 pb-8 shadow-sm relative">
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col">
            <h1 className="font-bebas text-5xl text-accent tracking-wider leading-none drop-shadow-md">BOLÃO</h1>
            <h1 className="font-bebas text-5xl text-white tracking-wider leading-none flex items-center gap-2 drop-shadow-md">
              <span className="text-4xl">⚽</span> CUP
            </h1>
            <div className="mt-2 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full w-max flex items-center gap-1.5 shadow-sm">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> AO VIVO • 45+2'
            </div>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white backdrop-blur-md">
              <Search size={18} />
            </button>
            <button className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white backdrop-blur-md">
              <Bell size={18} />
            </button>
          </div>
        </div>

        {/* FEATURED MATCH CARD */}
        <div className="border border-white/30 rounded-3xl p-5 bg-white/10 backdrop-blur-sm text-white shadow-lg">
          <p className="text-[10px] text-center font-bold tracking-widest uppercase mb-5 opacity-90 flex items-center justify-center gap-1">
            <span>🏆</span> COPA DO MUNDO • FASE DE GRUPOS • GRUPO G
          </p>
          
          <div className="flex items-center justify-between px-2">
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full border-2 border-white bg-white/20 flex items-center justify-center font-bebas text-3xl shadow-sm">BR</div>
              <span className="font-bold text-sm tracking-wide">Brasil</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-3">
                <div className="w-14 h-12 bg-[#2b2b2b] rounded-xl flex items-center justify-center font-bebas text-3xl shadow-inner">2</div>
                <span className="text-white/60 text-sm font-bold">x</span>
                <div className="w-14 h-12 bg-[#2b2b2b] rounded-xl flex items-center justify-center font-bebas text-3xl shadow-inner">1</div>
              </div>
              <p className="text-[9px] font-bold mt-3 opacity-80 uppercase text-center tracking-wider leading-tight">
                LUSAIL -<br/>21:00
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full border-2 border-white bg-white/20 flex items-center justify-center font-bebas text-3xl shadow-sm">AR</div>
              <span className="font-bold text-sm tracking-wide">Argentina</span>
            </div>
          </div>
          
          <button className="w-full mt-6 bg-[#22c55e] border border-white/30 hover:bg-green-600 text-white font-bold py-4 rounded-full transition-all flex items-center justify-center gap-2 shadow-sm text-xs uppercase tracking-widest">
            <Zap size={16} className="text-accent fill-accent" /> CONFIRMAR PALPITE
          </button>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="px-4 mt-8 space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="font-barlow font-black text-3xl leading-none text-slate-800">Jogos de<br/>Hoje</h2>
          <button className="text-sm font-bold text-primary flex items-center gap-1 hover:text-green-700 transition-colors">
            Ver todos <span className="text-xs">❯</span>
          </button>
        </div>
        
        {/* FILTERS */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex flex-col items-center gap-1 min-w-[60px]">
            <div className="w-14 h-14 rounded-full bg-white border-2 border-green-200 flex items-center justify-center shadow-sm">🏆</div>
            <span className="text-[10px] font-medium text-slate-500">Copa</span>
          </div>
          <div className="flex flex-col items-center gap-1 min-w-[60px]">
            <div className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">🌍</div>
            <span className="text-[10px] font-medium text-slate-500">Grupos</span>
          </div>
          <div className="flex flex-col items-center gap-1 min-w-[60px]">
            <div className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">⚔️</div>
            <span className="text-[10px] font-medium text-slate-500">Oitavas</span>
          </div>
          <div className="flex flex-col items-center gap-1 min-w-[60px]">
            <div className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">🔥</div>
            <span className="text-[10px] font-medium text-slate-500">Quartas</span>
          </div>
        </div>
        
        {/* MATCH CARDS LIST */}
        <div className="space-y-4">
          
          {/* Card 1 */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-300 text-sm">FR</div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-800 text-sm">França</span>
                <span className="text-[10px] text-slate-400 font-medium">Gr. D</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <div className="w-10 h-8 bg-[#333] rounded-lg flex items-center justify-center text-white font-bold text-lg">1</div>
                <span className="text-slate-400 text-xs font-bold">x</span>
                <div className="w-10 h-8 bg-[#333] rounded-lg flex items-center justify-center text-white font-bold text-lg">1</div>
              </div>
              <span className="font-bold text-slate-800 text-sm mt-1">14:00</span>
              <span className="text-[8px] text-slate-400 text-center leading-tight">Al<br/>Bayt</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="font-bold text-slate-800 text-sm">Marrocos</span>
                <span className="text-[10px] text-slate-400 font-medium">Gr. D</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-300 text-sm">MA</div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-300 text-sm">DE</div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-800 text-sm">Alemanha</span>
                <span className="text-[10px] text-slate-400 font-medium">Gr. E</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <div className="w-10 h-8 bg-[#333] rounded-lg flex items-center justify-center text-white font-bold text-lg">1</div>
                <span className="text-slate-400 text-xs font-bold">x</span>
                <div className="w-10 h-8 bg-[#333] rounded-lg flex items-center justify-center text-white font-bold text-lg">1</div>
              </div>
              <span className="font-bold text-slate-800 text-sm mt-1">17:00</span>
              <span className="text-[8px] text-slate-400 text-center leading-tight">Education<br/>City</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="font-bold text-slate-800 text-sm">Espanha</span>
                <span className="text-[10px] text-slate-400 font-medium">Gr. E</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-300 text-sm">ES</div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-300 text-sm">PT</div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-800 text-sm">Portugal</span>
                <span className="text-[10px] text-slate-400 font-medium">Gr. H</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <div className="w-10 h-8 bg-[#333] rounded-lg flex items-center justify-center text-white font-bold text-lg">−</div>
                <span className="text-slate-400 text-xs font-bold">x</span>
                <div className="w-10 h-8 bg-[#333] rounded-lg flex items-center justify-center text-white font-bold text-lg">−</div>
              </div>
              <span className="font-bold text-slate-800 text-sm mt-1">21:00</span>
              <span className="text-[8px] text-slate-400 text-center leading-tight">Lusail</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="font-bold text-slate-800 text-sm">Uruguai</span>
                <span className="text-[10px] text-slate-400 font-medium">Gr. H</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-300 text-sm">UY</div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
