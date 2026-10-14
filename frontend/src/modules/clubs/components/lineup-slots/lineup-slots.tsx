import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConditionBadge } from '@/modules/players'
import { SECTORS } from '../../clubs.constants'
import type { LineupSlotsProps } from './lineup-slots.types'

/** Uma linha por vaga: titular escolhido, condição, overall e atributos usados na partida */
export function LineupSlots({ rows, onSelect }: LineupSlotsProps) {
  return (
    <Table>
      <TableHeader className="bg-muted/60">
        <TableRow className="hover:bg-transparent">
          <TableHead className="h-10 pl-4 font-medium text-muted-foreground">Vaga</TableHead>
          <TableHead className="h-10 font-medium text-muted-foreground">Titular</TableHead>
          <TableHead className="h-10 font-medium text-muted-foreground">Condição</TableHead>
          <TableHead className="h-10 text-right font-medium text-muted-foreground">
            Overall
          </TableHead>
          <TableHead className="h-10 pr-4 font-medium text-muted-foreground">
            Atributos usados
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(({ slot, player, candidates, attributes }) => {
          const sector = SECTORS[slot.sector]
          const id = `slot-${slot.key}`
          return (
            <TableRow key={slot.key} className="h-15">
              <TableCell className="pl-4">
                <label htmlFor={id} className="flex flex-col leading-tight">
                  <span className="font-medium">{sector.label}</span>
                  <span className="text-xs text-muted-foreground">{sector.positions}</span>
                </label>
              </TableCell>
              <TableCell className="w-60">
                <Select
                  value={player ? String(player.id) : ''}
                  onValueChange={(value) => onSelect(slot.key, Number(value))}
                  disabled={candidates.length === 0}
                >
                  <SelectTrigger id={id} className="h-9 w-full">
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
              </TableCell>
              <TableCell>{player && <ConditionBadge condition={player.condition} />}</TableCell>
              <TableCell className="text-right font-semibold tabular-nums">
                {player?.overall}
              </TableCell>
              <TableCell className="pr-4">
                <span className="flex flex-wrap gap-x-4">
                  {attributes.map((attribute) => (
                    <span key={attribute.label} className="text-muted-foreground">
                      {attribute.label}{' '}
                      <span className="font-medium text-foreground tabular-nums">
                        {attribute.value}
                      </span>
                    </span>
                  ))}
                </span>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
