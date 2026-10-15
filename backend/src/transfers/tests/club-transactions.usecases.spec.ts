import { NotFoundError } from '../../common/errors/domain.errors.js';
import {
  ITransferRepository,
  TransactionRecord,
} from '../application/interfaces/repositories/transfer.repository.interface.js';
import { ExportClubTransactionsUseCase } from '../application/usecases/export-club-transactions/export-club-transactions.usecase.js';
import { FindClubTransactionsUseCase } from '../application/usecases/find-club-transactions/find-club-transactions.usecase.js';

// Compra e venda do Meia Lua no Águias FC (exemplos 2.3.1 e 2.3.2), na ordem do histórico
const SALE: TransactionRecord = {
  id: 11,
  clubId: 1,
  playerId: 2,
  playerName: 'Meia Lua',
  type: 'VENDA',
  value: 4000,
  fee: 30,
  penalty: 400,
  profit: 300,
  cashChange: 3570,
  createdAt: new Date('2026-11-05T16:40:00-03:00'),
};
const PURCHASE: TransactionRecord = {
  id: 10,
  clubId: 1,
  playerId: 2,
  playerName: 'Meia Lua',
  type: 'COMPRA',
  value: 3700,
  fee: 185,
  penalty: 0,
  profit: null,
  cashChange: -3885,
  createdAt: new Date('2026-11-02T10:15:00-03:00'),
};

function repository(
  transactions: TransactionRecord[],
  { club = true, player = true } = {},
) {
  return {
    clubExists: vi.fn().mockResolvedValue(club),
    activePlayerExists: vi.fn().mockResolvedValue(player),
    findClubTransactions: vi.fn().mockResolvedValue(transactions),
  };
}

function find(repo: ReturnType<typeof repository>) {
  return new FindClubTransactionsUseCase(
    repo as unknown as ITransferRepository,
  );
}

describe('FindClubTransactionsUseCase', () => {
  it('deve devolver as transações gravadas e o summary (2.3.3)', async () => {
    const repo = repository([SALE, PURCHASE]);

    await expect(find(repo).execute({ clubId: 1 })).resolves.toEqual({
      data: [
        {
          id: 11,
          club_id: 1,
          player_id: 2,
          player_name: 'Meia Lua',
          type: 'VENDA',
          value: 40,
          fee: 0.3,
          penalty: 4,
          profit: 3,
          cash_change: 35.7,
          created_at: '2026-11-05T16:40:00-03:00',
        },
        {
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
        },
      ],
      summary: {
        total_spent: 38.85,
        total_received: 35.7,
        total_fees: 2.15,
        total_penalties: 4,
        total_profit: 3,
      },
    });
    expect(repo.findClubTransactions).toHaveBeenCalledWith(1, {
      types: undefined,
      playerId: undefined,
    });
  });

  it('deve repassar os filtros e somar só as transações filtradas', async () => {
    const repo = repository([SALE]);

    const output = await find(repo).execute({
      clubId: 1,
      types: ['VENDA'],
      playerId: 2,
    });

    expect(repo.findClubTransactions).toHaveBeenCalledWith(1, {
      types: ['VENDA'],
      playerId: 2,
    });
    expect(output.summary).toEqual({
      total_spent: 0,
      total_received: 35.7,
      total_fees: 0.3,
      total_penalties: 4,
      total_profit: 3,
    });
  });

  it('deve devolver lista vazia e totais zerados sem transações', async () => {
    await expect(find(repository([])).execute({ clubId: 1 })).resolves.toEqual({
      data: [],
      summary: {
        total_spent: 0,
        total_received: 0,
        total_fees: 0,
        total_penalties: 0,
        total_profit: 0,
      },
    });
  });

  it('deve recusar clube inexistente com 404', async () => {
    const repo = repository([], { club: false });
    await expect(find(repo).execute({ clubId: 9 })).rejects.toThrow(
      new NotFoundError('Clube não encontrado'),
    );
    expect(repo.findClubTransactions).not.toHaveBeenCalled();
  });

  it('deve recusar jogador do filtro inexistente ou excluído com 404', async () => {
    const repo = repository([], { player: false });
    await expect(
      find(repo).execute({ clubId: 1, playerId: 99 }),
    ).rejects.toThrow(new NotFoundError('Jogador não encontrado'));
    // Sem filtro de jogador, não consulta o jogador
    const withoutFilter = repository([]);
    await find(withoutFilter).execute({ clubId: 1 });
    expect(withoutFilter.activePlayerExists).not.toHaveBeenCalled();
  });
});

describe('ExportClubTransactionsUseCase', () => {
  function exportCsv(repo: ReturnType<typeof repository>) {
    return new ExportClubTransactionsUseCase(
      repo as unknown as ITransferRepository,
    );
  }

  it('deve gerar o CSV da RN18 na ordem do histórico, com LF no fim de cada linha', async () => {
    await expect(
      exportCsv(repository([SALE, PURCHASE])).execute({ clubId: 1 }),
    ).resolves.toBe(
      'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa\n' +
        '2026-11-05T16:40:00-03:00;VENDA;Meia Lua;40,00;0,30;4,00;3,00;35,70\n' +
        '2026-11-02T10:15:00-03:00;COMPRA;Meia Lua;37,00;1,85;0,00;;-38,85\n',
    );
  });

  it('deve trazer só o cabeçalho sem transações', async () => {
    await expect(
      exportCsv(repository([])).execute({ clubId: 1 }),
    ).resolves.toBe(
      'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa\n',
    );
  });

  it('deve pôr entre aspas o nome com ";" ou aspas, duplicando as aspas internas', async () => {
    const csv = await exportCsv(
      repository([
        { ...PURCHASE, playerName: 'Zé "Foguete" Lima' },
        { ...PURCHASE, playerName: 'Ana;Lima' },
      ]),
    ).execute({ clubId: 1 });

    expect(csv).toContain(';COMPRA;"Zé ""Foguete"" Lima";');
    expect(csv).toContain(';COMPRA;"Ana;Lima";');
  });

  it('deve recusar clube ou jogador inexistente como no histórico', async () => {
    await expect(
      exportCsv(repository([], { club: false })).execute({ clubId: 9 }),
    ).rejects.toThrow(new NotFoundError('Clube não encontrado'));
  });
});
