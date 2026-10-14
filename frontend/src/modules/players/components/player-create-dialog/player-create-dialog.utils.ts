import { ATTRIBUTE_FIELDS } from '../../players.constants'
import type { CreatePlayerFormInput } from '../../player-form.validation'
import type { AttributesPreviewState } from '../attributes-preview/attributes-preview.types'

const parse = (raw: string | undefined) => {
  const value = (raw ?? '').trim()
  if (value === '') return undefined
  const n = Number(value)
  return /^\d+$/.test(value) && n >= 1 && n <= 99 ? n : Number.NaN
}

/** Estado da prévia a partir do que foi digitado (vazio, inválido ou pronto) */
export function getAttributesPreview(
  values: Partial<CreatePlayerFormInput>,
): AttributesPreviewState {
  const parsed = ATTRIBUTE_FIELDS.map((f) => ({ label: f.label, value: parse(values[f.key]) }))
  const potential = parse(values.potential)

  if (parsed.some((p) => Number.isNaN(p.value)) || Number.isNaN(potential)) {
    return { status: 'invalid' }
  }
  if (parsed.some((p) => p.value === undefined)) return { status: 'empty' }
  return {
    status: 'ready',
    items: parsed.map((p) => ({ label: p.label, value: p.value as number })),
    potential,
  }
}
