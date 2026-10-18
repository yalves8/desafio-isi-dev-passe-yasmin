import { Condition, CONDITION_RULES } from './condition.js';
import type { Attributes } from './player-rating.js';
import type { Position } from './position.js';

export interface Starter {
  id: number;
  name: string;
  position: Position;
  condition: Condition;
  attributes: Attributes;
}

export type DuelAttribute = 'shooting' | 'passing' | 'dribbling' | 'defending';

interface DuelSide {
  player: Starter;
  attribute: DuelAttribute;
  value: number;
}

interface Duel {
  order: number;
  attackingSide: 'home' | 'away';
  attacker: DuelSide;
  defender: DuelSide;
  goal: boolean;
}

export type MatchResult = 'MANDANTE' | 'VISITANTE' | 'EMPATE';

interface MatchOutcome {
  duels: Duel[];
  homeGoals: number;
  awayGoals: number;
  result: MatchResult;
}

const ATTACK_ATTRIBUTE: Record<Position, DuelAttribute> = {
  ATA: 'shooting',
  MEI: 'passing',
  ZAG: 'dribbling',
  LAT: 'dribbling',
  GOL: 'defending',
};

/** O que o valor de um atributo depende: posição, condição e atributos do jogador */
type DuelPlayer = Pick<Starter, 'position' | 'condition' | 'attributes'>;

/** RN20 passo 3: atributo × 0,85 para MAL_CONDICIONADO, arredondado com meio para cima. */
function effectiveValue(player: DuelPlayer, attribute: DuelAttribute): number {
  const raw = player.attributes[attribute];
  const factor = CONDITION_RULES[player.condition].duelFactorPercent;
  return factor === 100 ? raw : Math.floor((raw * factor + 50) / 100);
}

function side(player: Starter, attribute: DuelAttribute): DuelSide {
  return { player, attribute, value: effectiveValue(player, attribute) };
}

export type DuelRole = 'attack' | 'defense';

/**
 * Papel de cada titular nos duelos (RN20), na ordem do elenco: goleiro e jogadores de linha de
 * trás para frente. O 1º de linha só defende, o 2º ataca e defende, o 3º e o 4º só atacam.
 * Tem de bater com `attacksOf` (o teste do domínio confere).
 */
export const DUEL_ROLES: readonly (readonly DuelRole[])[] = [
  ['defense'],
  ['defense'],
  ['attack', 'defense'],
  ['attack'],
  ['attack'],
];

export interface DuelValue {
  attribute: DuelAttribute;
  /** Atributo cadastrado */
  value: number;
  /** Valor que entra no duelo, já com o efeito da condição */
  matchValue: number;
}

/** Atributo e valores que o jogador usa ao atacar e ao defender (RN20) */
export function duelValues(player: DuelPlayer): Record<DuelRole, DuelValue> {
  const valueOf = (attribute: DuelAttribute): DuelValue => ({
    attribute,
    value: player.attributes[attribute],
    matchValue: effectiveValue(player, attribute),
  });
  return {
    attack: valueOf(ATTACK_ATTRIBUTE[player.position]),
    defense: valueOf('defending'),
  };
}

interface Team {
  goalkeeper: Starter;
  fieldPlayers: Starter[];
}

function toTeam(starters: Starter[]): Team {
  return { goalkeeper: starters[0], fieldPlayers: starters.slice(1) };
}

// Atacantes: 4º, 3º e 2º jogadores de linha; defensores: goleiro, 1º e 2º do adversário (RN20).
function attacksOf(
  attackingSide: 'home' | 'away',
  attackers: Team,
  defenders: Team,
  firstOrder: number,
): Duel[] {
  const [, second, third, fourth] = attackers.fieldPlayers;
  const [defenderFirst, defenderSecond] = defenders.fieldPlayers;
  const pairs: [Starter, Starter][] = [
    [fourth, defenders.goalkeeper],
    [third, defenderFirst],
    [second, defenderSecond],
  ];
  return pairs.map(([attacker, defender], index) => {
    const attack = side(attacker, ATTACK_ATTRIBUTE[attacker.position]);
    const defense = side(defender, 'defending');
    return {
      order: firstOrder + index,
      attackingSide,
      attacker: attack,
      defender: defense,
      goal: attack.value > defense.value,
    };
  });
}

/** Cada lista de titulares já vem na ordem do elenco: goleiro e depois os 4 jogadores de linha. */
export function playMatch(
  homeStarters: Starter[],
  awayStarters: Starter[],
): MatchOutcome {
  const home = toTeam(homeStarters);
  const away = toTeam(awayStarters);
  const duels = [
    ...attacksOf('home', home, away, 1),
    ...attacksOf('away', away, home, 4),
  ];
  const homeGoals = duels.filter(
    (d) => d.attackingSide === 'home' && d.goal,
  ).length;
  const awayGoals = duels.filter(
    (d) => d.attackingSide === 'away' && d.goal,
  ).length;
  return {
    duels,
    homeGoals,
    awayGoals,
    result: matchResult(homeGoals, awayGoals),
  };
}

/** Resultado pelo placar: quem marcou mais gols, ou EMPATE (RN20). */
export function matchResult(homeGoals: number, awayGoals: number): MatchResult {
  if (homeGoals === awayGoals) return 'EMPATE';
  return homeGoals > awayGoals ? 'MANDANTE' : 'VISITANTE';
}
