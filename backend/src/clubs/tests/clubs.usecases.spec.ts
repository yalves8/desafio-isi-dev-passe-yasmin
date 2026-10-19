import {
  ConflictError,
  NotFoundError,
} from '../../common/errors/domain.errors.js';
import { ContractEntity } from '../../contracts/domain/entities/contract.entity.js';
import { Money } from '../../domain/money.js';
import { aPlayer } from '../../players/tests/player.builder.js';
import { IClubRepository } from '../application/interfaces/repositories/club.repository.interface.js';
import { CreateClubUseCase } from '../application/usecases/create-club/create-club.usecase.js';
import { FindClubByIdUseCase } from '../application/usecases/find-club-by-id/find-club-by-id.usecase.js';
import { FindClubsUseCase } from '../application/usecases/find-clubs/find-clubs.usecase.js';
import { ClubEntity } from '../domain/entities/club.entity.js';

const CASH_300 = Money.fromDecimal('300.00');

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
        new ClubEntity(1, 'Águias FC', 'águias fc', 'AGU', CASH_300),
      );

      const result = await createClubUseCase.execute({
        name: 'Águias FC',
        acronym: 'AGU',
      });

      expect(repositoryMock.create).toHaveBeenCalledWith({
        name: 'Águias FC',
        normalizedName: 'águias fc',
        acronym: 'AGU',
        cash: CASH_300,
      });
      expect(result.cash).toEqual(CASH_300);
      expect(result.squadValue).toEqual(Money.ZERO);
      expect(result.netWorth).toEqual(CASH_300);
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
        new ClubEntity(1, 'Águias FC', 'águias fc', 'AGU', CASH_300),
      );

      const attempt = createClubUseCase.execute({
        name: 'águias fc',
        acronym: 'AGU',
      });
      await expect(attempt).rejects.toThrow(ConflictError);
      // Figma: a mensagem cita o clube que já existe, com o nome gravado
      await expect(attempt).rejects.toThrow(
        'Já existe um clube com o nome “Águias FC”.',
      );
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
          CASH_300,
        ),
      );

      await expect(
        createClubUseCase.execute({
          name: 'América Grandioso United',
          acronym: 'AGU',
        }),
      ).rejects.toThrow('Já existe um clube com a sigla “AGU”.');
    });
  });

  describe('FindClubsUseCase', () => {
    it('deve listar clubes calculando patrimônio e ordenando', async () => {
      repositoryMock.findAllWithSquad.mockResolvedValue([
        {
          club: new ClubEntity(1, 'Águias FC', 'águias fc', 'AGU', CASH_300),
          players: [],
        },
      ]);

      const result = await findClubsUseCase.execute({ sort: 'name' });
      expect(result).toHaveLength(1);
      expect(result[0].netWorth).toEqual(CASH_300);
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
      const club = new ClubEntity(1, 'Águias FC', 'águias fc', 'AGU', CASH_300);
      const contract = new ContractEntity(
        1,
        1,
        1,
        Money.fromDecimal('25.00'),
        new Date(Date.now() + 15 * 86400000), // 15 dias -> multa 5%
        'ATIVO',
      );

      const pAtacante = aPlayer()
        .withId(1)
        .withName('Beto Atacante')
        .withPosition('ATA')
        .withAgility(80)
        .withAge(24)
        .withBaseValue(25)
        .withAttributes({
          pace: 80,
          shooting: 85,
          passing: 70,
          dribbling: 75,
          defending: 30,
          physical: 70,
        })
        .withPotential(85)
        .withContract(contract)
        .build();

      const pGoleiro = aPlayer()
        .withId(2)
        .withName('Alair Goleiro')
        .withPosition('GOL')
        .withAgility(75)
        .withAge(28)
        .withBaseValue(20)
        .withClub(1)
        .withAttributes({
          pace: 50,
          shooting: 20,
          passing: 60,
          dribbling: 40,
          defending: 85,
          physical: 80,
        })
        .withPotential(82)
        .build();

      repositoryMock.findByIdWithSquad.mockResolvedValue({
        club,
        players: [pAtacante, pGoleiro], // Ordem inversa para testar a ordenação RN11
      });

      const result = await findClubByIdUseCase.execute({ id: 1 });

      expect(result.id).toBe(1);
      expect(result.cash).toEqual(CASH_300);
      expect(result.squad).toHaveLength(2);
      // GOL deve vir antes de ATA segundo a RN11
      expect(result.squad[0].player.getPosition()).toBe('GOL');
      expect(result.squad[0].player.getName()).toBe('Alair Goleiro');
      expect(result.squad[0].contract).toBeNull();

      expect(result.squad[1].player.getPosition()).toBe('ATA');
      expect(result.squad[1].player.getName()).toBe('Beto Atacante');
      expect(result.squad[1].contract).not.toBeNull();
      expect(result.squad[1].contract?.penaltyRate).toBe(5);
      // Atributos de duelo de cada jogador (RN20), para a tela de escalação só exibir
      expect(result.squad[0].duel.defense).toEqual({
        attribute: 'defending',
        value: 85,
        matchValue: 85,
      });
      expect(result.squad[1].duel.attack.attribute).toBe('shooting');

      expect(result.squadValue.cents).toBeGreaterThan(0);
      expect(result.netWorth).toEqual(result.cash.plus(result.squadValue));
    });
  });

  describe('ClubEntity (Domain)', () => {
    it('deve ordenar o elenco respeitando posição (RN11), nome e ID', () => {
      const club = new ClubEntity(
        1,
        'FC Teste',
        'fc teste',
        'FCT',
        Money.fromDecimal('100.00'),
      );
      const mei = (id: number, name: string) =>
        aPlayer().withId(id).withName(name).withClub(1);
      const p1 = mei(1, 'Zico').build();
      const p2 = mei(2, 'Ademir').build();
      const p3 = mei(3, 'Barbosa').withPosition('GOL').build();

      const sorted = club.sortSquad([p1, p2, p3]);
      expect(sorted.map((p) => p.getName())).toEqual([
        'Barbosa',
        'Ademir',
        'Zico',
      ]);
    });
  });
});
