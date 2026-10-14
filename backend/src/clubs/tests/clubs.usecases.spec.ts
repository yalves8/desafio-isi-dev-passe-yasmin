import {
  ConflictError,
  NotFoundError,
} from '../../common/errors/domain.errors.js';
import { ContractEntity } from '../../contracts/domain/entities/contract.entity.js';
import { PlayerEntity } from '../../players/domain/entities/player.entity.js';
import { IClubRepository } from '../application/interfaces/repositories/club.repository.interface.js';
import { CreateClubUseCase } from '../application/usecases/create-club/create-club.usecase.js';
import { FindClubByIdUseCase } from '../application/usecases/find-club-by-id/find-club-by-id.usecase.js';
import { FindClubsUseCase } from '../application/usecases/find-clubs/find-clubs.usecase.js';
import { ClubEntity } from '../domain/entities/club.entity.js';

describe('Club Use Cases (Clean Architecture)', () => {
  let repositoryMock: any;
  let createClubUseCase: CreateClubUseCase;
  let findClubsUseCase: FindClubsUseCase;
  let findClubByIdUseCase: FindClubByIdUseCase;

  beforeEach(() => {
    repositoryMock = {
      count: vi.fn(),
      findByNormalizedName: vi.fn(),
      findByAcronym: vi.fn(),
      findByIdWithSquad: vi.fn(),
      findAllWithSquad: vi.fn(),
      create: vi.fn(),
    };

    createClubUseCase = new CreateClubUseCase(
      repositoryMock as IClubRepository,
    );
    findClubsUseCase = new FindClubsUseCase(repositoryMock as IClubRepository);
    findClubByIdUseCase = new FindClubByIdUseCase(
      repositoryMock as IClubRepository,
    );
  });

  describe('CreateClubUseCase', () => {
    it('deve criar um clube com saldo inicial de 300,00 e patrimônio inicial (RN10)', async () => {
      repositoryMock.count.mockResolvedValue(0);
      repositoryMock.findByNormalizedName.mockResolvedValue(null);
      repositoryMock.findByAcronym.mockResolvedValue(null);
      repositoryMock.create.mockResolvedValue(
        new ClubEntity(1, 'Águias FC', 'águias fc', 'AGU', 300.0, null),
      );

      const result = await createClubUseCase.execute({
        name: 'Águias FC',
        acronym: 'AGU',
      });

      expect(repositoryMock.create).toHaveBeenCalledWith({
        name: 'Águias FC',
        normalizedName: 'águias fc',
        acronym: 'AGU',
        cash: 300.0,
      });
      expect(result.cash).toBe(300.0);
      expect(result.squad_value).toBe(0.0);
      expect(result.net_worth).toBe(300.0);
    });

    it('deve recusar a criação do 21º clube na liga (409)', async () => {
      repositoryMock.count.mockResolvedValue(20);

      await expect(
        createClubUseCase.execute({ name: 'Outro Clube FC', acronym: 'OCF' }),
      ).rejects.toThrow(ConflictError);
    });

    it('deve recusar clube com nome repetido ignorando maiúsculas e minúsculas (RN10)', async () => {
      repositoryMock.count.mockResolvedValue(5);
      repositoryMock.findByNormalizedName.mockResolvedValue(
        new ClubEntity(1, 'Águias FC', 'águias fc', 'AGU', 300.0),
      );

      await expect(
        createClubUseCase.execute({ name: 'águias fc', acronym: 'AGU' }),
      ).rejects.toThrow(ConflictError);
    });

    it('deve recusar clube com sigla já cadastrada (409)', async () => {
      repositoryMock.count.mockResolvedValue(5);
      repositoryMock.findByNormalizedName.mockResolvedValue(null);
      repositoryMock.findByAcronym.mockResolvedValue(
        new ClubEntity(
          1,
          'América Grandioso United',
          'américa grandioso united',
          'AGU',
          300.0,
        ),
      );

      await expect(
        createClubUseCase.execute({
          name: 'América Grandioso United',
          acronym: 'AGU',
        }),
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('FindClubsUseCase', () => {
    it('deve listar clubes calculando patrimônio e ordenando', async () => {
      repositoryMock.findAllWithSquad.mockResolvedValue([
        {
          club: new ClubEntity(1, 'Águias FC', 'águias fc', 'AGU', 300.0),
          players: [],
        },
      ]);

      const result = await findClubsUseCase.execute({ sort: 'name' });
      expect(result).toHaveLength(1);
      expect(result[0].net_worth).toBe(300.0);
    });
  });

  describe('FindClubByIdUseCase', () => {
    it('deve retornar 404 ao consultar clube inexistente', async () => {
      repositoryMock.findByIdWithSquad.mockResolvedValue(null);
      await expect(findClubByIdUseCase.execute({ id: 999 })).rejects.toThrow(
        NotFoundError,
      );
    });

    it('deve consultar clube com elenco ordenado segundo RN11 e calcular patrimônio e multa', async () => {
      const club = new ClubEntity(1, 'Águias FC', 'águias fc', 'AGU', 300.0);
      const contract = new ContractEntity(
        1,
        1,
        1,
        25.0,
        new Date(Date.now() + 15 * 86400000), // 15 dias -> multa 5%
        'ATIVO',
      );

      const pAtacante = new PlayerEntity(
        1,
        'Beto Atacante',
        'ATA',
        80,
        24,
        25.0,
        'APTO',
        1,
        { pace: 80, shooting: 85, passing: 70, dribbling: 75, defending: 30, physical: 70 },
        85,
        null,
        new Date(),
        contract,
      );

      const pGoleiro = new PlayerEntity(
        2,
        'Alair Goleiro',
        'GOL',
        75,
        28,
        20.0,
        'APTO',
        1,
        { pace: 50, shooting: 20, passing: 60, dribbling: 40, defending: 85, physical: 80 },
        82,
        null,
        new Date(),
        null,
      );

      repositoryMock.findByIdWithSquad.mockResolvedValue({
        club,
        players: [pAtacante, pGoleiro], // Ordem inversa para testar a ordenação RN11
      });

      const result = await findClubByIdUseCase.execute({ id: 1 });

      expect(result.id).toBe(1);
      expect(result.cash).toBe(300.0);
      expect(result.players).toHaveLength(2);
      // GOL deve vir antes de ATA segundo a RN11
      expect(result.players[0].position).toBe('GOL');
      expect(result.players[0].name).toBe('Alair Goleiro');
      expect(result.players[0].contract).toBeNull();

      expect(result.players[1].position).toBe('ATA');
      expect(result.players[1].name).toBe('Beto Atacante');
      expect(result.players[1].contract).not.toBeNull();
      expect(result.players[1].contract?.penalty_rate).toBe(5);

      expect(result.squad_value).toBeGreaterThan(0);
      expect(result.net_worth).toBe(result.cash + result.squad_value);
    });
  });

  describe('ClubEntity (Domain)', () => {
    it('deve ordenar o elenco respeitando posição (RN11), nome e ID', () => {
      const club = new ClubEntity(1, 'FC Teste', 'fc teste', 'FCT', 100.0);
      const p1 = new PlayerEntity(1, 'Zico', 'MEI', 80, 25, 20.0, 'APTO', 1, { pace: 70, shooting: 70, passing: 70, dribbling: 70, defending: 70, physical: 70 }, 80);
      const p2 = new PlayerEntity(2, 'Ademir', 'MEI', 80, 25, 20.0, 'APTO', 1, { pace: 70, shooting: 70, passing: 70, dribbling: 70, defending: 70, physical: 70 }, 80);
      const p3 = new PlayerEntity(3, 'Barbosa', 'GOL', 80, 25, 20.0, 'APTO', 1, { pace: 70, shooting: 70, passing: 70, dribbling: 70, defending: 70, physical: 70 }, 80);

      const sorted = club.sortSquad([p1, p2, p3]);
      expect(sorted.map((p) => p.getName())).toEqual(['Barbosa', 'Ademir', 'Zico']);
    });
  });
});

