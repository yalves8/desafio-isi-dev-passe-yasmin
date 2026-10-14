import type { Condition } from './market-value.js';
import type { Attributes, Position } from './player-rating.js';

export interface Starter {
  id: number;
  name: string;
  position: Position;
  condition: Condition;
  attributes: Attributes;
}

export type DuelAttribute = 'shooting' | 'passing' | 'dribbling' | 'defending';

export interface DuelSide {
  player: Starter;
  attribute: DuelAttribute;
  value: number;
}

export interface Duel {
  order: number;
  attackingSide: 'home' | 'away';
  attacker: DuelSide;
  defender: DuelSide;
  goal: boolean;
}

export type MatchResult = 'MANDANTE' | 'VISITANTE' | 'EMPATE';

export interface MatchOutcome {
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

const CONDITION_FACTOR_PERCENT: Partial<Record<Condition, number>> = {
  MAL_CONDICIONADO: 85,
};

/** RN20 passo 3: atributo × 0,85 para MAL_CONDICIONADO, arredondado com meio para cima. */
function effectiveValue(player: Starter, attribute: DuelAttribute): number {
  const raw = player.attributes[attribute];
  const factor = CONDITION_FACTOR_PERCENT[player.condition];
  return factor === undefined ? raw : Math.floor((raw * factor + 50) / 100);
}

function side(player: Starter, attribute: DuelAttribute): DuelSide {
  return { player, attribute, value: effectiveValue(player, attribute) };
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
  const result: MatchResult =
    homeGoals === awayGoals
      ? 'EMPATE'
      : homeGoals > awayGoals
        ? 'MANDANTE'
        : 'VISITANTE';
  return { duels, homeGoals, awayGoals, result };
}
