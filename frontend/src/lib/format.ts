const dateFormat = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' })

const moneyFormat = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatDate(iso: string) {
  return dateFormat.format(new Date(iso))
}

/** Valores em moedas: 2 casas e vírgula decimal, sem símbolo (ex.: 1.234,50). */
export function formatMoney(value: number) {
  return moneyFormat.format(value)
}

export function plural(n: number, singular: string, pluralForm = `${singular}s`) {
  return `${n} ${n === 1 ? singular : pluralForm}`
}

/** Iniciais do primeiro e do último nome, em maiúsculas (ex.: "Ênio Carvalho" → "ÊC"). */
export function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  const first = words[0][0]
  const last = words.length > 1 ? words[words.length - 1][0] : ''
  return `${first}${last}`.toUpperCase()
}
