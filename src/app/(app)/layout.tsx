import BottomNav from "@/components/layout/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="max-w-[390px] mx-auto min-h-screen bg-slate-50 relative overflow-x-hidden shadow-2xl">
      {children}
      <BottomNav />
    </main>
  )
}
