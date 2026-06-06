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
]

export const DEFAULT_AVATAR = '/avatars/vini-jr.png'
