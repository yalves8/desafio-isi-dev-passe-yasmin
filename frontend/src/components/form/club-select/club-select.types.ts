import type { Club } from '@/api/types'

export interface ClubSelectProps {
  /** Id do campo: liga o rótulo do FormField e a mensagem `${id}-message` */
  id: string
  clubs: Pick<Club, 'id' | 'name' | 'acronym' | 'cash'>[]
  value?: number
  onChange: (clubId: number) => void
  onBlur?: () => void
  invalid?: boolean
  disabled?: boolean
  /** Mostra o caixa de cada clube na lista (ex.: escolher o comprador) */
  showCash?: boolean
}
