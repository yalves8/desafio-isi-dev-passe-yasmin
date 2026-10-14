import type { ReactNode } from 'react'
import { Brand } from './brand'
import { ScheduleStrip } from './schedule-strip'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative hidden flex-col overflow-hidden bg-primary px-10 py-10 text-primary-foreground lg:flex">
        <Brand inverted className="text-white" />
        <p className="mt-10 max-w-xs font-heading text-3xl leading-tight font-bold text-white">
          A agenda de cada sala, sem choque de horário.
        </p>
        <div className="mt-10 flex-1">
          <ScheduleStrip />
        </div>
      </aside>

      <main className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <Brand className="mb-10 lg:hidden" />
          {children}
        </div>
      </main>
    </div>
  )
}
