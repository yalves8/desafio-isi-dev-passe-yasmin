import { Shield } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatMoney } from '@/lib/format'
import type { ClubSelectProps } from './club-select.types'

/** Escolha de um clube da liga nos formulários: "Nome (SIGLA)", com o caixa quando pedido */
export function ClubSelect({
  id,
  clubs,
  value,
  onChange,
  onBlur,
  invalid = false,
  disabled = false,
  showCash = false,
}: ClubSelectProps) {
  return (
    <Select
      value={value === undefined ? '' : String(value)}
      onValueChange={(v) => onChange(Number(v))}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        className="h-9 w-full gap-2 pl-3 text-left *:data-[slot=select-value]:flex-1"
        aria-invalid={invalid}
        aria-describedby={`${id}-message`}
        onBlur={onBlur}
      >
        <Shield className="text-muted-foreground" aria-hidden />
        <SelectValue placeholder="Escolha o clube" />
      </SelectTrigger>
      <SelectContent>
        {clubs.map((club) => (
          <SelectItem key={club.id} value={String(club.id)}>
            {club.name} ({club.acronym}){showCash && ` · caixa ${formatMoney(club.cash)}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
