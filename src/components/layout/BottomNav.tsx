"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Activity, MessageCircle } from "lucide-react";
import { clsx } from "clsx";

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  const navItems = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Partida", href: "/partida", icon: Activity },
    { name: "Ranking", href: "/ranking", icon: Trophy },
    { name: "Resenha", href: "/resenha", icon: MessageCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 mx-auto max-w-[390px] bg-white border-t border-slate-200 pb-safe z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center h-16 px-2 relative">
        
        {/* Left Links */}
        <div className="flex flex-1 justify-around">
          <Link href="/dashboard" className={clsx("flex flex-col items-center justify-center space-y-1 transition-colors", pathname === "/dashboard" ? "text-primary" : "text-slate-400 hover:text-slate-600")}>
            <Home size={24} strokeWidth={pathname === "/dashboard" ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
          </Link>
          <Link href="/group/1" className={clsx("flex flex-col items-center justify-center space-y-1 transition-colors", pathname?.startsWith("/group/") ? "text-primary" : "text-slate-400 hover:text-slate-600")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={pathname?.startsWith("/group/") ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
            <span className="text-[10px] font-bold uppercase tracking-wider">Grupos</span>
          </Link>
        </div>

        {/* Central Elevated Button */}
        <div className="flex-shrink-0 flex items-center justify-center w-20 relative">
          <div className="absolute -top-6">
            <Link href="/game/1" className="flex items-center justify-center w-14 h-14 bg-white border border-slate-200 rounded-2xl shadow-lg transition-transform active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>
            </Link>
          </div>
        </div>

        {/* Right Links */}
        <div className="flex flex-1 justify-around">
          <Link href="/group/1/ranking" className={clsx("flex flex-col items-center justify-center space-y-1 transition-colors", pathname === "/group/1/ranking" ? "text-primary" : "text-slate-400 hover:text-slate-600")}>
            <Trophy size={24} strokeWidth={pathname === "/group/1/ranking" ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Ranking</span>
          </Link>
          <Link href="/profile" className={clsx("flex flex-col items-center justify-center space-y-1 transition-colors", pathname === "/profile" ? "text-primary" : "text-slate-400 hover:text-slate-600")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={pathname === "/profile" ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span className="text-[10px] font-bold uppercase tracking-wider">Perfil</span>
          </Link>
        </div>

      </div>
    </nav>
  );
}
