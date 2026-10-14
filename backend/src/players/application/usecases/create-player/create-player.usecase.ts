import { fromCents } from '../../../../domain/money.js';
import {
  Attributes,
  baseValue,
  overall,
} from '../../../../domain/player-rating.js';
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
    const attr: Attributes = {
      pace: input.pace,
      shooting: input.shooting,
      passing: input.passing,
      dribbling: input.dribbling,
      defending: input.defending,
      physical: input.physical,
    };

    const ovr = overall(input.position, attr);
    const baseValCents = baseValue(ovr, input.potential, input.age);
    const calculatedBase = fromCents(baseValCents);

    const created = await this.playerRepository.create({
      name: input.name,
      position: input.position,
      agility: input.agility,
      age: input.age,
      baseValue: calculatedBase,
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

    return {
      id: created.id,
      name: created.getName(),
      position: created.getPosition(),
      agility: created.getAgility(),
      age: created.getAge(),
      condition: created.getCondition(),
      base_value: created.baseValue,
      market_value: created.calculateMarketValue(),
      pace: created.attributes.pace,
      shooting: created.attributes.shooting,
      passing: created.attributes.passing,
      dribbling: created.attributes.dribbling,
      defending: created.attributes.defending,
      physical: created.attributes.physical,
      potential: created.potential,
      overall: created.calculateOverall(),
      club_id: created.getClubId(),
    };
  }
}
