import { Condition } from '../../../domain/market-value.js';
import { DuelAttribute, MatchResult } from '../../../domain/match-engine.js';
import { Position } from '../../../domain/player-rating.js';
import { Formation } from '../../../lineups/domain/formation.js';

/** Mandante ou visitante da partida: clube, formação e gols */
export interface MatchSideResponse {
  club_id: number;
  club_name: string;
  formation: Formation;
  goals: number;
}

/** Jogador de um duelo, com o atributo e o valor usados (já com o efeito da condição, RN20) */
export interface DuelPlayerResponse {
  player_id: number;
  player_name: string;
  position: Position;
  condition: Condition;
  attribute: DuelAttribute;
  value: number;
}

/** Duelo de 1 a 6: os ataques do mandante e depois os do visitante (RN20) */
export interface DuelResponse {
  order: number;
  attacking_club_id: number;
  attacker: DuelPlayerResponse;
  defender: DuelPlayerResponse;
  goal: boolean;
}

/**
 * Partida no contrato da API REST (2.4.2): campos em snake_case. `duels` vem no POST e no GET /matches/{id};
 * a listagem não traz.
 *
 * @export
 * @interface MatchResponse
 */
export interface MatchResponse {
  id: number;
  played_at: string;
  home: MatchSideResponse;
  away: MatchSideResponse;
  result: MatchResult;
  duels?: DuelResponse[];
}
