import type { Formation, Player } from '@/api/types'
import { CONDITION_RULES, POSITION_SECTOR } from '@/modules/players'
import { DEFAULT_FORMATION, FORMATIONS } from '../../clubs.constants'
import type { LineupRow, LineupSector, LineupSelection, LineupSlot } from '../../clubs.types'

/** Vagas da formação: o goleiro e os jogadores de linha de trás para frente */
export function buildSlots(formation: Formation): LineupSlot[] {
  const counts = FORMATIONS[formation]
  const slots: LineupSlot[] = [{ key: 'GK-1', sector: 'GK' }]
  for (const sector of ['DEF', 'MID', 'ATT'] as const) {
    for (let i = 1; i <= counts[sector]; i++) slots.push({ key: `${sector}-${i}`, sector })
  }
  return slots
}

/**
 * Distribui os jogadores nas vagas do setor de cada um, na ordem em que chegam (a do elenco
 * devolvida pela API, RN11). Setor incompleto deixa as primeiras vagas vazias (como no Figma):
 * quem sobra mantém a numeração do fundo.
 */
export function assignPlayers(formation: Formation, players: Player[]): LineupSelection {
  const slots = buildSlots(formation)
  const selection: LineupSelection = Object.fromEntries(slots.map((s) => [s.key, undefined]))
  for (const sector of ['GK', 'DEF', 'MID', 'ATT'] as const) {
    const sectorSlots = slots.filter((s) => s.sector === sector)
    const sectorPlayers = players
      .filter((p) => POSITION_SECTOR[p.position] === sector)
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

/**
 * Linhas da tabela de titulares: vaga, titular e candidatos (na ordem do elenco da API).
 * Com `showErrors` (tentativa de salvar), a vaga vazia recebe a mensagem junto ao campo.
 */
export function buildRows(
  formation: Formation,
  selection: LineupSelection,
  squad: Player[],
  showErrors = false,
): LineupRow[] {
  const byId = new Map(squad.map((p) => [p.id, p]))
  const chosen = new Set(Object.values(selection).filter((id) => id !== undefined))

  return buildSlots(formation).map((slot) => {
    const player = selection[slot.key] === undefined ? undefined : byId.get(selection[slot.key]!)
    const candidates = squad.filter(
      (p) =>
        POSITION_SECTOR[p.position] === slot.sector &&
        CONDITION_RULES[p.condition].canStart &&
        (p.id === player?.id || !chosen.has(p.id)),
    )
    const error =
      showErrors && !player
        ? candidates.length > 0
          ? 'Escolha o titular.'
          : 'Nenhum jogador disponível para esta vaga: troque a formação.'
        : undefined
    return { slot, player, candidates, error }
  })
}

/** Alguma formação fecha com os jogadores que podem ser escalados (fora os DOENTE)? */
export function canAnyFormationClose(squad: Player[]) {
  const available = squad.filter((p) => CONDITION_RULES[p.condition].canStart)
  const count = (sector: LineupSector) =>
    available.filter((p) => POSITION_SECTOR[p.position] === sector).length
  if (count('GK') < 1) return false
  return Object.values(FORMATIONS).some(
    (f) => count('DEF') >= f.DEF && count('MID') >= f.MID && count('ATT') >= f.ATT,
  )
}

/** "Ana e Bia estão mal condicionadas" / "Ana, Bia e Caio estão…" */
export function joinNames(names: string[]) {
  if (names.length <= 1) return names[0] ?? ''
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`
}
