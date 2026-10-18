import { describe, expect, it } from 'vitest';
import { Money } from '../../domain/money.js';
import { playerFromRow } from '../infrastructure/mappers/player.mapper.js';

const row = {
  id: 3,
  nome: 'Rafael',
  posicao: 'ATA',
  agilidade: 80,
  idade: 25,
  valor_base: { toString: () => '40.50' },
  condicao: 'MAL_CONDICIONADO',
  clube_id: 2,
  velocidade: 70,
  finalizacao: 80,
  passe: 60,
  drible: 75,
  defesa: 30,
  fisico: 65,
  potencial: 88,
  excluido_em: null,
  criado_em: new Date('2026-01-01T00:00:00Z'),
};

describe('playerFromRow', () => {
  it('converte a linha de jogadores na entidade, sem contrato quando a linha não traz contratos', () => {
    const player = playerFromRow(row);

    expect(player.id).toBe(3);
    expect(player.getName()).toBe('Rafael');
    expect(player.getPosition()).toBe('ATA');
    expect(player.getCondition()).toBe('MAL_CONDICIONADO');
    expect(player.getClubId()).toBe(2);
    expect(player.baseValue).toEqual(Money.ofCents(4050));
    expect(player.attributes).toEqual({
      pace: 70,
      shooting: 80,
      passing: 60,
      dribbling: 75,
      defending: 30,
      physical: 65,
    });
    expect(player.potential).toBe(88);
    expect(player.getActiveContract()).toBeNull();
  });

  it('carrega o primeiro contrato da linha como contrato ativo', () => {
    const fidelidade = new Date('2026-03-01T00:00:00Z');
    const player = playerFromRow({
      ...row,
      contratos: [
        {
          id: 9,
          jogador_id: 3,
          clube_id: 2,
          valor_compra: { toString: () => '45.00' },
          fidelidade_ate: fidelidade,
          situacao: 'ATIVO',
          iniciado_em: new Date('2026-01-01T00:00:00Z'),
          encerrado_em: null,
        },
      ],
    });

    const contract = player.getActiveContract();
    expect(contract?.id).toBe(9);
    expect(contract?.playerId).toBe(3);
    expect(contract?.clubId).toBe(2);
    expect(contract?.purchaseValue).toEqual(Money.ofCents(4500));
    expect(contract?.loyaltyUntil).toBe(fidelidade);
    expect(contract?.status).toBe('ATIVO');
  });
});
