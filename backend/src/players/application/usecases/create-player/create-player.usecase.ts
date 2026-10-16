import { fromCents } from '../../../../domain/money.js';
import {
  Attributes,
  baseValue,
  overall,
} from '../../../../domain/player-rating.js';
import { toPlayerOutput } from '../../presenters/player.presenter.js';
import { IPlayerRepository } from '../../interfaces/repositories/player.repository.interface.js';
import { CreatePlayerInput } from './create-player.input.js';
import { CreatePlayerOutput } from './create-player.output.js';

/**
 * Caso de uso responsável pelo cadastramento de um novo atleta na liga.
 *
 * Calcula o overall e o valor base progressivo definitivo uma única vez no cadastro (RN06)
 * e persiste o atleta inicialmente livre e com condição 'APTO'.
 *
 * Fluxo principal:
 * 1. Calcula o overall com base nos pesos da posição informada.
 * 2. Calcula o valor base aplicando as faixas progressivas e o multiplicador de jovem promessa (se idade <= 21).
 * 3. Persiste o atleta no repositório com o valor base gravado e condição inicial APTO.
 * 4. Calcula o valor de mercado inicial (igual ao valor base, sem desconto de condição nem ajuste de promessa duplicado).
 * 5. Retorna o atleta recém-criado.
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
   * @returns {Promise<CreatePlayerOutput>} Atleta cadastrado com overall e valor base calculados.
   */
  async execute(input: CreatePlayerInput): Promise<CreatePlayerOutput> {
    const attributes: Attributes = {
      pace: input.pace,
      shooting: input.shooting,
      passing: input.passing,
      dribbling: input.dribbling,
      defending: input.defending,
      physical: input.physical,
    };
    // RN06: o valor base sai do overall e da idade do cadastro, uma única vez
    const ovr = overall(input.position, attributes);

    const created = await this.playerRepository.create({
      name: input.name,
      position: input.position,
      agility: input.agility,
      age: input.age,
      baseValue: fromCents(baseValue(ovr, input.potential, input.age)),
      attributes,
      potential: input.potential,
    });

    return toPlayerOutput(created);
  }
}
