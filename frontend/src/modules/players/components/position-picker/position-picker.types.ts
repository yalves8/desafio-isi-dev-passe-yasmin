import type { Position } from '@/api/types'

export interface PositionPickerProps {
  /** id do campo; o rótulo do FormField (`${id}-label`) dá o nome do grupo */
  id: string
  value?: Position
  onChange: (position: Position) => void
  /** Com valor, só essa posição fica habilitada (jogador com clube) */
  lockedTo?: Position
  invalid?: boolean
}
