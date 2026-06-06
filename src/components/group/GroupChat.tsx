"use client"
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { filterMessage } from '@/lib/chat-filter'

interface Message {
  id: number
  user_id: string
  content: string
  created_at: string
  users: { username: string; avatar_url: string | null }
}

interface Props {
  groupId: number | string
  currentUserId: string
  chatEnabled: boolean
  filterEnabled: boolean
}

export default function GroupChat({ groupId, currentUserId, chatEnabled, filterEnabled }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase
      .from('messages')
      .select('*, users(username, avatar_url)')
      .eq('group_id', String(groupId))
      .order('created_at')
      .then(({ data }) => setMessages((data as Message[]) ?? []))

    const channel = supabase
      .channel(`chat-${groupId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `group_id=eq.${groupId}`
      }, async (payload) => {
        const { data } = await supabase
          .from('messages')
          .select('*, users(username, avatar_url)')
          .eq('id', payload.new.id)
          .single()
        if (data) setMessages(prev => [...prev, data as Message])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [groupId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || !chatEnabled) return
    setSending(true)
    setError('')

    const { error } = await supabase.from('messages').insert({
      group_id: String(groupId),
      user_id: currentUserId,
      content: input.trim()
    })

    if (error) {
      setError(error.message.includes('Muitas mensagens')
        ? 'Aguarde alguns segundos antes de enviar outra mensagem.'
        : 'Erro ao enviar mensagem.')
    } else {
      setInput('')
    }
    setSending(false)
  }

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      {/* Status do chat */}
      {!chatEnabled && (
        <div className="bg-slate-100 rounded-xl p-3 mb-3 text-center">
          <p className="text-slate-400 text-xs font-medium">
            💬 Resenha desativada pelo líder do grupo
          </p>
        </div>
      )}

      {/* Lista de mensagens */}
      <div className="flex-1 overflow-y-auto space-y-3 max-h-80 mb-3 pr-1">
        {messages.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-8">
            {chatEnabled ? 'Seja o primeiro a mandar a resenha! 💬' : 'Nenhuma mensagem ainda.'}
          </p>
        )}

        {messages.map(msg => {
          const isMe = msg.user_id === currentUserId
          const content = filterMessage(msg.content, filterEnabled)

          return (
            <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-slate-500 overflow-hidden">
                {msg.users?.avatar_url ? (
                  <img src={msg.users.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  msg.users?.username?.substring(0, 2).toUpperCase()
                )}
              </div>
              <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                {!isMe && (
                  <p className="text-[10px] text-slate-400 px-1">{msg.users?.username}</p>
                )}
                <div className={`px-3 py-2 rounded-2xl text-sm ${
                  !chatEnabled
                    ? 'bg-slate-100 text-slate-400'
                    : isMe
                    ? 'bg-green-100 text-green-800'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {content}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input — só aparece se chat habilitado */}
      {chatEnabled && (
        <div className="flex gap-2 mt-auto">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !sending && sendMessage()}
            placeholder="Manda a resenha..."
            maxLength={500}
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500"
          />
          <button
            onClick={sendMessage}
            disabled={sending || !input.trim()}
            className="bg-blue-900 text-yellow-400 rounded-2xl px-4 font-bebas tracking-wider text-sm disabled:opacity-50"
          >
            {sending ? '...' : 'ENVIAR'}
          </button>
        </div>
      )}

      {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
    </div>
  )
}
