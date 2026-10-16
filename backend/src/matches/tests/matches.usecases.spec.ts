import {
  ConflictError,
  NotFoundError,
} from '../../common/errors/domain.errors.js';
import { Condition } from '../../domain/market-value.js';
import { Position } from '../../domain/player-rating.js';
import { PlayerEntity } from '../../players/domain/entities/player.entity.js';
import {
  IMatchRepository,
  MatchRecord,
  MatchTeamState,
  PlayMatchState,
  StoredMatch,
} from '../application/interfaces/repositories/match.repository.interface.js';
import { FindMatchByIdUseCase } from '../application/usecases/find-match-by-id/find-match-by-id.usecase.js';
import { FindMatchesUseCase } from '../application/usecases/find-matches/find-matches.usecase.js';
import { GetStandingsUseCase } from '../application/usecases/get-standings/get-standings.usecase.js';
import { PlayMatchUseCase } from '../application/usecases/play-match/play-match.usecase.js';
import { toMatchResponse } from '../presentation/presenters/match.presenter.js';

const NOW = new Date('2026-11-12T15:00:00-03:00');

function player(
  id: number,
  name: string,
  position: Position,
  attributes: Partial<PlayerEntity['attributes']>,
  condition: Condition = 'APTO',
) {
  return new PlayerEntity(
    id,
    name,
    position,
    70,
    25,
    30,
    condition,
    1,
    {
      pace: 50,
      shooting: 50,
      passing: 50,
      dribbling: 50,
      defending: 50,
      physical: 50,
      ...attributes,
    },
    80,
  );
}

// Exemplo da RN20, com os titulares fora da ordem do elenco
const AGUIAS: MatchTeamState = {
  id: 1,
  name: 'Águias FC',
  formation: '2-1-1',
  starters: [
    player(34, 'Otto Rangel', 'ATA', { shooting: 75 }),
    player(
      31,
      'Davi Lins',
      'LAT',
      { dribbling: 74, defending: 66 },
      'MAL_CONDICIONADO',
    ),
    player(30, 'Rui Prado', 'GOL', { defending: 77 }),
    player(33, 'Lauro Neves', 'MEI', { passing: 82 }),
    player(32, 'Téo Brandão', 'ZAG', { defending: 84 }),
  ],
};
const DELTA: MatchTeamState = {
  id: 2,
  name: 'Delta FC',
  formation: '2-1-1',
  starters: [
    player(40, 'Ivo Teles', 'GOL', { defending: 72 }),
    player(41, 'Hugo Vaz', 'ZAG', { defending: 84 }),
    player(42, 'Lino Matos', 'LAT', { dribbling: 79, defending: 63 }),
    player(43, 'Nei Soares', 'MEI', { passing: 70 }),
    player(44, 'Ugo Falcão', 'ATA', { shooting: 81 }),
  ],
};

function playRepository(state: PlayMatchState) {
  return {
    play: vi.fn(
      async (
        _home: number,
        _away: number,
        play: (s: PlayMatchState) => MatchRecord,
      ): Promise<StoredMatch> => ({ id: 1, ...play(state) }),
    ),
  };
}

function playWith(state: PlayMatchState) {
  const repo = playRepository(state);
  return {
    repo,
    result: new PlayMatchUseCase(repo as unknown as IMatchRepository).execute(
      { homeClubId: 1, awayClubId: 2 },
      NOW,
    ),
  };
}

describe('PlayMatchUseCase', () => {
  it('deve jogar e devolver a partida do exemplo 2.4.2 com os 6 duelos', async () => {
    // Caso de uso + presenter: a resposta do exemplo 2.4.2
    const output = toMatchResponse(
      await playWith({ home: AGUIAS, away: DELTA }).result,
      true,
    );

    expect(output).toMatchObject({
      id: 1,
      played_at: '2026-11-12T15:00:00-03:00',
      home: {
        club_id: 1,
        club_name: 'Águias FC',
        formation: '2-1-1',
        goals: 1,
      },
      away: { club_id: 2, club_name: 'Delta FC', formation: '2-1-1', goals: 2 },
      result: 'VISITANTE',
    });
    expect(output.duels).toHaveLength(6);
    expect(output.duels![0]).toEqual({
      order: 1,
      attacking_club_id: 1,
      attacker: {
        player_id: 34,
        player_name: 'Otto Rangel',
        position: 'ATA',
        condition: 'APTO',
        attribute: 'shooting',
        value: 75,
      },
      defender: {
        player_id: 40,
        player_name: 'Ivo Teles',
        position: 'GOL',
        condition: 'APTO',
        attribute: 'defending',
        value: 72,
      },
      goal: true,
    });
    expect(output.duels![5]).toMatchObject({
      order: 6,
      attacking_club_id: 2,
      defender: {
        player_name: 'Davi Lins',
        condition: 'MAL_CONDICIONADO',
        value: 56,
      },
      goal: true,
    });
  });

  it('deve recusar mandante ou visitante inexistente com 404', async () => {
    await expect(playWith({ home: null, away: DELTA }).result).rejects.toThrow(
      new NotFoundError('Clube mandante não encontrado'),
    );
    await expect(playWith({ home: AGUIAS, away: null }).result).rejects.toThrow(
      new NotFoundError('Clube visitante não encontrado'),
    );
  });

  it('deve recusar clube que nunca escalou ou com titular a menos (409)', async () => {
    await expect(
      playWith({
        home: { ...AGUIAS, formation: null, starters: [] },
        away: DELTA,
      }).result,
    ).rejects.toThrow(
      new ConflictError(
        'Escalação incompleta: o Águias FC não tem os 5 titulares.',
      ),
    );
    await expect(
      playWith({
        home: AGUIAS,
        away: { ...DELTA, starters: DELTA.starters.slice(1) },
      }).result,
    ).rejects.toThrow(
      new ConflictError(
        'Escalação incompleta: o Delta FC não tem os 5 titulares.',
      ),
    );
  });
});

describe('FindMatchesUseCase e FindMatchByIdUseCase', () => {
  const stored: StoredMatch = {
    id: 7,
    playedAt: NOW,
    home: { clubId: 2, clubName: 'Delta FC', formation: '2-1-1', goals: 2 },
    away: { clubId: 1, clubName: 'Águias FC', formation: '3-1', goals: 1 },
    result: 'MANDANTE',
    duels: [],
  };

  it('deve listar sem duelos e filtrar por clube existente', async () => {
    const repo = {
      clubExists: vi.fn().mockResolvedValue(true),
      findMany: vi.fn().mockResolvedValue([stored]),
    };
    const matches = await new FindMatchesUseCase(
      repo as unknown as IMatchRepository,
    ).execute({ clubId: 1 });
    const output = matches.map((match) => toMatchResponse(match, false));

    expect(repo.findMany).toHaveBeenCalledWith(1);
    expect(output).toEqual([
      {
        id: 7,
        played_at: '2026-11-12T15:00:00-03:00',
        home: {
          club_id: 2,
          club_name: 'Delta FC',
          formation: '2-1-1',
          goals: 2,
        },
        away: {
          club_id: 1,
          club_name: 'Águias FC',
          formation: '3-1',
          goals: 1,
        },
        result: 'MANDANTE',
      },
    ]);
  });

  it('deve recusar filtro por clube inexistente e partida inexistente com 404', async () => {
    const repo = {
      clubExists: vi.fn().mockResolvedValue(false),
      findMany: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
    };
    await expect(
      new FindMatchesUseCase(repo as unknown as IMatchRepository).execute({
        clubId: 9,
      }),
    ).rejects.toThrow(new NotFoundError('Clube não encontrado'));
    await expect(
      new FindMatchByIdUseCase(repo as unknown as IMatchRepository).execute({
        id: 9,
      }),
    ).rejects.toThrow(new NotFoundError('Partida não encontrada'));
  });

  it('deve devolver a partida com os duelos gravados', async () => {
    const repo = { findById: vi.fn().mockResolvedValue(stored) };
    const output = await new FindMatchByIdUseCase(
      repo as unknown as IMatchRepository,
    ).execute({ id: 7 });
    expect(output.duels).toEqual([]);
  });
});

describe('GetStandingsUseCase', () => {
  it('deve calcular a classificação a partir dos placares gravados (2.4.3)', async () => {
    const repo = {
      findStandingsData: vi.fn().mockResolvedValue({
        clubs: [
          { id: 1, name: 'Águias FC' },
          { id: 2, name: 'Delta FC' },
          { id: 3, name: 'Gama SC' },
        ],
        scores: [{ homeClubId: 1, awayClubId: 2, homeGoals: 1, awayGoals: 2 }],
      }),
    };
    const table = await new GetStandingsUseCase(
      repo as unknown as IMatchRepository,
    ).execute();

    expect(
      table.map((r) => [r.position, r.clubId, r.points, r.goalDifference]),
    ).toEqual([
      [1, 2, 3, 1],
      [2, 3, 0, 0],
      [3, 1, 0, -1],
    ]);
  });
});
