import { NotFoundError } from '../../../../common/errors/domain.errors.js';
import { IPlayerRepository } from '../../interfaces/repositories/player.repository.interface.js';
import { UpdatePlayerInput } from './update-player.input.js';
import { UpdatePlayerOutput } from './update-player.output.js';

/**
 * Caso de uso responsável pela atualização dos dados cadastrais do atleta (RN08).
 *
 * Atualiza nome, posição, agilidade e idade. Indicadores técnicos, potencial e valor base
 * permanecem inalterados.
 *
 * Fluxo principal:
 * 1. Busca o atleta ativo pelo ID.
 * 2. Lança NotFoundError (404) caso não exista.
 * 3. Delega para a entidade de domínio `player.update(...)` para validar:
 *    - Se o jogador possui clube, a posição não pode ser alterada (409).
 *    - A idade não pode ser reduzida (409).
 * 4. Persiste a entidade atualizada no repositório.
 * 5. Retorna o atleta atualizado com overall e valor de mercado recalculados.
 *
 * @export
 * @class UpdatePlayerUseCase
 */
export class UpdatePlayerUseCase {
  /**
   * Construtor do `UpdatePlayerUseCase`.
   *
   * @param {IPlayerRepository} playerRepository - Repositório desacoplado de atletas.
   */
  constructor(private readonly playerRepository: IPlayerRepository) {}

  /**
   * Executa a atualização cadastral do atleta.
   *
   * @param {UpdatePlayerInput} input - Novos dados cadastrais.
   * @returns {Promise<UpdatePlayerOutput>} Atleta atualizado.
   * @throws {NotFoundError} Se o atleta não for encontrado.
   * @throws {ConflictError} Se regras de negócio da RN08 forem violadas.
   */
  async execute(input: UpdatePlayerInput): Promise<UpdatePlayerOutput> {
    const player = await this.playerRepository.findById(input.id);
    if (!player) {
      throw new NotFoundError('Jogador não encontrado');
    }

    // Invariantes de negócio validadas pela Entidade (DDD)
    player.update(input.name, input.position, input.agility, input.age);

    const updated = await this.playerRepository.update(player);

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
