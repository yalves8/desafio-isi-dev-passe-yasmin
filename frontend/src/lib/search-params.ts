/**
 * Como um parâmetro da URL vira valor da tela e volta. `parse` ignora valor inválido (a URL
 * pode ter sido editada à mão); `format` devolve `undefined` para tirar o parâmetro da URL,
 * o que acontece com o valor padrão, para a URL ficar curta.
 */
export interface SearchParamCodec<T> {
  parse: (raw: string | null) => T
  format: (value: T) => string | undefined
}

/** Um dos valores permitidos; com padrão, o inválido vira o padrão e o padrão some da URL */
export function enumCodec<T extends string>(allowed: readonly T[], fallback: T): SearchParamCodec<T>
export function enumCodec<T extends string>(allowed: readonly T[]): SearchParamCodec<T | undefined>
export function enumCodec<T extends string>(
  allowed: readonly T[],
  fallback?: T,
): SearchParamCodec<T | undefined> {
  return {
    parse: (raw) => (allowed.includes(raw as T) ? (raw as T) : fallback),
    format: (value) => (value === fallback ? undefined : value),
  }
}

/** Número finito (aceita decimais); vazio ou inválido vira `undefined` */
export function numberCodec(): SearchParamCodec<number | undefined> {
  return {
    parse: (raw) => {
      if (raw === null || raw.trim() === '') return undefined
      const n = Number(raw)
      return Number.isFinite(n) ? n : undefined
    },
    format: (value) => (value === undefined ? undefined : String(value)),
  }
}

/** Inteiro a partir de `min` (ex.: id na URL); fora disso vira `undefined` */
export function intCodec({ min }: { min?: number } = {}): SearchParamCodec<number | undefined> {
  const number = numberCodec()
  return {
    parse: (raw) => {
      const n = number.parse(raw)
      return n !== undefined && Number.isInteger(n) && (min === undefined || n >= min)
        ? n
        : undefined
    },
    format: number.format,
  }
}

/** Liga/desliga pela URL (`?nova=1`); desligado some da URL */
export const flagCodec: SearchParamCodec<boolean> = {
  parse: (raw) => raw === '1',
  format: (value) => (value ? '1' : undefined),
}
