import type { Position } from '@/api/types'

export interface PositionPickerProps {
  value?: Position
  onChange: (position: Position) => void
  /** Com valor, só essa posição fica habilitada (jogador com clube) */
  lockedTo?: Position
  invalid?: boolean
}
