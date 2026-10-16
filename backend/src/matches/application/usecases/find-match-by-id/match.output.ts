import { Condition } from '../../../../domain/market-value.js';
import { DuelAttribute, MatchResult } from '../../../../domain/match-engine.js';
import { Position } from '../../../../domain/player-rating.js';
import { Formation } from '../../../../lineups/domain/formation.js';

/** Mandante ou visitante da partida: clube, formação e gols */
export interface MatchSideOutput {
  club_id: number;
  club_name: string;
  formation: Formation;
  goals: number;
}

/** Jogador de um duelo, com o atributo e o valor usados (já com o efeito da condição, RN20) */
export interface DuelPlayerOutput {
  player_id: number;
  player_name: string;
  position: Position;
  condition: Condition;
  attribute: DuelAttribute;
  value: number;
}

/** Duelo de 1 a 6: os ataques do mandante e depois os do visitante (RN20) */
export interface DuelOutput {
  order: number;
  attacking_club_id: number;
  attacker: DuelPlayerOutput;
  defender: DuelPlayerOutput;
  goal: boolean;
}

/**
 * Partida no formato da API (2.4.2). `duels` vem no POST e no GET /matches/{id};
 * a listagem não traz.
 *
 * @export
 * @interface MatchOutput
 */
export interface MatchOutput {
  id: number;
  played_at: string;
  home: MatchSideOutput;
  away: MatchSideOutput;
  result: MatchResult;
  duels?: DuelOutput[];
}
