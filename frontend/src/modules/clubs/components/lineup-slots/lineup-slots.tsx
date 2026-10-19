import { Shirt } from 'lucide-react'
import { DataTable } from '@/components/data-display/data-table/data-table'
import type { DataTableColumn } from '@/components/data-display/data-table/data-table.types'
import { FieldMessage } from '@/components/form/field-message/field-message'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TableCell, TableRow } from '@/components/ui/table'
import { ATTRIBUTE_LABEL } from '@/modules/league'
import { ConditionBadge } from '@/modules/players'
import { SECTORS } from '../../clubs.constants'
import type { LineupSlotsProps } from './lineup-slots.types'

// Proporções do Figma (C06), relativas à largura do card; "Atributos usados" fica com a sobra
const COLUMNS: DataTableColumn[] = [
  { label: 'Vaga', className: 'w-[16%]' },
  { label: 'Titular', className: 'w-[29%]' },
  { label: 'Condição', className: 'w-[21%]' },
  { label: 'Overall', numeric: true, className: 'w-[8%]' },
  { label: 'Atributos usados' },
]

/**
 * Uma linha por vaga: titular escolhido, condição, overall e os atributos que ele usa na partida.
 * Quem ataca ou defende em cada vaga e o valor de cada atributo vêm da API (RN20).
 */
export function LineupSlots({ rows, duelRoles, duelValues, onSelect }: LineupSlotsProps) {
  // Setor com mais de uma vaga leva o número no nome ("Defesa 2"), para cada vaga ter nome único
  const repeated = (sector: string) => rows.filter((r) => r.slot.sector === sector).length > 1
  return (
    <DataTable
      columns={COLUMNS}
      rows={rows}
      rowKey={(row) => row.slot.key}
      empty={{ icon: Shirt, title: 'Nenhuma vaga na formação' }}
      renderRow={({ slot, player, candidates, error, emptyText }) => {
        const roles = duelRoles[rows.findIndex((r) => r.slot.key === slot.key)] ?? []
        const duel = player && duelValues.get(player.id)
        const sector = SECTORS[slot.sector]
        const id = `slot-${slot.key}`
        const number = repeated(slot.sector) ? slot.key.split('-')[1] : undefined
        return (
          <TableRow className="h-15">
            <TableCell className="pl-4">
              <label htmlFor={id} className="flex flex-col leading-tight">
                <span className="font-medium">
                  {sector.label}
                  {number && (
                    <>
                      {' '}
                      <span className="sr-only">{number}</span>
                    </>
                  )}
                </span>{' '}
                <span className="text-xs text-muted-foreground">{sector.positions}</span>
              </label>
            </TableCell>
            <TableCell className="py-2">
              <div className="flex flex-col gap-1">
                <Select
                  value={player ? String(player.id) : ''}
                  onValueChange={(value) => onSelect(slot.key, Number(value))}
                  disabled={candidates.length === 0}
                >
                  <SelectTrigger
                    id={id}
                    data-testid={id}
                    className="h-9 w-full"
                    aria-invalid={!!error}
                    aria-describedby={error ? `${id}-message` : undefined}
                  >
                    <SelectValue
                      placeholder={candidates.length === 0 ? emptyText : 'Escolha o titular'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates.map((candidate) => (
                      <SelectItem key={candidate.id} value={String(candidate.id)}>
                        {candidate.name} ({candidate.position})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldMessage id={id} error={error} />
              </div>
            </TableCell>
            <TableCell>{player && <ConditionBadge condition={player.condition} />}</TableCell>
            <TableCell className="text-right font-semibold tabular-nums">
              {player?.overall}
            </TableCell>
            <TableCell className="pr-4">
              {duel && (
                <span data-testid="duel-attributes" className="flex gap-4 tabular-nums">
                  {roles.map((role) => {
                    const { attribute, value } = duel[role]
                    return (
                      <span key={role}>
                        <span className="text-muted-foreground">
                          {ATTRIBUTE_LABEL[attribute].long}
                        </span>{' '}
                        <span className="font-semibold">{value}</span>
                      </span>
                    )
                  })}
                </span>
              )}
            </TableCell>
          </TableRow>
        )
      }}
    />
  )
}
