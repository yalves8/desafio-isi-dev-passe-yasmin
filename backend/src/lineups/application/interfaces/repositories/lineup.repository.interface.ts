import { PlayerEntity } from '../../../../players/domain/entities/player.entity.js';
import { Formation } from '../../../domain/formation.js';

/**
 * Escalação gravada: a formação do clube e os titulares que continuam nela.
 *
 * @export
 * @interface StoredLineup
 */
export interface StoredLineup {
  clubId: number;
  clubName: string;
  /** null enquanto o clube nunca escalou */
  formation: Formation | null;
  /** Titulares ativos (vendido ou DOENTE já saiu da escalação, RN19) */
  starters: PlayerEntity[];
}

/**
 * Estado lido com o clube e os jogadores pedidos travados, dentro da troca da escalação.
 *
 * @export
 * @interface LineupChangeState
 */
export interface LineupChangeState {
  club: { id: number; name: string } | null;
  /** Um item por id pedido; null se o jogador não existe ou foi excluído */
  players: { id: number; player: PlayerEntity | null }[];
}

/**
 * Contrato do repositório de escalação.
 *
 * @export
 * @abstract
 * @class ILineupRepository
 */
export abstract class ILineupRepository {
  /**
   * Escalação gravada do clube.
   *
   * @param {number} clubId - Clube da URL.
   * @returns {Promise<StoredLineup | null>} null se o clube não existe.
   */
  abstract findByClub(clubId: number): Promise<StoredLineup | null>;

  /**
   * Trava os jogadores pedidos e o clube (nessa ordem, como na compra e na venda), entrega o
   * estado à validação e, se ela não lançar, substitui a formação e os 5 titulares, tudo ou nada.
   *
   * @param {number} clubId - Clube da URL.
   * @param {Formation} formation - Nova formação.
   * @param {number[]} playerIds - Os 5 titulares.
   * @param {(state: LineupChangeState) => void} validate - Regras da RN19.
   * @returns {Promise<void>}
   */
  abstract replace(
    clubId: number,
    formation: Formation,
    playerIds: number[],
    validate: (state: LineupChangeState) => void,
  ): Promise<void>;
}
