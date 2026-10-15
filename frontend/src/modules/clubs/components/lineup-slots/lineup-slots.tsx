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
import { ConditionBadge } from '@/modules/players'
import { SECTORS } from '../../clubs.constants'
import type { LineupSlotsProps } from './lineup-slots.types'

const COLUMNS: DataTableColumn[] = [
  { label: 'Vaga' },
  { label: 'Titular' },
  { label: 'Condição' },
  { label: 'Overall', numeric: true },
]

/** Uma linha por vaga: titular escolhido, condição e overall devolvidos pela API */
export function LineupSlots({ rows, onSelect }: LineupSlotsProps) {
  return (
    <DataTable
      columns={COLUMNS}
      rows={rows}
      rowKey={(row) => row.slot.key}
      empty={{ icon: Shirt, title: 'Nenhuma vaga na formação' }}
      renderRow={({ slot, player, candidates, error }) => {
        const sector = SECTORS[slot.sector]
        const id = `slot-${slot.key}`
        return (
          <TableRow className="h-15">
            <TableCell className="pl-4">
              <label htmlFor={id} className="flex flex-col leading-tight">
                <span className="font-medium">{sector.label}</span>
                <span className="text-xs text-muted-foreground">{sector.positions}</span>
              </label>
            </TableCell>
            <TableCell className="w-60 py-2">
              <div className="flex flex-col gap-1">
                <Select
                  value={player ? String(player.id) : ''}
                  onValueChange={(value) => onSelect(slot.key, Number(value))}
                  disabled={candidates.length === 0}
                >
                  <SelectTrigger
                    id={id}
                    className="h-9 w-full"
                    aria-invalid={!!error}
                    aria-describedby={error ? `${id}-message` : undefined}
                  >
                    <SelectValue
                      placeholder={candidates.length === 0 ? sector.empty : 'Escolha o titular'}
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
            <TableCell className="pr-4 text-right font-semibold tabular-nums">
              {player?.overall}
            </TableCell>
          </TableRow>
        )
      }}
    />
  )
}
