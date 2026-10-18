import { ConflictError } from '../../../common/errors/domain.errors.js';
import { canChangeCondition, Condition } from '../../../domain/condition.js';
import { marketValue } from '../../../domain/market-value.js';
import { Money } from '../../../domain/money.js';
import {
  Attributes,
  baseValue,
  overall,
} from '../../../domain/player-rating.js';
import { Position } from '../../../domain/position.js';

import { ContractEntity } from '../../../contracts/domain/entities/contract.entity.js';
import { Penalty } from '../../../domain/trade.js';

/**
 * Estado completo de um jogador gravado, usado para reidratá-lo do banco (`PlayerEntity.restore`).
 *
 * @export
 * @interface PlayerProps
 */
export interface PlayerProps {
  /** Identificador único do jogador */
  id: number;
  /** Nome oficial do atleta */
  name: string;
  /** Posição ('GOL', 'ZAG', 'LAT', 'MEI', 'ATA') */
  position: Position;
  /** Agilidade (1 a 100) */
  agility: number;
  /** Idade (16 a 45) */
  age: number;
  /** Valor base gravado no cadastro (RN06) */
  baseValue: Money;
  /** Condição física ('APTO', 'MAL_CONDICIONADO', 'DOENTE') */
  condition: Condition;
  /** Clube detentor dos direitos, ou null se livre */
  clubId: number | null;
  /** Os seis atributos técnicos */
  attributes: Attributes;
  /** Potencial (1 a 99) */
  potential: number;
  /** Momento da exclusão lógica (RN09), ou null se ativo */
  deletedAt: Date | null;
  /** Data de cadastro */
  createdAt: Date;
  /** Contrato ativo com o clube atual, se houver */
  activeContract: ContractEntity | null;
}

/**
 * Dados cadastrais de um jogador novo, antes de existir no banco (RN06).
 *
 * @export
 * @interface PlayerRegistration
 */
export interface PlayerRegistration {
  name: string;
  position: Position;
  agility: number;
  age: number;
  attributes: Attributes;
  potential: number;
}

/**
 * Jogador novo pronto para gravar: os dados do cadastro com o valor base calculado,
 * livre e APTO. O id, a data de cadastro e o contrato vêm do banco depois.
 */
export type NewPlayer = Omit<
  PlayerProps,
  'id' | 'deletedAt' | 'createdAt' | 'activeContract'
>;

/**
 * Entidade rica de domínio representando um Jogador (DDD).
 *
 * Encapsula o ciclo de vida, atributos técnicos, cálculos de overall e valor de mercado,
 * além de validar as regras de negócio de alteração de dados e transição de condição física.
 *
 * Criada só pelas fábricas: `register` para o cadastro e `restore` para reidratar do banco.
 *
 * @export
 * @class PlayerEntity
 */
export class PlayerEntity {
  public readonly id: number;
  private name: string;
  private position: Position;
  private agility: number;
  private age: number;
  public readonly baseValue: Money;
  private condition: Condition;
  private clubId: number | null;
  public readonly attributes: Attributes;
  public readonly potential: number;
  public readonly deletedAt: Date | null;
  public readonly createdAt: Date;
  private readonly activeContract: ContractEntity | null;

  private constructor(props: PlayerProps) {
    this.id = props.id;
    this.name = props.name;
    this.position = props.position;
    this.agility = props.agility;
    this.age = props.age;
    this.baseValue = props.baseValue;
    this.condition = props.condition;
    this.clubId = props.clubId;
    this.attributes = props.attributes;
    this.potential = props.potential;
    this.deletedAt = props.deletedAt;
    this.createdAt = props.createdAt;
    this.activeContract = props.activeContract;
  }

  /**
   * Cadastro de um jogador novo (RN06): o valor base sai do overall e da idade do cadastro,
   * uma única vez, e o jogador nasce livre e APTO.
   *
   * @param {PlayerRegistration} data - Dados cadastrais e atributos técnicos.
   * @returns {NewPlayer} Jogador pronto para gravar.
   */
  public static register(data: PlayerRegistration): NewPlayer {
    const rating = overall(data.position, data.attributes);
    return {
      ...data,
      baseValue: Money.ofCents(baseValue(rating, data.potential, data.age)),
      condition: 'APTO',
      clubId: null,
    };
  }

  /**
   * Reidrata um jogador gravado.
   *
   * @param {PlayerProps} props - Estado completo lido do banco.
   * @returns {PlayerEntity} A entidade.
   */
  public static restore(props: PlayerProps): PlayerEntity {
    return new PlayerEntity(props);
  }

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
    return overall(this.position, this.attributes);
  }

  /**
   * Calcula o Valor de Mercado atual do atleta a partir do valor base, condição, agilidade e idade (RN05).
   *
   * @returns {Money} O valor de mercado.
   */
  public calculateMarketValue(): Money {
    return Money.ofCents(
      marketValue(this.baseValue.cents, this.condition, this.agility, this.age),
    );
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
    if (!canChangeCondition(this.condition, newCondition)) {
      throw new ConflictError(
        'Jogador doente não pode passar diretamente para apto',
      );
    }
    this.condition = newCondition;
  }
}
