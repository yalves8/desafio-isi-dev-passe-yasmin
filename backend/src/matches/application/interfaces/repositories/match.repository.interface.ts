import { Condition } from '../../../../domain/market-value.js';
import { DuelAttribute, MatchResult } from '../../../../domain/match-engine.js';
import { Position } from '../../../../domain/player-rating.js';
import { Formation } from '../../../../lineups/domain/formation.js';
import { PlayerEntity } from '../../../../players/domain/entities/player.entity.js';
import { PlayedScore } from '../../../domain/standings.js';

/**
 * Clube como entra na partida: formação salva e titulares atuais (RN19 e RN20).
 *
 * @export
 * @interface MatchTeamState
 */
export interface MatchTeamState {
  id: number;
  name: string;
  formation: Formation | null;
  starters: PlayerEntity[];
}

/** Estado lido para jogar: null quando o clube não existe */
export interface PlayMatchState {
  home: MatchTeamState | null;
  away: MatchTeamState | null;
}

/** Jogador de um duelo, com os dados do momento da partida */
export interface DuelPlayerRecord {
  playerId: number;
  playerName: string;
  position: Position;
  condition: Condition;
  attribute: DuelAttribute;
  value: number;
}

/** Duelo gravado (RN20, passo 7) */
export interface DuelRecord {
  order: number;
  attackingClubId: number;
  attacker: DuelPlayerRecord;
  defender: DuelPlayerRecord;
  goal: boolean;
}

/** Lado da partida: clube, formação do momento e gols */
export interface MatchSideRecord {
  clubId: number;
  clubName: string;
  formation: Formation;
  goals: number;
}

/**
 * Partida a gravar: data e hora, placar, formações e os 6 duelos.
 *
 * @export
 * @interface MatchRecord
 */
export interface MatchRecord {
  playedAt: Date;
  home: MatchSideRecord;
  away: MatchSideRecord;
  result: MatchResult;
  duels: DuelRecord[];
}

/** Partida gravada; `duels` vem vazio na listagem */
export interface StoredMatch extends MatchRecord {
  id: number;
}

/**
 * Contrato do repositório de partidas.
 *
 * @export
 * @abstract
 * @class IMatchRepository
 */
export abstract class IMatchRepository {
  /**
   * Lê os dois clubes com as escalações, pede a partida jogada e grava tudo, numa transação
   * que impede troca de escalação ou venda no meio da leitura. Se `play` lançar, nada é gravado.
   *
   * @param {number} homeClubId - Mandante.
   * @param {number} awayClubId - Visitante.
   * @param {(state: PlayMatchState) => MatchRecord} play - Conferências e motor da RN20.
   * @returns {Promise<StoredMatch>} Partida gravada, com os duelos.
   */
  abstract play(
    homeClubId: number,
    awayClubId: number,
    play: (state: PlayMatchState) => MatchRecord,
  ): Promise<StoredMatch>;

  /**
   * Partidas da mais recente para a mais antiga (no mesmo instante, maior id), sem duelos.
   *
   * @param {number} [clubId] - Só as partidas em que o clube foi mandante ou visitante.
   * @returns {Promise<StoredMatch[]>} Partidas.
   */
  abstract findMany(clubId?: number): Promise<StoredMatch[]>;

  /**
   * Partida com os 6 duelos, na ordem da RN20.
   *
   * @param {number} id - Partida da URL.
   * @returns {Promise<StoredMatch | null>} null se não existe.
   */
  abstract findById(id: number): Promise<StoredMatch | null>;

  /**
   * Indica se o clube existe.
   *
   * @param {number} clubId - Clube do filtro.
   * @returns {Promise<boolean>} true se existir.
   */
  abstract clubExists(clubId: number): Promise<boolean>;

  /**
   * Todos os clubes e o placar de todas as partidas, para a classificação.
   *
   * @returns {Promise<{ clubs: { id: number; name: string }[]; scores: PlayedScore[] }>}
   */
  abstract findStandingsData(): Promise<{
    clubs: { id: number; name: string }[];
    scores: PlayedScore[];
  }>;
}
