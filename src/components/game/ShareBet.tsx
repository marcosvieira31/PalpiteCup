"use client"

interface ShareBetProps {
  game: {
    home_team: string;
    away_team: string;
  };
  homeBet: number;
  awayBet: number;
}

export default function ShareBet({ game, homeBet, awayBet }: ShareBetProps) {
  const text = `🏆 Meu palpite no PalpiteCup:\n⚽ ${game.home_team} ${homeBet} x ${awayBet} ${game.away_team}\n\nEntre no meu grupo: palpitecup.vercel.app`

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`)
  }

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`)
  }

  return (
    <div className="flex gap-2 mt-4 w-full">
      <button
        onClick={shareWhatsApp}
        className="flex-1 bg-green-500 text-white font-bebas tracking-wider rounded-xl py-2 text-sm shadow-sm active:scale-95 transition-transform"
      >
        📱 WHATSAPP
      </button>
      <button
        onClick={shareTwitter}
        className="flex-1 bg-blue-400 text-white font-bebas tracking-wider rounded-xl py-2 text-sm shadow-sm active:scale-95 transition-transform"
      >
        🐦 TWITTER
      </button>
    </div>
  )
}
