export interface BackLinkProps {
  to: string
  /** Texto do botão (ex.: "Voltar para clubes") */
  label: string
  /** outline nos estados de erro e vazio; ghost no topo da tela */
  variant?: 'outline' | 'ghost'
  className?: string
}
