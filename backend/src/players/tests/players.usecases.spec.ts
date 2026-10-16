import {
  ConflictError,
  NotFoundError,
} from '../../common/errors/domain.errors.js';
import { IPlayerRepository } from '../application/interfaces/repositories/player.repository.interface.js';
import { CreatePlayerUseCase } from '../application/usecases/create-player/create-player.usecase.js';
import { DeletePlayerUseCase } from '../application/usecases/delete-player/delete-player.usecase.js';
import { FindPlayerByIdUseCase } from '../application/usecases/find-player-by-id/find-player-by-id.usecase.js';
import { UpdatePlayerConditionUseCase } from '../application/usecases/update-player-condition/update-player-condition.usecase.js';
import { UpdatePlayerUseCase } from '../application/usecases/update-player/update-player.usecase.js';
import { PlayerEntity } from '../domain/entities/player.entity.js';

describe('Player Use Cases (Clean Architecture)', () => {
  let repositoryMock: any;
  let createPlayerUseCase: CreatePlayerUseCase;
  let findPlayerByIdUseCase: FindPlayerByIdUseCase;
  let updatePlayerUseCase: UpdatePlayerUseCase;
  let updatePlayerConditionUseCase: UpdatePlayerConditionUseCase;
  let deletePlayerUseCase: DeletePlayerUseCase;

  beforeEach(() => {
    repositoryMock = {
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateCondition: vi.fn(),
      softDelete: vi.fn(),
      findMany: vi.fn(),
      checkClubExists: vi.fn(),
    };

    createPlayerUseCase = new CreatePlayerUseCase(
      repositoryMock as IPlayerRepository,
    );
    findPlayerByIdUseCase = new FindPlayerByIdUseCase(
      repositoryMock as IPlayerRepository,
    );
    updatePlayerUseCase = new UpdatePlayerUseCase(
      repositoryMock as IPlayerRepository,
    );
    updatePlayerConditionUseCase = new UpdatePlayerConditionUseCase(
      repositoryMock as IPlayerRepository,
    );
    deletePlayerUseCase = new DeletePlayerUseCase(
      repositoryMock as IPlayerRepository,
    );
  });

  describe('CreatePlayerUseCase', () => {
    it('deve cadastrar um jogador calculando overall e valor base (RN06)', async () => {
      // Meia Lua: MEI, agilidade 85, idade 25, potencial 86
      const input = {
        name: 'Meia Lua',
        position: 'MEI' as const,
        agility: 85,
        age: 25,
        pace: 70,
        shooting: 68,
        passing: 82,
        dribbling: 79,
        defending: 55,
        physical: 64,
        potential: 86,
      };

      repositoryMock.create.mockResolvedValue(
        new PlayerEntity(
          2,
          'Meia Lua',
          'MEI',
          85,
          25,
          40.0,
          'APTO',
          null,
          {
            pace: 70,
            shooting: 68,
            passing: 82,
            dribbling: 79,
            defending: 55,
            physical: 64,
          },
          86,
        ),
      );

      const result = await createPlayerUseCase.execute(input);

      expect(repositoryMock.create).toHaveBeenCalledWith({
        name: 'Meia Lua',
        position: 'MEI',
        agility: 85,
        age: 25,
        baseValue: 40.0,
        attributes: {
          pace: 70,
          shooting: 68,
          passing: 82,
          dribbling: 79,
          defending: 55,
          physical: 64,
        },
        potential: 86,
      });
      expect(result.id).toBe(2);
      expect(result.calculateOverall()).toBe(75);
      expect(result.baseValue).toBe(40.0);
      expect(result.calculateMarketValue()).toBe(40.0);
    });
  });

  describe('UpdatePlayerUseCase', () => {
    it('deve impedir mudança de posição de jogador com clube (409)', async () => {
      repositoryMock.findById.mockResolvedValue(
        new PlayerEntity(
          4,
          'Jogador Teste',
          'MEI',
          70,
          23,
          30.0,
          'APTO',
          1, // Vinculado a clube
          {
            pace: 70,
            shooting: 70,
            passing: 70,
            dribbling: 70,
            defending: 70,
            physical: 70,
          },
          80,
        ),
      );

      await expect(
        updatePlayerUseCase.execute({
          id: 4,
          name: 'Jogador Teste',
          position: 'ATA',
          agility: 70,
          age: 23,
        }),
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('UpdatePlayerConditionUseCase', () => {
    it('deve impedir transição direta de DOENTE para APTO (409)', async () => {
      repositoryMock.findById.mockResolvedValue(
        new PlayerEntity(
          2,
          'Meia Lua',
          'MEI',
          85,
          25,
          40.0,
          'DOENTE',
          null,
          {
            pace: 70,
            shooting: 68,
            passing: 82,
            dribbling: 79,
            defending: 55,
            physical: 64,
          },
          86,
        ),
      );

      await expect(
        updatePlayerConditionUseCase.execute({ id: 2, condition: 'APTO' }),
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('DeletePlayerUseCase', () => {
    it('deve impedir exclusão de jogador pertencente a um clube (409)', async () => {
      repositoryMock.findById.mockResolvedValue(
        new PlayerEntity(
          2,
          'Meia Lua',
          'MEI',
          85,
          25,
          40.0,
          'APTO',
          1, // Tem clube
          {
            pace: 70,
            shooting: 68,
            passing: 82,
            dribbling: 79,
            defending: 55,
            physical: 64,
          },
          86,
        ),
      );

      await expect(deletePlayerUseCase.execute({ id: 2 })).rejects.toThrow(
        ConflictError,
      );
    });

    it('deve retornar 404 ao buscar jogador inexistente', async () => {
      repositoryMock.findById.mockResolvedValue(null);
      await expect(findPlayerByIdUseCase.execute({ id: 999 })).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
