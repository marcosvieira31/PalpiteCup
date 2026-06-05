import Header from "@/components/layout/Header";
import { Settings, HelpCircle, ChevronRight } from "lucide-react";
import LogoutButton from "@/components/profile/LogoutButton";

export default function Perfil() {
  return (
    <main className="min-h-screen bg-background">
      <Header title="MEU PERFIL" />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-bebas text-3xl shadow-sm">
            V
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-800">Você</h2>
            <p className="text-sm text-gray-500">voce@email.com</p>
          </div>
        </div>

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
