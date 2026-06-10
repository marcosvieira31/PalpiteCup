export interface Avatar {
  id: string
  name: string
  file: string
}

export const PLAYER_AVATARS: Avatar[] = [
  { id: 'vini-jr', name: 'Vini Jr', file: '/avatars/vini-jr.png' },
  { id: 'endrick', name: 'Endrick', file: '/avatars/endrick.png' },
  { id: 'neymar', name: 'Neymar', file: '/avatars/neymar.png' },
  { id: 'messi', name: 'Messi', file: '/avatars/messi.png' },
  { id: 'mbappe', name: 'Mbappé', file: '/avatars/mbappe.png' },
  { id: 'haaland', name: 'Haaland', file: '/avatars/haaland.png' },
  { id: 'cristiano-ronaldo', name: 'Cristiano Ronaldo', file: '/avatars/cristiano-ronaldo.png' },
  { id: 'bellingham', name: 'Bellingham', file: '/avatars/bellingham.png' },
  { id: 'lamine-yamal', name: 'Lamine Yamal', file: '/avatars/lamine-yamal.png' },
  { id: 'manuel-neuer', name: 'Manuel Neuer', file: '/avatars/manuel-neuer.png' },
  { id: 'salah', name: 'Salah', file: '/avatars/salah.png' },
  { id: 'sadio-mane', name: 'Sadio Mané', file: '/avatars/sadio-mane.png' },
  { id: 'hirving-lozano', name: 'Hirving Lozano', file: '/avatars/hirving-lozano.png' },
  { id: 'memphis-depay', name: 'Memphis Depay', file: '/avatars/memphis-depay.png' },
  { id: 'mitoma', name: 'Mitoma', file: '/avatars/mitoma.png' },
  { id: 'lucas-paqueta', name: 'Lucas Paquetá', file: '/avatars/lucas-paqueta.png' },
]

export const DEFAULT_AVATAR = '/avatars/vini-jr.png'
