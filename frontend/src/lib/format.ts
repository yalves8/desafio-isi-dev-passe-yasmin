const TIME_ZONE = 'America/Sao_Paulo'
const dateFormat = new Intl.DateTimeFormat('pt-BR', { timeZone: TIME_ZONE })
const timeFormat = new Intl.DateTimeFormat('pt-BR', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
})

const moneyFormat = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const integerFormat = new Intl.NumberFormat('pt-BR')

/** Data no horário de Brasília (ex.: 03/11/2028) */
export function formatDate(iso: string) {
  return dateFormat.format(new Date(iso))
}

/** Hora no horário de Brasília (ex.: 11:20) */
export function formatTime(iso: string) {
  return timeFormat.format(new Date(iso))
}

/** Valores em moedas: 2 casas e vírgula decimal, sem símbolo (ex.: 1.234,50) */
export function formatMoney(value: number) {
  return moneyFormat.format(value)
}

/** Valor com sinal, com "+" na entrada e "-" na saída (ex.: +3,00, -5,70 e 0,00) */
export function formatSigned(value: number) {
  if (value === 0) return formatMoney(0)
  return `${value > 0 ? '+' : '-'}${formatMoney(Math.abs(value))}`
}

/** Inteiro com separador de milhar (ex.: 1.089) */
export function formatInteger(value: number) {
  return integerFormat.format(value)
}

export function plural(n: number, singular: string, pluralForm = `${singular}s`) {
  return `${n} ${n === 1 ? singular : pluralForm}`
}

/** Iniciais do primeiro e do último nome, em maiúsculas (ex.: "Ênio Carvalho" → "ÊC") */
export function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  const first = words[0][0]
  const last = words.length > 1 ? words[words.length - 1][0] : ''
  return `${first}${last}`.toUpperCase()
}

/** Remove acentos e passa para minúsculas (comparações como as da API) */
export function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}
