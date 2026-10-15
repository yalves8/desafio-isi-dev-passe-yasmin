import { ConflictError } from '../../../common/errors/domain.errors.js';
import { Condition, marketValue } from '../../../domain/market-value.js';
import { fromCents, toCents } from '../../../domain/money.js';
import {
  Attributes,
  overall,
  Position,
} from '../../../domain/player-rating.js';

import { ContractEntity } from '../../../contracts/domain/entities/contract.entity.js';
import { Penalty } from '../../../domain/trade.js';

export interface PlayerTechnicalAttributes {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

/**
 * Entidade rica de domínio representando um Jogador (DDD).
 *
 * Encapsula o ciclo de vida, atributos técnicos, cálculos de overall e valor de mercado,
 * além de validar as regras de negócio de alteração de dados e transição de condição física.
 *
 * @export
 * @class PlayerEntity
 */
export class PlayerEntity {
  /**
   * Construtor da entidade `PlayerEntity`.
   *
   * @param {number} id - Identificador único do jogador.
   * @param {string} name - Nome oficial do atleta.
   * @param {Position} position - Posição do jogador ('GOL', 'ZAG', 'LAT', 'MEI', 'ATA').
   * @param {number} agility - Indicador de agilidade (1 a 100).
   * @param {number} age - Idade do jogador (16 a 45).
   * @param {number} baseValue - Valor base financeiro gravado no cadastro (RN06).
   * @param {Condition} condition - Condição física ('APTO', 'MAL_CONDICIONADO', 'DOENTE').
   * @param {number | null} clubId - ID do clube detentor dos direitos, ou null se livre.
   * @param {PlayerTechnicalAttributes} attributes - Os seis atributos técnicos.
   * @param {number} potential - Potencial do jogador (1 a 99).
   * @param {Date | null} [deletedAt] - Momento da exclusão lógica (RN09), ou null se ativo.
   * @param {Date} [createdAt] - Data de cadastro.
   * @param {ContractEntity | null} [activeContract] - Contrato ativo com o clube atual, se houver.
   */
  constructor(
    public readonly id: number,
    private name: string,
    private position: Position,
    private agility: number,
    private age: number,
    public readonly baseValue: number,
    private condition: Condition = 'APTO',
    private clubId: number | null = null,
    public readonly attributes: PlayerTechnicalAttributes,
    public readonly potential: number,
    public readonly deletedAt: Date | null = null,
    public readonly createdAt: Date = new Date(),
    private readonly activeContract: ContractEntity | null = null,
  ) {}

  public getName(): string {
    return this.name;
  }

  public getPosition(): Position {
    return this.position;
  }

  public getAgility(): number {
    return this.agility;
  }

  public getAge(): number {
    return this.age;
  }

  public getCondition(): Condition {
    return this.condition;
  }

  public getClubId(): number | null {
    return this.clubId;
  }

  public isFree(): boolean {
    return this.clubId === null;
  }

  public getActiveContract(): ContractEntity | null {
    return this.activeContract;
  }

  /**
   * Calcula a multa rescisória e dias restantes de fidelidade do contrato ativo (RN15).
   *
   * @param {Date} [now=new Date()] - Data de referência para contagem dos dias restantes.
   * @returns {Penalty | null} Detalhes da multa ou null se não houver contrato ativo.
   */
  public calculateContractPenalty(now: Date = new Date()): Penalty | null {
    if (!this.activeContract) {
      return null;
    }
    return this.activeContract.calculatePenalty(
      this.calculateMarketValue(),
      now,
    );
  }

  /**
   * Calcula o Overall dinâmico do jogador baseado em seus atributos e posição atual (RN06).
   *
   * @returns {number} O overall inteiro calculado.
   */
  public calculateOverall(): number {
    const attr: Attributes = {
      pace: this.attributes.pace,
      shooting: this.attributes.shooting,
      passing: this.attributes.passing,
      dribbling: this.attributes.dribbling,
      defending: this.attributes.defending,
      physical: this.attributes.physical,
    };
    return overall(this.position, attr);
  }

  /**
   * Calcula o Valor de Mercado atual do atleta a partir do valor base, condição, agilidade e idade (RN05).
   *
   * @returns {number} O valor de mercado em moedas com 2 casas.
   */
  public calculateMarketValue(): number {
    const baseCents = toCents(this.baseValue);
    const mvCents = marketValue(
      baseCents,
      this.condition,
      this.agility,
      this.age,
    );
    return fromCents(mvCents);
  }

  /**
   * Atualiza os dados cadastrais do jogador, validando regras de negócio da RN08.
   *
   * @param {string} newName - Novo nome do jogador.
   * @param {Position} newPosition - Nova posição desejada.
   * @param {number} newAgility - Nova agilidade.
   * @param {number} newAge - Nova idade.
   * @throws {ConflictError} Se o atleta tiver clube e tentar mudar de posição, ou se a idade diminuir.
   */
  public update(
    newName: string,
    newPosition: Position,
    newAgility: number,
    newAge: number,
  ): void {
    if (this.clubId !== null && newPosition !== this.position) {
      throw new ConflictError(
        'Jogador vinculado a um clube não pode mudar de posição',
      );
    }

    if (newAge < this.age) {
      throw new ConflictError('A idade não pode ser menor que a idade atual');
    }

    this.name = newName;
    this.position = newPosition;
    this.agility = newAgility;
    this.age = newAge;
  }

  /**
   * Altera a condição física do jogador validando a regra da RN19 (não ir de DOENTE direto para APTO).
   *
   * @param {Condition} newCondition - Nova condição física.
   * @throws {ConflictError} Se tentar transicionar de DOENTE diretamente para APTO.
   */
  public changeCondition(newCondition: Condition): void {
    if (this.condition === 'DOENTE' && newCondition === 'APTO') {
      throw new ConflictError(
        'Jogador doente não pode passar diretamente para apto',
      );
    }
    this.condition = newCondition;
  }
}
