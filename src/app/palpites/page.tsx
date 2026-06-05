import Header from "@/components/Header";

export default function Palpites() {
  return (
    <main className="min-h-screen bg-background">
      <Header title="MEUS PALPITES" />
      
      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Game Card */}
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Amanhã • 16:00</span>
            <span className="text-xs font-bold px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md">Pendente</span>
          </div>

          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-2xl shadow-sm border border-gray-100">
                🇧🇷
              </div>
              <span className="font-bold text-xs">Brasil</span>
            </div>
            
            <div className="flex items-center gap-3">
              <input type="number" className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-xl text-center font-bebas text-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" defaultValue={2} />
              <span className="font-bebas text-xl text-gray-300">X</span>
              <input type="number" className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-xl text-center font-bebas text-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" defaultValue={1} />
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-2xl shadow-sm border border-gray-100">
                🇦🇷
              </div>
              <span className="font-bold text-xs">Argentina</span>
            </div>
          </div>
          
          <button className="w-full mt-4 bg-gray-100 text-gray-600 hover:bg-gray-200 font-bold py-3 rounded-xl transition-colors text-sm">
            SALVAR PALPITE
          </button>
        </div>

        {/* Finished Game Card */}
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 opacity-75">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Ontem • 20:00</span>
            <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-md">+5 Pontos</span>
          </div>

          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">🇪🇸</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="font-bebas text-3xl text-gray-800">1</span>
              <span className="text-gray-300">X</span>
              <span className="font-bebas text-3xl text-gray-800">1</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">🇮🇹</span>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">Resultado oficial: 1 x 1</p>
          </div>
        </div>
      </div>
    </main>
  );
}
