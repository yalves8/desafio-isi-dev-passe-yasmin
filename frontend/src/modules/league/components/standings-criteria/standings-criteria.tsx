import { SectionCard } from '@/components/layout/section-card/section-card'
import { STANDINGS_CRITERIA } from '../../league.constants'

/** Ordem da tabela (Figma L05): critérios de classificação da RN21, nesta ordem */
export function StandingsCriteria() {
  return (
    <SectionCard title="Ordem da tabela" description="Critérios de classificação, nesta ordem.">
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
    </SectionCard>
  )
}
