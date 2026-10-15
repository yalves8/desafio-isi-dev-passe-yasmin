import { STANDINGS_CRITERIA } from '../../league.constants'

/** Ordem da tabela (Figma L05): critérios de classificação da RN21, nesta ordem */
export function StandingsCriteria() {
  return (
    <section
      aria-labelledby="standings-criteria-title"
      className="overflow-hidden rounded-xl border bg-card shadow-2xs"
    >
      <header className="border-b px-5 py-4">
        <h2 id="standings-criteria-title" className="text-base font-semibold">
          Ordem da tabela
        </h2>
        <p className="text-xs text-muted-foreground">Critérios de classificação, nesta ordem.</p>
      </header>
      <ol className="flex flex-col gap-3 px-5 py-4">
        {STANDINGS_CRITERIA.map((criterion, index) => (
          <li key={criterion} className="flex items-center gap-3 text-sm">
            <span className="flex size-5 items-center justify-center rounded-md bg-muted text-xs font-medium">
              {index + 1}
            </span>
            {criterion}
          </li>
        ))}
      </ol>
    </section>
  )
}
