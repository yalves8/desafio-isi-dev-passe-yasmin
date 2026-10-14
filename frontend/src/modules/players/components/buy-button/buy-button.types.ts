export interface BuyButtonProps {
  onClick: () => void
  /** Motivo de o botão estar desabilitado (ex.: liga sem clubes) */
  disabledReason?: string
  size?: 'md' | 'sm'
  className?: string
}
