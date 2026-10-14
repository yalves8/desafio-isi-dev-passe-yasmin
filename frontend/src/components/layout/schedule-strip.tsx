/**
 * Assinatura visual das telas públicas: um dia de agenda de sala (07:00–22:00),
 * desenhado com os mesmos intervalos [início, fim) que a API valida.
 */
const START = 7
const END = 22
const HOURS = Array.from({ length: END - START + 1 }, (_, i) => START + i)

const BLOCKS = [
  { start: '08:00', end: '10:00', label: 'Aula · Lógica', tone: 'primary' },
  { start: '10:00', end: '11:30', label: 'Reunião', tone: 'signal' },
  { start: '13:30', end: '15:00', label: 'Oficina', tone: 'primary' },
  { start: '19:00', end: '21:30', label: 'Turma noite', tone: 'signal' },
] as const

const toHours = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h + m / 60
}
const pct = (hhmm: string) => ((toHours(hhmm) - START) / (END - START)) * 100

export function ScheduleStrip() {
  return (
    <div aria-hidden className="relative h-full min-h-[28rem] select-none">
      {HOURS.map((h) => (
        <div
          key={h}
          className="absolute inset-x-0 flex items-center gap-3"
          style={{ top: `${((h - START) / (END - START)) * 100}%` }}
        >
          <span className="w-11 -translate-y-1/2 font-mono text-[11px] text-white/45 tabular-nums">
            {String(h).padStart(2, '0')}:00
          </span>
          <span className="h-px flex-1 -translate-y-1/2 bg-white/10" />
        </div>
      ))}

      {BLOCKS.map((b, i) => (
        <div
          key={b.start}
          className={
            'absolute right-0 left-14 flex animate-in flex-col justify-between rounded-md border-l-4 px-3 py-1.5 fill-mode-both fade-in slide-in-from-left-2 ' +
            (b.tone === 'signal'
              ? 'border-signal bg-signal/90 text-signal-foreground'
              : 'border-white/70 bg-[color-mix(in_oklch,var(--primary),white_16%)] text-white')
          }
          style={{
            top: `${pct(b.start)}%`,
            height: `${pct(b.end) - pct(b.start)}%`,
            animationDelay: `${150 + i * 90}ms`,
            animationDuration: '500ms',
          }}
        >
          <span className="text-xs leading-tight font-semibold">{b.label}</span>
          <span className="font-mono text-[11px] opacity-75">
            {b.start}–{b.end}
          </span>
        </div>
      ))}
    </div>
  )
}
