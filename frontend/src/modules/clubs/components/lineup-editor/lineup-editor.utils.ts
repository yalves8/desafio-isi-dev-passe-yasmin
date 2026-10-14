import type { Formation, Player, Position } from '@/api/types'
import { DEFAULT_FORMATION, FORMATIONS } from '../../clubs.constants'
import type {
  LineupRow,
  LineupSector,
  LineupSelection,
  LineupSlot,
  UsedAttribute,
} from '../../clubs.types'

const POSITION_ORDER: Position[] = ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA']

export function sectorOf(position: Position): LineupSector {
  if (position === 'GOL') return 'GOL'
  if (position === 'ZAG' || position === 'LAT') return 'DEF'
  if (position === 'MEI') return 'MID'
  return 'ATT'
}

/** Ordem do elenco (RN11): posição GOL → ATA, depois nome e id */
export function compareSquadOrder(a: Player, b: Player) {
  return (
    POSITION_ORDER.indexOf(a.position) - POSITION_ORDER.indexOf(b.position) ||
    a.name.localeCompare(b.name, 'pt-BR') ||
    a.id - b.id
  )
}

/** Vagas da formação: o goleiro e os jogadores de linha de trás para frente */
export function buildSlots(formation: Formation): LineupSlot[] {
  const counts = FORMATIONS[formation]
  const slots: LineupSlot[] = [{ key: 'GOL-1', sector: 'GOL' }]
  for (const sector of ['DEF', 'MID', 'ATT'] as const) {
    for (let i = 1; i <= counts[sector]; i++) slots.push({ key: `${sector}-${i}`, sector })
  }
  return slots
}

/**
 * Distribui os jogadores nas vagas do setor de cada um, na ordem do elenco. Setor incompleto
 * deixa as primeiras vagas vazias (como no Figma): quem sobra mantém a numeração do fundo.
 */
export function assignPlayers(formation: Formation, players: Player[]): LineupSelection {
  const slots = buildSlots(formation)
  const selection: LineupSelection = Object.fromEntries(slots.map((s) => [s.key, undefined]))
  for (const sector of ['GOL', 'DEF', 'MID', 'ATT'] as const) {
    const sectorSlots = slots.filter((s) => s.sector === sector)
    const sectorPlayers = players
      .filter((p) => sectorOf(p.position) === sector)
      .sort(compareSquadOrder)
      .slice(0, sectorSlots.length)
    const offset = sectorSlots.length - sectorPlayers.length
    sectorPlayers.forEach((player, i) => {
      selection[sectorSlots[offset + i].key] = player.id
    })
  }
  return selection
}

export function initialFormation(formation: Formation | null) {
  return formation ?? DEFAULT_FORMATION
}

const ATTACK: Record<Exclude<Position, 'GOL'>, { label: string; key: keyof Player }> = {
  ZAG: { label: 'Drible', key: 'dribbling' },
  LAT: { label: 'Drible', key: 'dribbling' },
  MEI: { label: 'Passe', key: 'passing' },
  ATA: { label: 'Finalização', key: 'shooting' },
}

/**
 * Atributos que cada titular usa na partida (RN20), pela numeração do jogador de linha:
 * o 1º só defende, o 2º ataca e defende, o 3º e o 4º só atacam; o goleiro defende.
 * Mostra os valores do cadastro: o efeito da condição só vale durante a partida.
 */
export function usedAttributes(player: Player, lineOrder: number): UsedAttribute[] {
  const defense = { label: 'Defesa', value: player.defending }
  if (player.position === 'GOL') return [defense]
  const attackInfo = ATTACK[player.position]
  const attack = { label: attackInfo.label, value: player[attackInfo.key] as number }
  if (lineOrder === 1) return [defense]
  if (lineOrder === 2) return [attack, defense]
  return [attack]
}

/**
 * Numeração dos jogadores de linha (1º = mais recuado): setores de trás para frente e, dentro
 * do setor, a ordem do elenco; vagas vazias contam, para o titular não mudar de papel.
 */
export function lineOrders(formation: Formation, starters: Player[]) {
  const orders = new Map<number, number>()
  let offset = 0
  for (const sector of ['DEF', 'MID', 'ATT'] as const) {
    const size = FORMATIONS[formation][sector]
    const inSector = starters.filter((p) => sectorOf(p.position) === sector).sort(compareSquadOrder)
    inSector.forEach((p, i) => orders.set(p.id, offset + size - inSector.length + i + 1))
    offset += size
  }
  return orders
}

/** Linhas da tabela de titulares: vaga, titular, candidatos e atributos usados */
export function buildRows(
  formation: Formation,
  selection: LineupSelection,
  squad: Player[],
): LineupRow[] {
  const byId = new Map(squad.map((p) => [p.id, p]))
  const chosen = new Set(Object.values(selection).filter((id) => id !== undefined))
  const starters = [...chosen].map((id) => byId.get(id)).filter((p): p is Player => !!p)
  const orders = lineOrders(formation, starters)

  return buildSlots(formation).map((slot) => {
    const player = selection[slot.key] === undefined ? undefined : byId.get(selection[slot.key]!)
    const candidates = squad
      .filter(
        (p) =>
          sectorOf(p.position) === slot.sector &&
          p.condition !== 'DOENTE' &&
          (p.id === player?.id || !chosen.has(p.id)),
      )
      .sort(compareSquadOrder)
    return {
      slot,
      player,
      candidates,
      attributes: player ? usedAttributes(player, orders.get(player.id) ?? 0) : [],
    }
  })
}

/** Alguma formação fecha com os jogadores que podem ser escalados (fora os DOENTE)? */
export function canAnyFormationClose(squad: Player[]) {
  const available = squad.filter((p) => p.condition !== 'DOENTE')
  const count = (sector: LineupSector) =>
    available.filter((p) => sectorOf(p.position) === sector).length
  if (count('GOL') < 1) return false
  return Object.values(FORMATIONS).some(
    (f) => count('DEF') >= f.DEF && count('MID') >= f.MID && count('ATT') >= f.ATT,
  )
}

/** "Ana e Bia estão mal condicionadas" / "Ana, Bia e Caio estão…" */
export function joinNames(names: string[]) {
  if (names.length <= 1) return names[0] ?? ''
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`
}
