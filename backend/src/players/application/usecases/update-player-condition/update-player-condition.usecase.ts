import { NotFoundError } from '../../../../common/errors/domain.errors.js';
import { IPlayerRepository } from '../../interfaces/repositories/player.repository.interface.js';
import { UpdatePlayerConditionInput } from './update-player-condition.input.js';
import { UpdatePlayerConditionOutput } from './update-player-condition.output.js';

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
   * @returns {Promise<UpdatePlayerConditionOutput>} Atleta com a nova condição e valor de mercado recalculado.
   * @throws {NotFoundError} Se o atleta não for encontrado.
   * @throws {ConflictError} Se tentar passar de DOENTE diretamente para APTO.
   */
  async execute(
    input: UpdatePlayerConditionInput,
  ): Promise<UpdatePlayerConditionOutput> {
    const player = await this.playerRepository.findById(input.id);
    if (!player) {
      throw new NotFoundError('Jogador não encontrado');
    }

    if (player.getCondition() === input.condition) {
      return {
        id: player.id,
        name: player.getName(),
        position: player.getPosition(),
        agility: player.getAgility(),
        age: player.getAge(),
        condition: player.getCondition(),
        base_value: player.baseValue,
        market_value: player.calculateMarketValue(),
        pace: player.attributes.pace,
        shooting: player.attributes.shooting,
        passing: player.attributes.passing,
        dribbling: player.attributes.dribbling,
        defending: player.attributes.defending,
        physical: player.attributes.physical,
        potential: player.potential,
        overall: player.calculateOverall(),
        club_id: player.getClubId(),
      };
    }

    // Regra de negócio na Entidade (DDD)
    player.changeCondition(input.condition);

    const updated = await this.playerRepository.updateCondition(player);

    return {
      id: updated.id,
      name: updated.getName(),
      position: updated.getPosition(),
      agility: updated.getAgility(),
      age: updated.getAge(),
      condition: updated.getCondition(),
      base_value: updated.baseValue,
      market_value: updated.calculateMarketValue(),
      pace: updated.attributes.pace,
      shooting: updated.attributes.shooting,
      passing: updated.attributes.passing,
      dribbling: updated.attributes.dribbling,
      defending: updated.attributes.defending,
      physical: updated.attributes.physical,
      potential: updated.potential,
      overall: updated.calculateOverall(),
      club_id: updated.getClubId(),
    };
  }
}
