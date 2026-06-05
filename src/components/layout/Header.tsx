import { Bell, Search } from "lucide-react";

export default function Header({ children, title }: { children?: React.ReactNode; title?: string }) {
  return (
    <div className="bg-[#22c55e] bg-halftone px-4 pt-12 pb-8 shadow-sm relative">
      <div className="flex justify-between items-start mb-6">
          {title ? (
            <h1 className="font-bebas text-4xl text-white tracking-wider leading-none drop-shadow-md">{title}</h1>
          ) : (
            <>
              <h1 className="font-bebas text-5xl text-yellow-400 tracking-wider leading-none drop-shadow-md">PALPITE</h1>
              <h1 className="font-bebas text-5xl text-white tracking-wider leading-none flex items-center gap-2 drop-shadow-md">
                <span className="text-4xl">⚽</span> CUP
              </h1>
            </>
          )}
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white backdrop-blur-md hover:bg-white/30 transition">
            <Search size={18} />
          </button>
          <button className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white backdrop-blur-md hover:bg-white/30 transition">
            <Bell size={18} />
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
