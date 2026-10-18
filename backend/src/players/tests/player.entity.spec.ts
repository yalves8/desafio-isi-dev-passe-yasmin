import { describe, expect, it } from 'vitest';
import { ContractEntity } from '../../contracts/domain/entities/contract.entity.js';
import { Money } from '../../domain/money.js';
import { PlayerEntity } from '../domain/entities/player.entity.js';

const MEIA_LUA_ATTRIBUTES = {
  pace: 70,
  shooting: 68,
  passing: 82,
  dribbling: 79,
  defending: 55,
  physical: 64,
};

describe('PlayerEntity.register (RN06)', () => {
  it('calcula o valor base pelo overall e pela idade do cadastro e nasce livre e APTO', () => {
    const registered = PlayerEntity.register({
      name: 'Meia Lua',
      position: 'MEI',
      agility: 85,
      age: 25,
      attributes: MEIA_LUA_ATTRIBUTES,
      potential: 86,
    });

    expect(registered).toEqual({
      name: 'Meia Lua',
      position: 'MEI',
      agility: 85,
      age: 25,
      attributes: MEIA_LUA_ATTRIBUTES,
      potential: 86,
      baseValue: Money.fromDecimal('40.00'),
      condition: 'APTO',
      clubId: null,
    });
  });
});

describe('PlayerEntity.restore', () => {
  const createdAt = new Date('2026-01-01T00:00:00Z');
  const contract = new ContractEntity(
    9,
    2,
    1,
    Money.fromDecimal('37.00'),
    new Date('2026-03-01T00:00:00Z'),
    'ATIVO',
  );
  const player = PlayerEntity.restore({
    id: 2,
    name: 'Meia Lua',
    position: 'MEI',
    agility: 85,
    age: 25,
    baseValue: Money.fromDecimal('40.00'),
    condition: 'MAL_CONDICIONADO',
    clubId: 1,
    attributes: MEIA_LUA_ATTRIBUTES,
    potential: 86,
    deletedAt: null,
    createdAt,
    activeContract: contract,
  });

  it('reidrata todos os campos gravados', () => {
    expect(player.id).toBe(2);
    expect(player.getName()).toBe('Meia Lua');
    expect(player.getPosition()).toBe('MEI');
    expect(player.getAgility()).toBe(85);
    expect(player.getAge()).toBe(25);
    expect(player.getCondition()).toBe('MAL_CONDICIONADO');
    expect(player.getClubId()).toBe(1);
    expect(player.baseValue).toEqual(Money.ofCents(4000));
    expect(player.attributes).toEqual(MEIA_LUA_ATTRIBUTES);
    expect(player.potential).toBe(86);
    expect(player.deletedAt).toBeNull();
    expect(player.createdAt).toBe(createdAt);
    expect(player.getActiveContract()).toBe(contract);
    expect(player.calculateOverall()).toBe(75);
  });

  it('calcula o valor de mercado em Money (RN05)', () => {
    // 40,00 MAL_CONDICIONADO com agilidade >= 80: metade do desconto de 15% → 37,00
    expect(player.calculateMarketValue()).toEqual(Money.fromDecimal('37.00'));
  });

  it('calcula a multa do contrato ativo sobre o valor de mercado (RN15)', () => {
    const penalty = player.calculateContractPenalty(
      new Date('2026-02-20T00:00:00Z'),
    );
    expect(penalty).toEqual({ daysRemaining: 9, percent: 5, amount: 185 });
  });
});
