import { Zap } from "lucide-react";

export default function FeaturedMatch() {
  return (
    <div className="border border-white/30 rounded-3xl p-5 bg-white/10 backdrop-blur-sm text-white shadow-lg mt-6">
      <p className="text-[10px] text-center font-bold tracking-widest uppercase mb-5 opacity-90 flex items-center justify-center gap-1">
        <span>🏆</span> COPA DO MUNDO • FASE DE GRUPOS
      </p>
      
      <div className="flex items-center justify-between px-2">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full border-2 border-white bg-white/20 flex items-center justify-center font-bebas text-3xl shadow-sm">BR</div>
          <span className="font-bold text-sm tracking-wide">Brasil</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3">
            <input 
              type="number" 
              className="w-14 h-12 bg-[#2b2b2b] rounded-xl flex items-center justify-center font-bebas text-3xl shadow-inner text-center border-2 border-yellow-400 text-white appearance-none outline-none focus:ring-2 focus:ring-yellow-400" 
              defaultValue={2} 
            />
            <span className="text-white/60 text-sm font-bold">x</span>
            <input 
              type="number" 
              className="w-14 h-12 bg-[#2b2b2b] rounded-xl flex items-center justify-center font-bebas text-3xl shadow-inner text-center border-2 border-yellow-400 text-white appearance-none outline-none focus:ring-2 focus:ring-yellow-400" 
              defaultValue={1} 
            />
          </div>
          <div className="mt-4 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full w-max flex items-center gap-1.5 shadow-sm">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> AO VIVO • 45+2'
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full border-2 border-white bg-white/20 flex items-center justify-center font-bebas text-3xl shadow-sm">AR</div>
          <span className="font-bold text-sm tracking-wide">Argentina</span>
        </div>
      </div>
      
      <button className="w-full mt-6 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black italic py-4 rounded-full transition-all flex items-center justify-center gap-2 shadow-sm text-sm uppercase tracking-widest active:scale-[0.98]">
        <Zap size={16} className="text-slate-900 fill-slate-900" /> CONFIRMAR PALPITE
      </button>
    </div>
  );
}
