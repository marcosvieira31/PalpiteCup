const BLOCKED_WORDS = [
  'idiota', 'imbecil', 'burro', 'estúpido', 'cretino',
  'lixo', 'merda', 'bosta', 'porra', 'caralho',
  'puta', 'vadia', 'viado', 'babaca', 'otário',
  'fdp', 'vsf', 'sua mãe', 'filha da puta',
  'cuzão', 'arrombado', 'desgraça', 'maldito',
]

export function filterMessage(text: string, enabled: boolean): string {
  if (!enabled) return text
  let filtered = text
  BLOCKED_WORDS.forEach(word => {
    const regex = new RegExp(word, 'gi')
    filtered = filtered.replace(regex, '*'.repeat(word.length))
  })
  return filtered
}

export function containsBlockedWord(text: string): boolean {
  return BLOCKED_WORDS.some(word =>
    text.toLowerCase().includes(word.toLowerCase())
  )
}
