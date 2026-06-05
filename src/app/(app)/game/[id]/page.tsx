"use client";

import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Partida() {
  const [score, setScore] = useState({ home: 0, away: 0 });
  const [status, setStatus] = useState("live");
  const supabase = createClient();

  useEffect(() => {
    // Example Realtime Subscription
    const channel = supabase
      .channel('public:games')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games' }, (payload) => {
        setScore({
          home: payload.new.home_score,
          away: payload.new.away_score
        });
        setStatus(payload.new.status);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <main className="min-h-screen bg-background">
      <Header title="TIMELINE DA PARTIDA" />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        
        {/* Live Scorecard */}
        <div className="bg-white rounded-3xl shadow-md p-6 border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-green-300"></div>
          
          <div className="flex justify-center items-center mb-6">
            <span className="animate-pulse flex items-center gap-2 text-xs font-bold px-3 py-1 bg-red-100 text-red-600 rounded-full uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              {status === "live" ? "AO VIVO" : status === "finished" ? "ENCERRADO" : "PENDENTE"}
            </span>
          </div>

          <div className="flex justify-between items-center px-2">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-4xl shadow-sm border border-slate-200">
                🇧🇷
              </div>
              <span className="font-bold text-gray-800">Brasil</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="font-bebas text-6xl text-gray-900">{score.home}</span>
              <span className="font-bebas text-3xl text-gray-300 -mt-2">X</span>
              <span className="font-bebas text-6xl text-gray-900">{score.away}</span>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-4xl shadow-sm border border-slate-200">
                🇦🇷
              </div>
              <span className="font-bold text-gray-800">Argentina</span>
            </div>
          </div>
        </div>

        {/* Timeline Events (Static Example) */}
        <section>
          <h2 className="font-bebas text-xl text-foreground mb-4 font-black italic uppercase">Lances</h2>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
            
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-green-100 text-green-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                ⚽
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-800 text-sm">Gol do Brasil!</span>
                  <span className="text-xs font-medium text-gray-500">23'</span>
                </div>
                <p className="text-sm text-gray-600">Vini Jr. chuta forte no canto esquerdo.</p>
              </div>
            </div>

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-yellow-100 text-yellow-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                🟨
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-800 text-sm">Cartão Amarelo</span>
                  <span className="text-xs font-medium text-gray-500">15'</span>
                </div>
                <p className="text-sm text-gray-600">Falta dura no meio de campo.</p>
              </div>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}
