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
  onMount?: () => void
}

export default function GroupChat({ groupId, currentUserId, chatEnabled, filterEnabled, onMount }: Props) {
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
      .channel(`chat-${groupId}-${Date.now()}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `group_id=eq.${groupId}`
      }, async (payload) => {
        const { data } = await supabase
          .from('messages').select('*, users(username, avatar_url)')
          .eq('id', payload.new.id).single()
        if (data) setMessages(prev => [...prev, data as Message])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [groupId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    onMount?.()
  }, [])

  const sendMessage = async () => {
    if (!input.trim() || sending) return
    setSending(true)
    setError('')
    const { error } = await supabase.from('messages').insert({
      group_id: String(groupId), user_id: currentUserId, content: input.trim()
    })
    if (error) setError('Erro ao enviar.')
    else setInput('')
    setSending(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Mensagens */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
        {messages.length === 0 && (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '32px 0', fontSize: 14 }}>
            Seja o primeiro a mandar a resenha! 💬
          </p>
        )}
        {messages.map(msg => {
          const isMe = msg.user_id === currentUserId
          const content = filterMessage(msg.content, filterEnabled)
          return (
            <div key={msg.id} style={{ display: 'flex', gap: 8, marginBottom: 12, flexDirection: isMe ? 'row-reverse' : 'row' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#64748b', flexShrink: 0, overflow: 'hidden' }}>
                {msg.users?.avatar_url
                  ? <img src={msg.users.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : msg.users?.username?.substring(0, 2).toUpperCase()}
              </div>
              <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', gap: 2 }}>
                {!isMe && <p style={{ fontSize: 10, color: '#94a3b8', paddingLeft: 4 }}>{msg.users?.username}</p>}
                <div style={{ padding: '8px 12px', borderRadius: 16, fontSize: 14, background: !chatEnabled ? '#f1f5f9' : isMe ? '#dcfce7' : '#f1f5f9', color: !chatEnabled ? '#94a3b8' : isMe ? '#166534' : '#374151' }}>
                  {content}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {chatEnabled && (
        <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid #f1f5f9', flexShrink: 0 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Manda a resenha..."
            maxLength={500}
            style={{ flex: 1, borderRadius: 20, border: '1px solid #e2e8f0', padding: '10px 16px', fontSize: 14, outline: 'none' }}
          />
          <button
            onClick={sendMessage}
            disabled={sending || !input.trim()}
            style={{ background: '#1e3a8a', color: '#facc15', borderRadius: 16, padding: '0 16px', fontFamily: 'inherit', fontWeight: 700, fontSize: 14, cursor: sending || !input.trim() ? 'not-allowed' : 'pointer', opacity: sending || !input.trim() ? 0.5 : 1 }}
          >
            ENVIAR
          </button>
        </div>
      )}

      {!chatEnabled && (
        <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 12, textAlign: 'center', flexShrink: 0 }}>
          <p style={{ fontSize: 12, color: '#94a3b8' }}>💬 Resenha desativada pelo líder</p>
        </div>
      )}

      {error && <p style={{ color: '#ef4444', fontSize: 12, textAlign: 'center', marginTop: 8 }}>{error}</p>}
    </div>
  )
}
