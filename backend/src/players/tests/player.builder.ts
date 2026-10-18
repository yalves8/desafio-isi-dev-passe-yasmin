import { ContractEntity } from '../../contracts/domain/entities/contract.entity.js';
import { Condition } from '../../domain/condition.js';
import { Money } from '../../domain/money.js';
import { Attributes } from '../../domain/player-rating.js';
import { Position } from '../../domain/position.js';
import { PlayerEntity, PlayerProps } from '../domain/entities/player.entity.js';

/**
 * Test Data Builder de `PlayerEntity`, só para testes.
 *
 * Parte de um jogador válido (MEI de 25 anos, livre, APTO, valor base 30,00, atributos 60)
 * e cada teste muda só o que importa para o caso:
 * `aPlayer().withPosition('GOL').withCondition('DOENTE').build()`.
 *
 * @export
 * @class PlayerBuilder
 */
export class PlayerBuilder {
  private props: PlayerProps = {
    id: 1,
    name: 'Jogador Teste',
    position: 'MEI',
    agility: 70,
    age: 25,
    baseValue: Money.fromDecimal('30.00'),
    condition: 'APTO',
    clubId: null,
    attributes: {
      pace: 60,
      shooting: 60,
      passing: 60,
      dribbling: 60,
      defending: 60,
      physical: 60,
    },
    potential: 80,
    deletedAt: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    activeContract: null,
  };

  withId(id: number): this {
    this.props.id = id;
    return this;
  }

  withName(name: string): this {
    this.props.name = name;
    return this;
  }

  withPosition(position: Position): this {
    this.props.position = position;
    return this;
  }

  withAgility(agility: number): this {
    this.props.agility = agility;
    return this;
  }

  withAge(age: number): this {
    this.props.age = age;
    return this;
  }

  /** Valor base em moedas, como no cadastro (ex.: 40 → 40,00) */
  withBaseValue(value: number | string): this {
    this.props.baseValue = Money.fromDecimal(value);
    return this;
  }

  withCondition(condition: Condition): this {
    this.props.condition = condition;
    return this;
  }

  /** Jogador no elenco do clube; `null` deixa livre */
  withClub(clubId: number | null): this {
    this.props.clubId = clubId;
    return this;
  }

  /** Muda só os atributos informados; os outros continuam 60 */
  withAttributes(attributes: Partial<Attributes>): this {
    this.props.attributes = { ...this.props.attributes, ...attributes };
    return this;
  }

  withPotential(potential: number): this {
    this.props.potential = potential;
    return this;
  }

  /** Contrato ativo; o jogador passa a ser do clube do contrato */
  withContract(contract: ContractEntity): this {
    this.props.activeContract = contract;
    this.props.clubId = contract.clubId;
    return this;
  }

  build(): PlayerEntity {
    return PlayerEntity.restore({
      ...this.props,
      attributes: { ...this.props.attributes },
    });
  }
}

/** Começa um jogador válido para o teste */
export function aPlayer(): PlayerBuilder {
  return new PlayerBuilder();
}
