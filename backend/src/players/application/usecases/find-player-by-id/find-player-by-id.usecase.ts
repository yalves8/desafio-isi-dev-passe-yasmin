import { NotFoundError } from '../../../../common/errors/domain.errors.js';
import { PlayerEntity } from '../../../domain/entities/player.entity.js';
import { IPlayerRepository } from '../../interfaces/repositories/player.repository.interface.js';
import { FindPlayerByIdInput } from './find-player-by-id.input.js';

/**
 * Caso de uso responsável por consultar os dados detalhados de um atleta.
 *
 * Calcula em tempo de execução o Overall atual (RN06) e o Valor de Mercado atual (RN05).
 *
 * Fluxo principal:
 * 1. Busca o atleta ativo pelo ID no repositório.
 * 2. Lança NotFoundError (404) caso o atleta não exista ou esteja excluído logicamente.
 * 3. Retorna os dados com overall e valor de mercado recalculados.
 *
 * @export
 * @class FindPlayerByIdUseCase
 */
export class FindPlayerByIdUseCase {
  /**
   * Construtor do `FindPlayerByIdUseCase`.
   *
   * @param {IPlayerRepository} playerRepository - Repositório desacoplado de atletas.
   */
  constructor(private readonly playerRepository: IPlayerRepository) {}

  /**
   * Executa a busca do atleta por ID.
   *
   * @param {FindPlayerByIdInput} input - Contém o ID do atleta.
   * @returns {Promise<PlayerEntity>} Dados detalhados do atleta.
   * @throws {NotFoundError} Se o atleta não for encontrado ou estiver excluído.
   */
  async execute(input: FindPlayerByIdInput): Promise<PlayerEntity> {
    const player = await this.playerRepository.findById(input.id);
    if (!player) {
      throw new NotFoundError('Jogador não encontrado');
    }

    return player;
  }
}
