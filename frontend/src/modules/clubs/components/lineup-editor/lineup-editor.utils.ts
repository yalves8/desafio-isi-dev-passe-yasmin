import type { Formation, Player } from '@/api/types'
import { CONDITION_RULES, POSITION_SECTOR } from '@/modules/players'
import { DEFAULT_FORMATION, FORMATIONS, SECTORS } from '../../clubs.constants'
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
    // Figma: "Sem MEI no elenco" quando ninguém da posição existe; "Sem ZAG ou LAT" quando há,
    // mas está em outra vaga ou DOENTE
    const inSquad = squad.some((p) => POSITION_SECTOR[p.position] === slot.sector)
    const { positions } = SECTORS[slot.sector]
    const emptyText = inSquad ? `Sem ${positions}` : `Sem ${positions} no elenco`
    const error =
      showErrors && !player
        ? candidates.length > 0
          ? 'Escolha o titular.'
          : 'Nenhum jogador disponível para esta vaga: troque a formação.'
        : undefined
    return { slot, player, candidates, error, emptyText }
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

/**
 * Texto do aviso de escalação salva incompleta (Figma C11): a formação que continua salva e, se
 * nenhuma formação fecha, quem está DOENTE e o que sobra para escalar.
 */
export function describeIncompleteLineup(
  formation: Formation,
  starters: number,
  squad: Player[],
  canClose: boolean,
) {
  const left = 5 - starters
  const lead = `${left === 1 ? 'Um titular saiu' : `${left} titulares saíram`} da escalação: a ${formation} continua salva, ${starters === 0 ? 'sem titulares' : `com ${starters} ${starters === 1 ? 'titular' : 'titulares'}`}.`
  if (canClose) return `${lead} Escolha os titulares e salve de novo.`

  const sick = squad.filter((p) => !CONDITION_RULES[p.condition].canStart).map((p) => p.name)
  const available = squad.filter((p) => CONDITION_RULES[p.condition].canStart)
  const keepers = available.filter((p) => POSITION_SECTOR[p.position] === 'GK').length
  const fielders = available.length - keepers
  const leftOver =
    keepers === 0
      ? 'não sobra goleiro que possa ser escalado'
      : fielders === 1
        ? 'sobra 1 jogador de linha que pode ser escalado'
        : `sobram ${fielders} jogadores de linha que podem ser escalados`
  const reason =
    sick.length === 0
      ? leftOver.charAt(0).toUpperCase() + leftOver.slice(1)
      : `Com ${sick.length === 1 ? `o ${sick[0]} DOENTE` : `${joinNames(sick)} DOENTES`}, ${leftOver}`
  return `${lead} ${reason}, e nenhuma formação fecha: o clube precisa comprar um jogador e escalar de novo.`
}
