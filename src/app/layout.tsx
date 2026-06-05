import type { Metadata } from "next";
import { Barlow, Bebas_Neue } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";

const barlow = Barlow({ weight: ["400", "500", "700", "900"], style: ["normal", "italic"], subsets: ["latin"], variable: "--font-barlow" });
const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas-neue" });

export const metadata: Metadata = {
  title: "Palpite Cup",
  description: "Faça seus palpites e ganhe pontos!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${barlow.variable} ${bebas.variable} font-sans antialiased bg-gray-100 flex justify-center`}>
        <div className="w-full max-w-[390px] min-h-screen bg-background relative shadow-2xl overflow-x-hidden">
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
