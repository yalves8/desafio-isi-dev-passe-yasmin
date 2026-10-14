import { useEffect, useState } from 'react'

const format = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** Hora de Brasília: a mesma referência que a API usa para "passado" e "futuro". */
export function useBrasiliaClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])
  return format.format(now).replace('.', '').replace(',', ' ·')
}
