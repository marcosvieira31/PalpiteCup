"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Trophy, User } from "lucide-react";
import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function BottomNav() {
  const pathname = usePathname();
  const [groupId, setGroupId] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('group_members').select('group_id').limit(1).then(({ data }) => {
      if (data && data.length > 0) setGroupId(data[0].group_id);
    });
  }, []);

  // Ocultar na tela de login
  if (pathname === "/login") return null;

  const rankingHref = groupId ? `/group/${groupId}` : "/groups";

  return (
    <nav className="fixed bottom-0 left-0 right-0 mx-auto max-w-[390px] bg-white border-t border-slate-200 pb-safe z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center h-16 px-2 relative">
        
        {/* Left Links */}
        <div className="flex flex-1 justify-around">
          <Link href="/dashboard" className={clsx("flex flex-col items-center justify-center space-y-1 transition-colors", pathname === "/dashboard" ? "text-primary" : "text-slate-400 hover:text-slate-600")}>
            <Home size={24} strokeWidth={pathname === "/dashboard" ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
          </Link>
          <Link href="/groups" className={clsx("flex flex-col items-center justify-center space-y-1 transition-colors", pathname?.startsWith("/groups") ? "text-primary" : "text-slate-400 hover:text-slate-600")}>
            <Users size={24} strokeWidth={pathname?.startsWith("/groups") ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Grupos</span>
          </Link>
        </div>

        {/* Central Elevated Button */}
        <div className="flex-shrink-0 flex items-center justify-center w-20 relative">
          <div className="absolute -top-5 mb-4">
            <Link href="/palpitar" className="flex flex-col items-center justify-center gap-1 group">
              <div className="flex items-center justify-center w-14 h-14 bg-[#1e3a8a] rounded-full shadow-lg border-4 border-slate-50 transition-transform active:scale-95 group-hover:-translate-y-1">
                <span className="text-2xl">⚽</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-800">Palpitar</span>
            </Link>
          </div>
        </div>

        {/* Right Links */}
        <div className="flex flex-1 justify-around">
          <Link href={rankingHref} className={clsx("flex flex-col items-center justify-center space-y-1 transition-colors", pathname?.startsWith("/group/") ? "text-primary" : "text-slate-400 hover:text-slate-600")}>
            <Trophy size={24} strokeWidth={pathname?.startsWith("/group/") ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Ranking</span>
          </Link>
          <Link href="/profile" className={clsx("flex flex-col items-center justify-center space-y-1 transition-colors", pathname === "/profile" ? "text-primary" : "text-slate-400 hover:text-slate-600")}>
            <User size={24} strokeWidth={pathname === "/profile" ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Perfil</span>
          </Link>
        </div>

      </div>
    </nav>
  );
}
