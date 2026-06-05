"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import clsx from "clsx";
import { Send } from "lucide-react";

interface Message {
  id: string;
  user_id: string;
  content: string;
  users: {
    username: string;
    avatar_url?: string | null;
  } | null;
}

export default function GroupChat({ groupId }: { groupId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });

    if (!groupId) return;

    supabase
      .from('messages')
      .select('*, users(username, avatar_url)')
      .eq('group_id', groupId)
      .order('created_at')
      .then(({ data }) => setMessages((data as unknown as Message[]) ?? []))

    const channel = supabase
      .channel(`chat-${groupId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `group_id=eq.${groupId}`
      }, async (payload) => {
        // Busca a mensagem completa com o username
        const { data } = await supabase
          .from('messages')
          .select('*, users(username)')
          .eq('id', payload.new.id)
          .single()
        if (data) setMessages(prev => [...prev, data as unknown as Message])
      })
      .subscribe();

    return () => { supabase.removeChannel(channel) };
  }, [groupId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentUserId) return;

    const content = input.trim();
    setInput("");

    await supabase.from('messages').insert({
      group_id: groupId,
      user_id: currentUserId,
      content
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 mt-6 overflow-hidden flex flex-col h-[500px]">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bebas text-xl text-slate-800 tracking-wide flex items-center gap-2">
          <span>💬</span> RESENHA DO GRUPO
        </h3>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{messages.length} msgs</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-slate-400 text-sm text-center">Seja o primeiro a mandar a resenha! 💬</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.user_id === currentUserId;
            return (
              <div key={msg.id} className={clsx("flex flex-col", isMe ? "items-end" : "items-start")}>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">
                  {isMe ? 'Você' : msg.users?.username}
                </span>
                <div className={clsx(
                  "px-4 py-2 rounded-2xl max-w-[85%] text-sm shadow-sm",
                  isMe 
                    ? "bg-blue-600 text-white rounded-tr-sm" 
                    : "bg-white text-slate-700 border border-slate-100 rounded-tl-sm"
                )}>
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Mande uma mensagem..."
            className="w-full bg-slate-100 text-slate-800 text-sm rounded-full py-3 pl-5 pr-12 outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all border border-transparent focus:border-blue-500/30 placeholder:text-slate-400"
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
          >
            <Send size={14} className="ml-[-2px]" />
          </button>
        </form>
      </div>
    </div>
  );
}
