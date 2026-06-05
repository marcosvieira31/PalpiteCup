"use client"
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full bg-red-500 text-white font-bebas text-lg tracking-widest rounded-xl py-3 active:scale-95 transition-transform"
    >
      SAIR DA CONTA
    </button>
  )
}
