import { useState } from 'react'
import type { RangeFilterOptions } from './range-filter.types'

const toDraft = (n: number | undefined, decimals: number) =>
  n === undefined ? '' : decimals > 0 ? n.toFixed(decimals).replace('.', ',') : String(n)

/** Converte "10,5" ou "10.5"; vazio vira undefined, inválido vira NaN */
export function parseRangeValue(raw: string) {
  const value = raw.trim().replace(',', '.')
  if (value === '') return undefined
  return /^\d+(\.\d+)?$/.test(value) ? Number(value) : Number.NaN
}

export function validateRange(
  from: number | undefined,
  to: number | undefined,
  bounds: { min: number; max: number },
  decimals: number,
) {
  const factor = 10 ** decimals
  const invalid = (n: number | undefined) =>
    n !== undefined &&
    (Number.isNaN(n) || n < bounds.min || n > bounds.max || Math.round(n * factor) !== n * factor)
  if (invalid(from) || invalid(to)) {
    return decimals > 0
      ? `Use valores de ${bounds.min},00 a ${bounds.max},00, com até ${decimals} casas.`
      : `Use números inteiros de ${bounds.min} a ${bounds.max}.`
  }
  if (from !== undefined && to !== undefined && from > to) {
    return 'O mínimo não pode passar do máximo.'
  }
  return null
}

export function useRangeFilter({ min, max, bounds, decimals, onApply }: RangeFilterOptions) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState({ from: '', to: '' })

  const from = parseRangeValue(draft.from)
  const to = parseRangeValue(draft.to)
  const error = validateRange(from, to, bounds, decimals)

  const onOpenChange = (next: boolean) => {
    if (next) setDraft({ from: toDraft(min, decimals), to: toDraft(max, decimals) })
    setOpen(next)
  }

  return {
    open,
    onOpenChange,
    draft,
    setFrom: (value: string) => setDraft((d) => ({ ...d, from: value })),
    setTo: (value: string) => setDraft((d) => ({ ...d, to: value })),
    error,
    apply: () => {
      if (error) return
      onApply(from, to)
      setOpen(false)
    },
    clear: () => {
      onApply(undefined, undefined)
      setOpen(false)
    },
  }
}
