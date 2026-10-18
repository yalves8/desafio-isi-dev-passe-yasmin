import { PlayerEntity } from '../../../domain/entities/player.entity.js';
import { IPlayerRepository } from '../../interfaces/repositories/player.repository.interface.js';
import { CreatePlayerInput } from './create-player.input.js';

/**
 * Caso de uso responsável pelo cadastramento de um novo atleta na liga.
 *
 * Delega à entidade (`PlayerEntity.register`) o overall e o valor base progressivo, calculados
 * uma única vez no cadastro (RN06), e persiste o atleta inicialmente livre e com condição 'APTO'.
 *
 * Fluxo principal:
 * 1. A entidade calcula o overall com base nos pesos da posição informada.
 * 2. A entidade calcula o valor base aplicando as faixas progressivas e o multiplicador de jovem promessa (se idade <= 21).
 * 3. Persiste o atleta no repositório com o valor base gravado e condição inicial APTO.
 * 4. Retorna o atleta recém-criado.
 *
 * @export
 * @class CreatePlayerUseCase
 */
export class CreatePlayerUseCase {
  /**
   * Construtor do `CreatePlayerUseCase`.
   *
   * @param {IPlayerRepository} playerRepository - Repositório desacoplado de atletas.
   */
  constructor(private readonly playerRepository: IPlayerRepository) {}

  /**
   * Executa a criação do atleta.
   *
   * @param {CreatePlayerInput} input - Dados cadastrais e atributos técnicos do atleta.
   * @returns {Promise<PlayerEntity>} Atleta cadastrado com overall e valor base calculados.
   */
  async execute(input: CreatePlayerInput): Promise<PlayerEntity> {
    // RN06: o valor base sai do overall e da idade do cadastro, uma única vez
    const player = PlayerEntity.register({
      name: input.name,
      position: input.position,
      agility: input.agility,
      age: input.age,
      attributes: {
        pace: input.pace,
        shooting: input.shooting,
        passing: input.passing,
        dribbling: input.dribbling,
        defending: input.defending,
        physical: input.physical,
      },
      potential: input.potential,
    });

    return this.playerRepository.create(player);
  }
}
