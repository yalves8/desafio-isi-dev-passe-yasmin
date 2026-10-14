import {
  ConflictError,
  NotFoundError,
} from '../../../../common/errors/domain.errors.js';
import { IPlayerRepository } from '../../interfaces/repositories/player.repository.interface.js';
import { DeletePlayerInput } from './delete-player.input.js';

/**
 * Caso de uso responsável pela exclusão lógica de um jogador livre (RN09).
 *
 * Regras aplicadas:
 * 1. Apenas jogadores livres (sem clube) podem ser excluídos logicamente.
 * 2. Se o jogador estiver em um clube, a requisição é recusada com 409 Conflict.
 * 3. O jogador excluído torna-se inexistente (404) para novas consultas.
 *
 * @export
 * @class DeletePlayerUseCase
 */
export class DeletePlayerUseCase {
  /**
   * Construtor do `DeletePlayerUseCase`.
   *
   * @param {IPlayerRepository} playerRepository - Repositório desacoplado de atletas.
   */
  constructor(private readonly playerRepository: IPlayerRepository) {}

  /**
   * Executa a exclusão lógica do atleta.
   *
   * @param {DeletePlayerInput} input - Contém o ID do atleta.
   * @returns {Promise<void>}
   * @throws {NotFoundError} Se o atleta não existir ou já estiver excluído.
   * @throws {ConflictError} Se o atleta pertencer a um clube.
   */
  async execute(input: DeletePlayerInput): Promise<void> {
    const player = await this.playerRepository.findById(input.id);
    if (!player) {
      throw new NotFoundError('Jogador não encontrado');
    }

    if (!player.isFree()) {
      throw new ConflictError(
        'Jogador que pertence a um clube não pode ser excluído',
      );
    }

    await this.playerRepository.softDelete(input.id);
  }
}
