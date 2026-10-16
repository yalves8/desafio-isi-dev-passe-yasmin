import type { ReactNode } from 'react'

export interface PitchProps {
  /** Vertical: um time, do goleiro (embaixo) ao ataque. Horizontal: os dois times, frente a frente */
  orientation: 'vertical' | 'horizontal'
  /** Nome do campo para leitor de tela (o campo é uma imagem) */
  label: string
  children: ReactNode
}

export interface PitchPlayerProps {
  /** Nome completo, para as iniciais; sem nome, a vaga aparece vazia e tracejada */
  name?: string
  /** Texto embaixo do círculo (sobrenome, nome ou setor da vaga vazia) */
  label: string
  /** Segunda linha embaixo do rótulo (ex.: posição e valores do duelo) */
  detail?: string
  /** Cor do círculo: azul (mandante, escalação) ou branca (visitante) */
  tone?: 'primary' | 'light'
  size?: 'md' | 'lg'
  /** Selo de mal condicionado */
  worn?: boolean
  /** Selo de gol no duelo */
  scored?: boolean
}
