import { Condition } from '../../../../domain/market-value.js';
import { Position } from '../../../../domain/player-rating.js';
import {
  PlayerEntity,
  PlayerTechnicalAttributes,
} from '../../../domain/entities/player.entity.js';

export interface PlayerFilterCriteria {
  clubId?: number;
  free?: boolean;
  position?: Position;
  condition?: Condition;
  minAge?: number;
  maxAge?: number;
}

/**
 * Interface abstrata que define o contrato do repositório de jogadores.
 *
 * Desacopla a aplicação e use cases da tecnologia de persistência (Prisma).
 *
 * @export
 * @abstract
 * @class IPlayerRepository
 */
export abstract class IPlayerRepository {
  /**
   * Busca um jogador ativo pelo seu ID.
   *
   * @param {number} id - Identificador do jogador.
   * @returns {Promise<PlayerEntity | null>} Entidade do jogador ou null se inexistente/excluído.
   */
  abstract findById(id: number): Promise<PlayerEntity | null>;

  /**
   * Cria um novo jogador na base de dados.
   *
   * @param {Object} data - Dados completos para persistência.
   * @returns {Promise<PlayerEntity>} Entidade persistida com ID gerado.
   */
  abstract create(data: {
    name: string;
    position: Position;
    agility: number;
    age: number;
    baseValue: number;
    attributes: PlayerTechnicalAttributes;
    potential: number;
  }): Promise<PlayerEntity>;

  /**
   * Atualiza os dados cadastrais (nome, posição, agilidade, idade) do jogador.
   *
   * @param {PlayerEntity} player - Entidade do jogador com dados atualizados.
   * @returns {Promise<PlayerEntity>} Entidade atualizada.
   */
  abstract update(player: PlayerEntity): Promise<PlayerEntity>;

  /**
   * Atualiza a condição física do jogador.
   * Se a condição for 'DOENTE', remove o titular da escalação em transação (RN19).
   *
   * @param {PlayerEntity} player - Entidade do jogador com nova condição.
   * @returns {Promise<PlayerEntity>} Entidade atualizada.
   */
  abstract updateCondition(player: PlayerEntity): Promise<PlayerEntity>;

  /**
   * Executa a exclusão lógica do jogador, preenchendo 'excluido_em' (RN09).
   *
   * @param {number} id - Identificador do jogador.
   * @returns {Promise<void>}
   */
  abstract softDelete(id: number): Promise<void>;

  /**
   * Consulta jogadores ativos com base em critérios de filtro.
   *
   * @param {PlayerFilterCriteria} filter - Critérios de filtro opcionais.
   * @returns {Promise<PlayerEntity[]>} Lista de entidades correspondentes.
   */
  abstract findMany(filter: PlayerFilterCriteria): Promise<PlayerEntity[]>;

  /**
   * Verifica se um clube existe pelo seu ID.
   *
   * @param {number} clubId - Identificador do clube.
   * @returns {Promise<boolean>} True se existir, false caso contrário.
   */
  abstract checkClubExists(clubId: number): Promise<boolean>;
}
