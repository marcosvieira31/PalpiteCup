"use client";

import Header from "@/components/Header";
import { Trophy } from "lucide-react";
import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Ranking() {
  const supabase = createClient();
  const [users, setUsers] = useState([
    { name: "João Silva", points: 150, pos: 1 },
    { name: "Maria Lima", points: 145, pos: 2 },
    { name: "Carlos Edu", points: 130, pos: 3 },
    { name: "Ana Souza", points: 128, pos: 4 },
    { name: "Você", points: 125, pos: 5 },
  ]);

  useEffect(() => {
    // Example Realtime Subscription for Ranking
    const channel = supabase
      .channel('public:users')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' }, (payload) => {
        // Handle realtime ranking update here
        console.log("Ranking updated:", payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <main className="min-h-screen bg-background">
      <Header title="RANKING" />
      
      <div className="container mx-auto px-4 py-6 space-y-4">
        
        {/* Top 3 podium decoration */}
        <div className="flex justify-center mb-8 mt-4">
          <div className="flex items-end gap-2 h-32">
            {/* 2nd place */}
            <div className="flex flex-col items-center">
              <span className="font-bebas text-xl text-gray-500">2º</span>
              <div className="w-16 h-20 bg-gray-200 rounded-t-lg border-b-4 border-gray-300"></div>
            </div>
            {/* 1st place */}
            <div className="flex flex-col items-center">
              <Trophy size={24} className="text-yellow-500 mb-1" />
              <span className="font-bebas text-2xl text-yellow-500">1º</span>
              <div className="w-20 h-28 bg-yellow-100 rounded-t-lg border-b-4 border-yellow-300"></div>
            </div>
            {/* 3rd place */}
            <div className="flex flex-col items-center">
              <span className="font-bebas text-lg text-orange-400">3º</span>
              <div className="w-16 h-16 bg-orange-100 rounded-t-lg border-b-4 border-orange-200"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {users.map((user, index) => (
            <div 
              key={index}
              className={clsx(
                "flex items-center justify-between p-4 border-b border-gray-50 last:border-0",
                user.name === "Você" ? "bg-green-50" : ""
              )}
            >
              <div className="flex items-center gap-4">
                <span className={clsx(
                  "font-bebas text-2xl w-6 text-center",
                  user.pos === 1 ? "text-yellow-500" : 
                  user.pos === 2 ? "text-gray-400" : 
                  user.pos === 3 ? "text-orange-400" : "text-gray-300"
                )}>
                  {user.pos}
                </span>
                
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                  {user.name.charAt(0)}
                </div>
                
                <span className={clsx(
                  "font-bold text-sm",
                  user.name === "Você" ? "text-primary" : "text-gray-800"
                )}>
                  {user.name}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <span className="font-bebas text-2xl text-gray-800">{user.points}</span>
                <span className="text-xs text-gray-400 font-bold uppercase mt-1">pts</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
