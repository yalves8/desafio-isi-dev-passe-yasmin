import { Shield, Swords, Users, ListOrdered, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Mercado',
    items: [
      { to: '/jogadores', label: 'Jogadores', icon: Users },
      { to: '/clubes', label: 'Clubes', icon: Shield },
    ],
  },
  {
    label: 'Liga',
    items: [
      { to: '/partidas', label: 'Partidas', icon: Swords },
      { to: '/classificacao', label: 'Classificação', icon: ListOrdered },
    ],
  },
]

/** Breadcrumb "Grupo › Tela" a partir do primeiro segmento da URL */
export function getBreadcrumb(pathname: string) {
  const base = `/${pathname.split('/')[1] ?? ''}`
  for (const group of NAV_GROUPS) {
    const item = group.items.find((i) => i.to === base)
    if (item) return { group: group.label, page: item.label }
  }
  return null
}
