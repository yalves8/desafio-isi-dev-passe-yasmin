import { z } from 'zod'
import type { BuyPlayerInput } from '@/api/types'

/**
 * Validações da compra, espelhando a API (RN01 e limites de `loyalty_until`):
 * o formulário recusa antes de enviar o que a API recusaria. Caixa, elenco e recompra
 * (RN12 a RN14) só a API decide: a recusa 409 aparece no diálogo.
 */

export const MAX_LOYALTY_DAYS = 1095
const DAY_MS = 24 * 60 * 60 * 1000
const BRASILIA_OFFSET = '-03:00'

const brasiliaParts = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** Data e hora do formulário no formato da RN01 (ex.: 2027-03-02T10:15-03:00) */
export function toLoyaltyUntil(date: string, time: string) {
  return `${date}T${time}${BRASILIA_OFFSET}`
}

/** Data (AAAA-MM-DD) e hora (HH:MM) de um instante no horário de Brasília */
function brasiliaDateTime(instant: Date) {
  const parts = Object.fromEntries(
    brasiliaParts.formatToParts(instant).map((part) => [part.type, part.value]),
  )
  return {
    year: Number(parts.year),
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  }
}

/** Sugestão inicial: um ano depois de agora, no horário de Brasília (29/02 vira 28/02) */
export function defaultLoyaltyUntil(now: Date) {
  const { year, date, time } = brasiliaDateTime(now)
  const next = year + 1
  const isLeap = (next % 4 === 0 && next % 100 !== 0) || next % 400 === 0
  const monthDay = date.slice(5) === '02-29' && !isLeap ? '02-28' : date.slice(5)
  return { date: `${next}-${monthDay}`, time }
}

/**
 * Datas que o calendário oferece: de hoje (um horário mais tarde hoje ainda vale) até o dia
 * em que se completam 1.095 dias. Nos dois extremos o horário decide, e quem avisa é a validação.
 */
export function loyaltyDateRange(now: Date) {
  return {
    min: brasiliaDateTime(now).date,
    max: brasiliaDateTime(new Date(now.getTime() + MAX_LOYALTY_DAYS * DAY_MS)).date,
  }
}

/** Instante da data e hora informadas, ou null se não existem (ex.: 30/02): nunca ajusta */
function parseLoyalty(date: string, time: string) {
  const instant = new Date(toLoyaltyUntil(date, time))
  if (Number.isNaN(instant.getTime())) return null
  const back = brasiliaDateTime(instant)
  return back.date === date && back.time === time ? instant : null
}

/** `now` é lido no envio, para valer o instante da compra */
export function buildBuyPlayerSchema(now: () => Date = () => new Date()) {
  return z
    .object({
      clubId: z.string().min(1, 'Escolha o clube comprador.'),
      date: z.string().min(1, 'Informe a data.'),
      time: z.string().min(1, 'Informe a hora.'),
    })
    .superRefine(({ date, time }, ctx) => {
      if (!date || !time) return
      const instant = parseLoyalty(date, time)
      const issue = (message: string) => ctx.addIssue({ code: 'custom', path: ['date'], message })
      if (!instant) return issue('Data ou hora inválida.')
      const diff = instant.getTime() - now().getTime()
      if (diff <= 0) return issue('O fim da fidelidade precisa ser depois de agora.')
      if (diff > MAX_LOYALTY_DAYS * DAY_MS) return issue('No máximo 1.095 dias depois de agora.')
    })
    .transform(({ clubId, date, time }): BuyPlayerInput => ({
      club_id: Number(clubId),
      loyalty_until: toLoyaltyUntil(date, time),
    }))
}

export type BuyPlayerFormInput = z.input<ReturnType<typeof buildBuyPlayerSchema>>
