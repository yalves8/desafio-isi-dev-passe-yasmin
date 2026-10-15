import { useState } from 'react'

/** Quem abriu o diálogo: o elemento focado ou, se ele é um item de menu, o botão desse menu */
function findOpener(): HTMLElement | null {
  const active = document.activeElement
  if (!(active instanceof HTMLElement)) return null
  const menu = active.closest('[role=menu]')
  if (!menu?.id) return active
  return document.querySelector<HTMLElement>(`[aria-controls="${menu.id}"]`) ?? active
}

/**
 * Devolve o foco a quem abriu o diálogo ao fechá-lo. Os diálogos abrem por estado, sem
 * `DialogTrigger`, então o Radix não sabe a quem devolver e o foco cairia no `body`.
 * Guarda quem abriu na primeira renderização, antes de o diálogo puxar o foco.
 */
export function useReturnFocus() {
  const [opener] = useState(findOpener)

  return (event: Event) => {
    if (!opener?.isConnected) return
    event.preventDefault()
    opener.focus()
  }
}
