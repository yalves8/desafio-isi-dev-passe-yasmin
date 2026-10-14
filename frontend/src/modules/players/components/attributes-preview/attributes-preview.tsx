import { ChartBarBig } from 'lucide-react'
import { AttributeBar } from '../attribute-bar/attribute-bar'
import type { AttributesPreviewProps } from './attributes-preview.types'

/** Desenha só os valores digitados; não calcula overall nem valor base (isso é da API) */
export function AttributesPreview({ preview }: AttributesPreviewProps) {
  return (
    <aside
      aria-label="Prévia dos atributos"
      className="flex flex-col gap-3 rounded-xl border bg-muted/40 p-3"
    >
      <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <ChartBarBig className="size-3.5" aria-hidden />
        Prévia dos atributos
      </p>
      {preview.status === 'ready' ? (
        <>
          <ul className="flex flex-col gap-2">
            {preview.items.map((item) => (
              <AttributeBar key={item.label} compact potential={preview.potential} {...item} />
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            {preview.potential !== undefined
              ? `Faixa clara: até o potencial (${preview.potential}). `
              : ''}
            A prévia só desenha os valores digitados; não calcula overall nem valor base.
          </p>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-6 text-center text-xs text-muted-foreground">
          <ChartBarBig className="size-5 text-zinc-300" aria-hidden />
          {preview.status === 'invalid'
            ? 'Corrija os valores destacados para ver a prévia.'
            : 'Preencha os seis atributos para ver a prévia.'}
        </div>
      )}
    </aside>
  )
}
