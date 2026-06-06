import BottomNav from "@/components/layout/BottomNav";
import InstallPWA from "@/components/ui/InstallPWA";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="max-w-[390px] mx-auto min-h-screen bg-slate-50 relative overflow-x-hidden shadow-2xl">
      <InstallPWA />
      {children}
      <BottomNav />
    </main>
  )
}
