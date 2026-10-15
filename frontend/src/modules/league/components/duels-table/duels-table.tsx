import { Swords, Volleyball } from 'lucide-react'
import type { Duel, DuelPlayer } from '@/api/types'
import { DataTable } from '@/components/data-display/data-table/data-table'
import type { DataTableColumn } from '@/components/data-display/data-table/data-table.types'
import { Tag } from '@/components/data-display/tag/tag'
import { TableCell, TableRow } from '@/components/ui/table'
import { plural } from '@/lib/format'
import { PlayerAvatar } from '@/modules/players'
import { ATTRIBUTE_LABEL } from '../../league.constants'
import { slotLabel, startersFromDuels } from '../../league.utils'
import type { DuelsTableProps } from './duels-table.types'

const COLUMNS: DataTableColumn[] = [
  { label: 'Duelo' },
  { label: 'Atacante' },
  { label: 'Ataque' },
  { label: 'Defensor' },
  { label: 'Defesa' },
  { label: 'Resultado' },
]

function PlayerCell({ player, detail }: { player: DuelPlayer; detail: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <PlayerAvatar id={player.player_id} name={player.player_name} />
      <span className="leading-tight">
        <span className="block font-medium">{player.player_name}</span>
        <span className="text-xs text-muted-foreground">{detail}</span>
      </span>
    </span>
  )
}

function ValueCell({ player }: { player: DuelPlayer }) {
  return (
    <span className="text-muted-foreground">
      {ATTRIBUTE_LABEL[player.attribute].long}{' '}
      <span className="font-semibold text-foreground tabular-nums">{player.value}</span>
    </span>
  )
}

/** Duelos da partida (Figma L03): os 3 ataques do mandante e depois os 3 do visitante (RN20) */
export function DuelsTable({ match, clubsById }: DuelsTableProps) {
  const duels = [...(match.duels ?? [])].sort((a, b) => a.order - b.order)
  const sides = (['home', 'away'] as const).map((side) => {
    const club = match[side]
    const opponent = match[side === 'home' ? 'away' : 'home']
    const own = startersFromDuels(duels, club.club_id)
    const rival = startersFromDuels(duels, opponent.club_id)
    const roleOf = (starters: typeof own, playerId: number, position: DuelPlayer['position']) =>
      slotLabel(starters.find((s) => s.playerId === playerId)?.slot ?? 'GK', position)
    const attacks = duels.filter((d) => d.attacking_club_id === club.club_id)
    return {
      side,
      club,
      opponent,
      attacks,
      attackerDetail: (d: Duel) =>
        `${roleOf(own, d.attacker.player_id, d.attacker.position)} · ${club.club_name}`,
      defenderDetail: (d: Duel) =>
        `${roleOf(rival, d.defender.player_id, d.defender.position)} · ${opponent.club_name}`,
    }
  })

  return (
    <DataTable
      columns={COLUMNS}
      rows={sides}
      rowKey={({ side }) => side}
      empty={{ icon: Swords, title: 'Nenhum duelo gravado nesta partida' }}
      renderRow={({ side, club, attacks, attackerDetail, defenderDetail }) => (
        <>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableCell colSpan={5} className="px-2 pl-4 text-sm">
              <span className="inline-flex items-center gap-2 font-medium">
                <Tag variant="muted">{clubsById.get(club.club_id)?.acronym ?? '—'}</Tag>
                Ataques do {club.club_name} ({side === 'home' ? 'mandante' : 'visitante'})
              </span>
            </TableCell>
            <TableCell className="pr-4 text-right text-sm text-muted-foreground">
              {plural(club.goals, 'gol')}
            </TableCell>
          </TableRow>
          {attacks.map((duel) => (
            <TableRow key={duel.order} className="h-15">
              <TableCell className="px-2 pl-4">
                <Tag className="tabular-nums">{duel.order}</Tag>
              </TableCell>
              <TableCell className="px-2">
                <PlayerCell player={duel.attacker} detail={attackerDetail(duel)} />
              </TableCell>
              <TableCell className="px-2">
                <ValueCell player={duel.attacker} />
              </TableCell>
              <TableCell className="px-2">
                <PlayerCell player={duel.defender} detail={defenderDetail(duel)} />
              </TableCell>
              <TableCell className="px-2">
                <ValueCell player={duel.defender} />
              </TableCell>
              <TableCell className="px-2 pr-4">
                {duel.goal ? (
                  <Tag variant="success">
                    <Volleyball className="size-3" aria-hidden /> Gol
                  </Tag>
                ) : (
                  <Tag>Sem gol</Tag>
                )}
              </TableCell>
            </TableRow>
          ))}
        </>
      )}
    />
  )
}
