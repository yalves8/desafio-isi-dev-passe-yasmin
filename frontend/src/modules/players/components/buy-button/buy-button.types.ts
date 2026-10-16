export interface BuyButtonProps {
  /** Entra no nome acessível ("Comprar {nome}"), único por linha */
  playerName: string
  onClick: () => void
  /** Motivo de o botão estar desabilitado (ex.: liga sem clubes) */
  disabledReason?: string
  size?: 'md' | 'sm'
  className?: string
}
