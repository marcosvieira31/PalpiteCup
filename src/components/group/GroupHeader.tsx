"use client";
import { ChevronLeft, Copy, Check } from "lucide-react";
import Link from "next/link";
import { Database } from "@/types/database";
import { useState } from "react";

type Group = Database["public"]["Tables"]["groups"]["Row"];

export default function GroupHeader({ group }: { group: Group }) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(group.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#22c55e] bg-halftone pb-6 pt-12 px-4 relative flex flex-col items-center shadow-sm">
      <div className="absolute top-4 left-4">
        <Link href="/dashboard" className="w-10 h-10 bg-white/20 border border-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors">
          <ChevronLeft size={24} className="text-white" />
        </Link>
      </div>

      <div className="flex flex-col items-center gap-2 mt-4 text-center">
        <span className="text-white/80 font-bold uppercase tracking-widest text-[10px]">GRUPO PRIVADO</span>
        <h1 className="font-bebas text-5xl text-yellow-400 tracking-wider leading-none drop-shadow-md">
          {group.name}
        </h1>
        
        <div className="mt-2 bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl p-1 pl-4 flex items-center gap-3">
          <span className="text-white font-mono font-bold tracking-widest">{group.invite_code}</span>
          <button 
            onClick={copyCode}
            className="bg-white text-green-700 w-8 h-8 rounded-xl flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
