export interface AttributeBarProps {
  label: string
  value: number
  /** Faixa clara até o potencial (nenhum atributo passa dele) */
  potential?: number
  /** Versão menor, usada na prévia do cadastro */
  compact?: boolean
}
