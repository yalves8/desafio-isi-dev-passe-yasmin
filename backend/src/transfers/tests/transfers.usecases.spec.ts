import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../common/errors/domain.errors.js';
import { addDays } from '../../common/utils/date.js';
import { PlayerEntity } from '../../players/domain/entities/player.entity.js';
import {
  ITransferRepository,
  PurchaseRecord,
  PurchaseState,
} from '../application/interfaces/repositories/transfer.repository.interface.js';
import { BuyPlayerUseCase } from '../application/usecases/buy-player/buy-player.usecase.js';

// 02/11/2026 10:15 em Brasília (exemplo 2.3.1 do desafio)
const NOW = new Date('2026-11-02T10:15:00-03:00');
const LOYALTY = new Date('2027-03-02T10:15:00-03:00');

/** Jogador com o valor de mercado do caso; o cálculo do valor tem testes próprios (RN05) */
function player(marketValue: number, clubId: number | null = null) {
  const entity = new PlayerEntity(
    2,
    'Meia Lua',
    'MEI',
    85,
    25,
    marketValue,
    'APTO',
    clubId,
    {
      pace: 70,
      shooting: 68,
      passing: 82,
      dribbling: 79,
      defending: 55,
      physical: 66,
    },
    86,
  );
  vi.spyOn(entity, 'calculateMarketValue').mockReturnValue(marketValue);
  return entity;
}

function state(overrides: Partial<PurchaseState> = {}): PurchaseState {
  return {
    player: player(37),
    club: { id: 1, name: 'Águias FC', cash: 30000 },
    squadSize: 0,
    soldBefore: false,
    ...overrides,
  };
}

/** Repositório falso: entrega o estado à decisão e devolve o que seria gravado */
function repositoryWith(current: PurchaseState) {
  const repository = {
    purchase: vi.fn(
      async (
        _playerId: number,
        _clubId: number,
        decide: (s: PurchaseState) => PurchaseRecord,
      ) => ({ record: decide(current), transactionId: 10 }),
    ),
  };
  return repository;
}

function buy(current: PurchaseState, loyaltyUntil = LOYALTY) {
  const repository = repositoryWith(current);
  const useCase = new BuyPlayerUseCase(
    repository as unknown as ITransferRepository,
  );
  return {
    repository,
    result: useCase.execute({ playerId: 2, clubId: 1, loyaltyUntil }, NOW),
  };
}

describe('BuyPlayerUseCase', () => {
  it('deve comprar pelo valor de mercado com taxa e devolver contrato e novo caixa (2.3.1)', async () => {
    const { repository, result } = buy(state());

    await expect(result).resolves.toEqual({
      id: 10,
      club_id: 1,
      player_id: 2,
      player_name: 'Meia Lua',
      type: 'COMPRA',
      value: 37,
      fee: 1.85,
      penalty: 0,
      profit: null,
      cash_change: -38.85,
      created_at: '2026-11-02T10:15:00-03:00',
      contract: {
        purchase_value: 37,
        loyalty_until: '2027-03-02T10:15:00-03:00',
        status: 'ATIVO',
      },
      club_cash: 261.15,
    });
    expect(repository.purchase).toHaveBeenCalledWith(
      2,
      1,
      expect.any(Function),
    );
  });

  it.each([
    // caixa, valor de mercado, taxa, custo (tabela da RN13)
    [30000, 28, 0, 28],
    [30000, 30, 0, 30],
    [30000, 30.01, 1.5, 31.51],
    [10000, 47.62, 2.38, 50],
  ])(
    'deve aceitar caixa %i centavos e valor %d com taxa %d (custo %d)',
    async (cash, marketValue, fee, cost) => {
      const { result } = buy(
        state({
          player: player(marketValue),
          club: { id: 1, name: 'Águias FC', cash },
        }),
      );
      const output = await result;
      expect(output.fee).toBe(fee);
      expect(output.cash_change).toBe(-cost);
    },
  );

  it('deve recusar custo acima de 50% do caixa (RN13)', async () => {
    const { result } = buy(
      state({
        player: player(48),
        club: { id: 1, name: 'Águias FC', cash: 10000 },
      }),
    );
    await expect(result).rejects.toThrow(
      new ConflictError(
        'O custo da compra (50,40) passa do limite de 50% do caixa (50,00).',
      ),
    );
  });

  it('deve mostrar o limite exato, sem arredondar, quando o caixa tem centavo ímpar', async () => {
    // caixa 261,15: limite 130,575; custo 130,58 é recusado
    const { result } = buy(
      state({
        player: player(124.36),
        club: { id: 1, name: 'Águias FC', cash: 26115 },
      }),
    );
    await expect(result).rejects.toThrow(
      'O custo da compra (130,58) passa do limite de 50% do caixa (130,575).',
    );
  });

  it('deve recusar jogador inexistente e clube inexistente com 404', async () => {
    await expect(buy(state({ player: null })).result).rejects.toThrow(
      new NotFoundError('Jogador não encontrado'),
    );
    await expect(buy(state({ club: null })).result).rejects.toThrow(
      new NotFoundError('Clube não encontrado'),
    );
  });

  it('deve recusar jogador que não está livre (RN12)', async () => {
    await expect(buy(state({ player: player(37, 3) })).result).rejects.toThrow(
      new ConflictError('Meia Lua não está livre: já pertence a um clube.'),
    );
  });

  it('deve recusar a recompra pelo clube que já vendeu o jogador (RN12)', async () => {
    await expect(buy(state({ soldBefore: true })).result).rejects.toThrow(
      new ConflictError(
        'O Águias FC já vendeu o Meia Lua e não pode comprá-lo de novo.',
      ),
    );
  });

  it('deve recusar a compra com o elenco cheio (RN14)', async () => {
    await expect(buy(state({ squadSize: 12 })).result).rejects.toThrow(
      new ConflictError(
        'O elenco do Águias FC já tem 12 jogadores, o limite da liga.',
      ),
    );
    await expect(buy(state({ squadSize: 11 })).result).resolves.toBeDefined();
  });

  it('deve recusar fim da fidelidade que não é depois da compra, sem abrir a transação', async () => {
    const { repository, result } = buy(state(), NOW);
    await expect(result).rejects.toThrow(
      new ValidationError(
        'O fim da fidelidade precisa ser depois do momento da compra',
      ),
    );
    expect(repository.purchase).not.toHaveBeenCalled();
  });

  it('deve aceitar até 1.095 dias depois da compra e recusar além disso', async () => {
    await expect(
      buy(state(), addDays(NOW, 1095)).result,
    ).resolves.toBeDefined();
    await expect(
      buy(state(), new Date(addDays(NOW, 1095).getTime() + 60_000)).result,
    ).rejects.toThrow(
      new ValidationError(
        'O fim da fidelidade pode ser no máximo 1.095 dias depois da compra',
      ),
    );
  });
});
