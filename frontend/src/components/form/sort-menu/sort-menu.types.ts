export interface SortOption<T extends string> {
  value: T
  /** Texto da opção no menu */
  label: string
  /** Texto no botão, depois de "Ordenar:" */
  short: string
}

export interface SortMenuProps<T extends string> {
  options: SortOption<T>[]
  value: T
  onChange: (value: T) => void
  /** Largura mínima do menu (ex.: "min-w-64") */
  contentClassName?: string
}
