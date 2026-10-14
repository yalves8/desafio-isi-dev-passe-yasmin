import { Eye, HeartPulse, MoreHorizontal, Pencil, ShoppingCart, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { PlayerRowMenuProps } from './player-row-menu.types'

/** Menu "…" da linha; Excluir só fica disponível para jogador livre (RN09) */
export function PlayerRowMenu({ player, actions }: PlayerRowMenuProps) {
  const isFree = player.club_id === null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Ações de ${player.name}`}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal text-muted-foreground">
          {player.name}
        </DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => actions.onDetails(player)}>
          <Eye /> Ver detalhes
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => actions.onEdit(player)}>
          <Pencil /> Editar
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => actions.onCondition(player)}>
          <HeartPulse /> Alterar condição
        </DropdownMenuItem>
        {isFree && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={!!actions.buyDisabledReason}
              onSelect={() => actions.onBuy(player)}
              className="flex-col items-start gap-0.5"
            >
              <span className="flex items-center gap-2">
                <ShoppingCart /> Comprar
              </span>
              {actions.buyDisabledReason && (
                <span className="pl-6 text-xs text-muted-foreground">
                  {actions.buyDisabledReason}
                </span>
              )}
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={!isFree}
          onSelect={() => actions.onDelete(player)}
          className="flex-col items-start gap-0.5"
        >
          <span className="flex items-center gap-2">
            <Trash2 /> Excluir
          </span>
          <span className="pl-6 text-xs text-muted-foreground">
            {isFree
              ? 'Disponível porque o jogador está livre.'
              : 'Só jogador livre pode ser excluído.'}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
