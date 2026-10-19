import {
  ConflictError,
  NotFoundError,
} from '../../common/errors/domain.errors.js';
import { Position } from '../../domain/position.js';
import { aPlayer } from '../../players/tests/player.builder.js';
import {
  ILineupRepository,
  LineupChangeState,
  StoredLineup,
} from '../application/interfaces/repositories/lineup.repository.interface.js';
import { GetLineupUseCase } from '../application/usecases/get-lineup/get-lineup.usecase.js';
import { UpdateLineupUseCase } from '../application/usecases/update-lineup/update-lineup.usecase.js';
import { fitsFormation, formationRequirement } from '../domain/formation.js';
import { toLineupResponse } from '../presentation/presenters/lineup.presenter.js';

/** Titular do Águias FC (clube 1) com os valores padrão do builder */
const starter = (id: number, name: string, position: Position) =>
  aPlayer().withId(id).withName(name).withPosition(position).withClub(1);

// Titulares do exemplo 2.4.1 (Águias FC, 2-1-1), fora da ordem do elenco
const OTTO = starter(34, 'Otto Rangel', 'ATA').build();
const DAVI = starter(31, 'Davi Lins', 'LAT')
  .withCondition('MAL_CONDICIONADO')
  .build();
const RUI = starter(30, 'Rui Prado', 'GOL').build();
const LAURO = starter(33, 'Lauro Neves', 'MEI').build();
const TEO = starter(32, 'Téo Brandão', 'ZAG').build();
const STARTERS = [OTTO, DAVI, RUI, LAURO, TEO];
const IDS = [34, 31, 30, 33, 32];

function repository(
  stored: StoredLineup | null,
  change: Partial<LineupChangeState> = {},
) {
  const state: LineupChangeState = {
    club: { id: 1, name: 'Águias FC' },
    players: STARTERS.map((p) => ({ id: p.id, player: p })),
    ...change,
  };
  return {
    findByClub: vi.fn().mockResolvedValue(stored),
    replace: vi.fn(
      async (
        _clubId: number,
        _formation: string,
        _ids: number[],
        validate: (s: LineupChangeState) => void,
      ) => validate(state),
    ),
  };
}

const COMPLETE: StoredLineup = {
  clubId: 1,
  clubName: 'Águias FC',
  formation: '2-1-1',
  starters: STARTERS,
};

describe('formation', () => {
  it('deve fechar a formação com 1 GOL e os setores da tabela da RN19', () => {
    expect(fitsFormation('2-1-1', ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA'])).toBe(
      true,
    );
    expect(fitsFormation('3-1', ['GOL', 'ZAG', 'LAT', 'LAT', 'ATA'])).toBe(
      true,
    );
    expect(fitsFormation('2-2', ['GOL', 'ZAG', 'LAT', 'ATA', 'ATA'])).toBe(
      true,
    );
    expect(fitsFormation('1-2-1', ['GOL', 'ZAG', 'MEI', 'MEI', 'ATA'])).toBe(
      true,
    );
    expect(fitsFormation('2-1-1', ['GOL', 'GOL', 'LAT', 'MEI', 'ATA'])).toBe(
      false,
    );
    expect(fitsFormation('2-2', ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA'])).toBe(
      false,
    );
  });

  it('deve descrever o que cada formação exige', () => {
    expect(formationRequirement('2-1-1')).toBe(
      '1 GOL, 2 entre ZAG e LAT, 1 MEI e 1 ATA',
    );
    expect(formationRequirement('3-1')).toBe(
      '1 GOL, 3 entre ZAG e LAT e 1 ATA',
    );
  });
});

describe('GetLineupUseCase', () => {
  it('deve devolver a escalação completa na ordem do elenco (2.4.1)', async () => {
    const output = await new GetLineupUseCase(
      repository(COMPLETE) as unknown as ILineupRepository,
    ).execute({ clubId: 1 });

    expect(output.clubId).toBe(1);
    expect(output.formation).toBe('2-1-1');
    expect(output.complete).toBe(true);
    expect(output.starters.map((p) => p.id)).toEqual([30, 32, 31, 33, 34]);
    expect(output.starters[2].getName()).toBe('Davi Lins');
  });

  it('deve apresentar a escalação no formato da API (2.4.1)', async () => {
    const output = await new GetLineupUseCase(
      repository(COMPLETE) as unknown as ILineupRepository,
    ).execute({ clubId: 1 });

    const response = toLineupResponse(output);
    expect(response).toMatchObject({
      club_id: 1,
      formation: '2-1-1',
      complete: true,
    });
    expect(response.players[2]).toMatchObject({
      name: 'Davi Lins',
      condition: 'MAL_CONDICIONADO',
      overall: expect.any(Number),
      market_value: expect.any(Number),
    });
  });

  it('deve devolver formação nula e lista vazia para clube que nunca escalou', async () => {
    await expect(
      new GetLineupUseCase(
        repository({
          ...COMPLETE,
          formation: null,
          starters: [],
        }) as unknown as ILineupRepository,
      ).execute({ clubId: 1 }),
    ).resolves.toEqual({
      clubId: 1,
      formation: null,
      complete: false,
      starters: [],
    });
  });

  it('deve manter a formação e marcar incompleta quando um titular saiu (RN19, item 5)', async () => {
    const output = await new GetLineupUseCase(
      repository({
        ...COMPLETE,
        starters: [RUI, TEO, DAVI, LAURO],
      }) as unknown as ILineupRepository,
    ).execute({ clubId: 1 });
    expect(output).toMatchObject({ formation: '2-1-1', complete: false });
    expect(output.starters).toHaveLength(4);
  });

  it('deve recusar clube inexistente com 404', async () => {
    await expect(
      new GetLineupUseCase(
        repository(null) as unknown as ILineupRepository,
      ).execute({ clubId: 9 }),
    ).rejects.toThrow(new NotFoundError('Clube não encontrado'));
  });
});

describe('UpdateLineupUseCase', () => {
  function update(
    repo: ReturnType<typeof repository>,
    formation = '2-1-1' as const,
  ) {
    return new UpdateLineupUseCase(
      repo as unknown as ILineupRepository,
    ).execute({
      clubId: 1,
      formation,
      playerIds: IDS,
    });
  }

  it('deve substituir a escalação e devolver a escalação gravada', async () => {
    const repo = repository(COMPLETE);
    const output = await update(repo);

    expect(repo.replace).toHaveBeenCalledWith(
      1,
      '2-1-1',
      IDS,
      expect.any(Function),
    );
    expect(output).toMatchObject({
      clubId: 1,
      formation: '2-1-1',
      complete: true,
    });
  });

  it('deve recusar clube ou jogador inexistente com 404', async () => {
    await expect(update(repository(COMPLETE, { club: null }))).rejects.toThrow(
      new NotFoundError('Clube não encontrado'),
    );
    await expect(
      update(
        repository(COMPLETE, {
          players: [
            ...STARTERS.slice(1).map((p) => ({ id: p.id, player: p })),
            { id: 34, player: null },
          ],
        }),
      ),
    ).rejects.toThrow(new NotFoundError('Jogador 34 não encontrado'));
  });

  it('deve recusar jogador de fora do elenco com 409', async () => {
    const other = starter(34, 'Otto Rangel', 'ATA').withClub(2).build();
    await expect(
      update(
        repository(COMPLETE, {
          players: [other, ...STARTERS.slice(1)].map((p) => ({
            id: p.id,
            player: p,
          })),
        }),
      ),
    ).rejects.toThrow(
      new ConflictError('Otto Rangel não é do elenco do Águias FC.'),
    );
  });

  it('deve recusar jogador DOENTE com 409 e aceitar MAL_CONDICIONADO', async () => {
    const sick = starter(33, 'Lauro Neves', 'MEI')
      .withCondition('DOENTE')
      .build();
    await expect(
      update(
        repository(COMPLETE, {
          players: STARTERS.map((p) => ({
            id: p.id,
            player: p.id === 33 ? sick : p,
          })),
        }),
      ),
    ).rejects.toThrow(
      new ConflictError('Lauro Neves está DOENTE e não pode ser escalado.'),
    );
  });

  it('deve recusar posições que não fecham a formação com 409', async () => {
    await expect(update(repository(COMPLETE), '2-2' as never)).rejects.toThrow(
      new ConflictError(
        'As posições não fecham a formação 2-2: são precisos 1 GOL, 2 entre ZAG e LAT e 2 ATA.',
      ),
    );
  });
});
