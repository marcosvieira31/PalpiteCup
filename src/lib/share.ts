export function shareGroup(groupName: string, inviteCode: string) {
  const text = `👥 Entre no meu bolão da Copa no PalpiteCup!

🏆 Grupo: ${groupName}
🔑 Código: ${inviteCode}

Acesse: https://palpite-cup.vercel.app
Entre na aba GRUPOS → CÓDIGO e use o código acima!`

  return {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent('https://palpite-cup.vercel.app')}&text=${encodeURIComponent(text)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    text,
  }
}

export function shareBet(
  homeTeam: string,
  awayTeam: string,
  homeBet: number,
  awayBet: number,
  username: string,
  groupName?: string,
  inviteCode?: string
) {
  const result = homeBet > awayBet
    ? `vitória do ${homeTeam}`
    : awayBet > homeBet
    ? `vitória do ${awayTeam}`
    : 'empate'

  const groupLine = groupName && inviteCode
    ? `\n\n👥 Entre no meu grupo "${groupName}" → Código: ${inviteCode}`
    : ''

  const text = `⚽ Meu palpite no PalpiteCup!

🇧🇷 ${homeTeam} ${homeBet} × ${awayBet} ${awayTeam}
🎯 Aposto em ${result}!${groupLine}

Faça o seu: https://palpite-cup.vercel.app`

  return {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent('https://palpite-cup.vercel.app')}&text=${encodeURIComponent(text)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    text,
  }
}
