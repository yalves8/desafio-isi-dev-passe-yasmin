import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { ContractEntity } from '../../../contracts/domain/entities/contract.entity.js';
import { Condition } from '../../../domain/market-value.js';
import { Position } from '../../../domain/player-rating.js';
import { PlayerEntity } from '../../../players/domain/entities/player.entity.js';
import {
  ClubWithSquadData,
  IClubRepository,
} from '../../application/interfaces/repositories/club.repository.interface.js';
import { ClubEntity } from '../../domain/entities/club.entity.js';

/**
 * Implementação concreta de persistência do IClubRepository utilizando Prisma ORM.
 *
 * Mapeia os modelos relacionais do Prisma para as entidades de domínio e DTOs de aplicação.
 *
 * @export
 * @class PrismaClubRepository
 * @extends {IClubRepository}
 */
@Injectable()
export class PrismaClubRepository implements IClubRepository {
  /**
   * Construtor da classe `PrismaClubRepository`.
   *
   * @param {PrismaService} prisma - Serviço de conexão com o banco de dados via Prisma.
   */
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Conta a quantidade total de clubes cadastrados.
   *
   * @returns {Promise<number>} Total de clubes.
   */
  async count(): Promise<number> {
    return this.prisma.clube.count();
  }

  /**
   * Busca um clube pelo nome normalizado.
   *
   * @param {string} normalizedName - Nome em minúsculas a ser consultado.
   * @returns {Promise<ClubEntity | null>} Entidade de domínio ou null se inexistente.
   */
  async findByNormalizedName(
    normalizedName: string,
  ): Promise<ClubEntity | null> {
    const raw = await this.prisma.clube.findUnique({
      where: { nome_normalizado: normalizedName },
    });
    if (!raw) return null;
    return new ClubEntity(
      raw.id,
      raw.nome,
      raw.nome_normalizado,
      raw.sigla,
      Number(raw.caixa),
      raw.formacao,
      raw.criado_em,
    );
  }

  /**
   * Busca um clube pela sigla oficial.
   *
   * @param {string} acronym - Sigla a ser consultada.
   * @returns {Promise<ClubEntity | null>} Entidade de domínio ou null se inexistente.
   */
  async findByAcronym(acronym: string): Promise<ClubEntity | null> {
    const raw = await this.prisma.clube.findUnique({
      where: { sigla: acronym },
    });
    if (!raw) return null;
    return new ClubEntity(
      raw.id,
      raw.nome,
      raw.nome_normalizado,
      raw.sigla,
      Number(raw.caixa),
      raw.formacao,
      raw.criado_em,
    );
  }

  /**
   * Busca um clube por ID com os dados do seu elenco ativo e contratos vigentes.
   *
   * @param {number} id - Identificador do clube.
   * @returns {Promise<ClubWithSquadData | null>} Objeto contendo entidade e atletas ou null.
   */
  async findByIdWithSquad(id: number): Promise<ClubWithSquadData | null> {
    const raw = await this.prisma.clube.findUnique({
      where: { id },
      include: {
        jogadores: {
          where: { excluido_em: null },
          include: {
            contratos: {
              where: { situacao: 'ATIVO' },
            },
          },
        },
      },
    });

    if (!raw) return null;

    const club = new ClubEntity(
      raw.id,
      raw.nome,
      raw.nome_normalizado,
      raw.sigla,
      Number(raw.caixa),
      raw.formacao,
      raw.criado_em,
    );

    const players: PlayerEntity[] = raw.jogadores.map((j) => {
      const activeContract = j.contratos[0]
        ? new ContractEntity(
            j.contratos[0].id,
            j.contratos[0].jogador_id,
            j.contratos[0].clube_id,
            Number(j.contratos[0].valor_compra),
            j.contratos[0].fidelidade_ate,
            j.contratos[0].situacao as 'ATIVO' | 'ENCERRADO',
            j.contratos[0].iniciado_em,
            j.contratos[0].encerrado_em,
          )
        : null;

      return new PlayerEntity(
        j.id,
        j.nome,
        j.posicao as Position,
        j.agilidade,
        j.idade,
        Number(j.valor_base),
        j.condicao as Condition,
        j.clube_id,
        {
          pace: j.velocidade,
          shooting: j.finalizacao,
          passing: j.passe,
          dribbling: j.drible,
          defending: j.defesa,
          physical: j.fisico,
        },
        j.potencial,
        j.excluido_em,
        j.criado_em,
        activeContract,
      );
    });

    return { club, players };
  }

  /**
   * Lista todos os clubes e seus elencos para fins de apuração financeira e classificação.
   *
   * @returns {Promise<ClubWithSquadData[]>} Lista de clubes e atletas.
   */
  async findAllWithSquad(): Promise<ClubWithSquadData[]> {
    const rawList = await this.prisma.clube.findMany({
      include: {
        jogadores: {
          where: { excluido_em: null },
        },
      },
    });

    return rawList.map((raw) => ({
      club: new ClubEntity(
        raw.id,
        raw.nome,
        raw.nome_normalizado,
        raw.sigla,
        Number(raw.caixa),
        raw.formacao,
        raw.criado_em,
      ),
      players: raw.jogadores.map(
        (j) =>
          new PlayerEntity(
            j.id,
            j.nome,
            j.posicao as Position,
            j.agilidade,
            j.idade,
            Number(j.valor_base),
            j.condicao as Condition,
            j.clube_id,
            {
              pace: j.velocidade,
              shooting: j.finalizacao,
              passing: j.passe,
              dribbling: j.drible,
              defending: j.defesa,
              physical: j.fisico,
            },
            j.potencial,
            j.excluido_em,
            j.criado_em,
          ),
      ),
    }));
  }

  /**
   * Persiste a criação de um novo clube no banco de dados.
   *
   * @param {Object} data - Dados cadastrais do novo clube.
   * @returns {Promise<ClubEntity>} Entidade persistida.
   */
  async create(data: {
    name: string;
    normalizedName: string;
    acronym: string;
    cash: number;
  }): Promise<ClubEntity> {
    const created = await this.prisma.clube.create({
      data: {
        nome: data.name,
        nome_normalizado: data.normalizedName,
        sigla: data.acronym,
        caixa: data.cash,
        formacao: null,
      },
    });

    return new ClubEntity(
      created.id,
      created.nome,
      created.nome_normalizado,
      created.sigla,
      Number(created.caixa),
      created.formacao,
      created.criado_em,
    );
  }
}
