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

  // Mock messages when no DB connection is present
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || '2'); // fallback to mock user '2' if not logged in
    });

    if (groupId.startsWith('mock')) {
      setUseMock(true);
      setMessages([
        { id: '1', user_id: '2', users: { username: 'Carioca10' }, content: 'Brasil vai golear hoje!' },
        { id: '2', user_id: '1', users: { username: 'Renatinho' }, content: 'Tô na liderança e não saio 😎' },
        { id: '3', user_id: '3', users: { username: 'ProfetaFC' }, content: 'Meu coringa tá guardado pro jogo certo' },
      ]);
      return;
    }

    supabase
      .from('messages')
      .select('*, users(username, avatar_url)')
      .eq('group_id', groupId)
      .order('created_at')
      .then(({ data }) => setMessages((data as any) ?? []))

    const channel = supabase
      .channel(`chat-${groupId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `group_id=eq.${groupId}`
      }, async (payload) => {
        // Fetch user details for the new message
        const { data: userData } = await supabase.from('users').select('username, avatar_url').eq('id', payload.new.user_id).single();
        const newMessage = {
          ...payload.new,
          users: userData
        };
        setMessages(prev => [...prev, newMessage as Message])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [groupId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return;

    if (useMock) {
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        user_id: currentUserId || '2',
        users: { username: 'Você' },
        content: input.trim()
      }]);
      setInput('');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('messages').insert({
      group_id: groupId,
      user_id: user.id,
      content: input.trim()
    });
    setInput('');
  }

  return (
    <div className="px-4 pt-8 pb-32">
      <h2 className="font-bebas text-2xl tracking-widest text-slate-800 mb-4 flex items-center gap-2">
        <span className="text-xl">💬</span> RESENHA
      </h2>
      
      <div className="flex flex-col gap-4 mb-4">
        {messages.map(msg => {
          const isMe = msg.user_id === currentUserId;
          return (
            <div key={msg.id} className={clsx("flex w-full", isMe ? "justify-end" : "justify-start")}>
              <div className={clsx("max-w-[80%] flex flex-col", isMe ? "items-end" : "items-start")}>
                {!isMe && <span className="text-[10px] font-bold text-slate-400 ml-2 mb-1">{msg.users?.username}</span>}
                <div 
                  className={clsx(
                    "px-4 py-3 rounded-2xl shadow-sm text-sm",
                    isMe ? "bg-green-100 text-green-900 rounded-br-sm" : "bg-white border border-slate-100 text-slate-700 rounded-bl-sm"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="fixed bottom-[80px] left-0 right-0 mx-auto max-w-[390px] px-4 bg-slate-50/90 backdrop-blur-md py-3 border-t border-slate-200">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Manda a resenha..."
            className="flex-1 rounded-full border border-slate-300 px-4 py-3 text-sm outline-none focus:border-green-500 shadow-sm"
          />
          <button
            onClick={sendMessage}
            className="bg-[#1e3a8a] text-yellow-400 w-12 h-12 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
