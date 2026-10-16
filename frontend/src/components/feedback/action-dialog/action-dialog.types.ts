import type { ReactNode } from 'react'

export type ActionDialogSize = 'sm' | 'md' | 'lg' | 'xl'

interface ActionDialogConfirm {
  label: string
  /** Texto enquanto `busy` (ex.: "Salvando…") */
  busyLabel?: string
  icon?: ReactNode
  variant?: 'default' | 'destructive'
  disabled?: boolean
  /** Botão de submit de um <form id> do corpo; sem isso, usa `onClick` */
  form?: string
  onClick?: () => void
}

export interface ActionDialogProps {
  title: string
  description?: ReactNode
  /** Resultado de uma ação concluída: ícone de sucesso acima do título */
  success?: boolean
  /** sm 460px · md 520px · lg 560px · xl 852px */
  size?: ActionDialogSize
  className?: string
  /** Confirmação destrutiva: papel alertdialog e não fecha clicando fora */
  alert?: boolean
  /** Durante o envio o diálogo não fecha e os botões ficam desabilitados */
  busy?: boolean
  onClose: () => void
  confirm: ActionDialogConfirm
  /** `false` esconde o Cancelar (diálogos só de leitura) */
  cancelLabel?: string | false
  /** Botões extras antes do principal (ex.: "Ver detalhes") */
  secondaryActions?: ReactNode
  /** Texto de apoio à esquerda do rodapé */
  footerNote?: ReactNode
  children?: ReactNode
}
