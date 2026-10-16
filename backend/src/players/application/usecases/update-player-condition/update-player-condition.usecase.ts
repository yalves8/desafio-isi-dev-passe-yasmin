import { NotFoundError } from '../../../../common/errors/domain.errors.js';
import { PlayerEntity } from '../../../domain/entities/player.entity.js';
import { IPlayerRepository } from '../../interfaces/repositories/player.repository.interface.js';
import { UpdatePlayerConditionInput } from './update-player-condition.input.js';

/**
 * Caso de uso responsável pela alteração da condição física do atleta (PATCH /players/{id}/condition).
 *
 * Aplica as regras da RN19:
 * 1. Não permite transição direta de 'DOENTE' para 'APTO' (409).
 * 2. Se o titular for alterado para 'DOENTE', remove-o automaticamente da escalação (RN19).
 *
 * @export
 * @class UpdatePlayerConditionUseCase
 */
export class UpdatePlayerConditionUseCase {
  /**
   * Construtor do `UpdatePlayerConditionUseCase`.
   *
   * @param {IPlayerRepository} playerRepository - Repositório desacoplado de atletas.
   */
  constructor(private readonly playerRepository: IPlayerRepository) {}

  /**
   * Executa a alteração da condição física do atleta.
   *
   * @param {UpdatePlayerConditionInput} input - Contém o ID e a nova condição física.
   * @returns {Promise<PlayerEntity>} Atleta com a nova condição e valor de mercado recalculado.
   * @throws {NotFoundError} Se o atleta não for encontrado.
   * @throws {ConflictError} Se tentar passar de DOENTE diretamente para APTO.
   */
  async execute(input: UpdatePlayerConditionInput): Promise<PlayerEntity> {
    const player = await this.playerRepository.findById(input.id);
    if (!player) {
      throw new NotFoundError('Jogador não encontrado');
    }

    if (player.getCondition() === input.condition) {
      return player;
    }

    // Regra de negócio na Entidade (DDD)
    player.changeCondition(input.condition);

    const updated = await this.playerRepository.updateCondition(player);

    return updated;
  }
}
