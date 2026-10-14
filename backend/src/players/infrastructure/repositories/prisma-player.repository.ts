import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { Condition } from '../../../domain/market-value.js';
import { Position } from '../../../domain/player-rating.js';
import {
  IPlayerRepository,
  PlayerFilterCriteria,
} from '../../application/interfaces/repositories/player.repository.interface.js';
import {
  PlayerEntity,
  PlayerTechnicalAttributes,
} from '../../domain/entities/player.entity.js';

/**
 * Implementação concreta de persistência do IPlayerRepository utilizando Prisma ORM.
 *
 * Mapeia entre a tabela `jogadores` do PostgreSQL e as entidades de domínio `PlayerEntity`.
 *
 * @export
 * @class PrismaPlayerRepository
 * @extends {IPlayerRepository}
 */
@Injectable()
export class PrismaPlayerRepository implements IPlayerRepository {
  /**
   * Construtor da classe `PrismaPlayerRepository`.
   *
   * @param {PrismaService} prisma - Conexão Prisma com o PostgreSQL.
   */
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(raw: {
    id: number;
    nome: string;
    posicao: string;
    agilidade: number;
    idade: number;
    valor_base: { toString(): string } | number | string;
    condicao: string;
    clube_id: number | null;
    velocidade: number;
    finalizacao: number;
    passe: number;
    drible: number;
    defesa: number;
    fisico: number;
    potencial: number;
    excluido_em: Date | null;
    criado_em: Date;
  }): PlayerEntity {
    return new PlayerEntity(
      raw.id,
      raw.nome,
      raw.posicao as Position,
      raw.agilidade,
      raw.idade,
      Number(raw.valor_base),
      raw.condicao as Condition,
      raw.clube_id,
      {
        pace: raw.velocidade,
        shooting: raw.finalizacao,
        passing: raw.passe,
        dribbling: raw.drible,
        defending: raw.defesa,
        physical: raw.fisico,
      },
      raw.potencial,
      raw.excluido_em,
      raw.criado_em,
    );
  }

  /**
   * Busca um atleta ativo pelo ID.
   *
   * @param {number} id - Identificador do atleta.
   * @returns {Promise<PlayerEntity | null>} Entidade de domínio ou null se inexistente/excluído.
   */
  async findById(id: number): Promise<PlayerEntity | null> {
    const raw = await this.prisma.jogador.findFirst({
      where: { id, excluido_em: null },
    });
    if (!raw) return null;
    return this.toDomain(raw);
  }

  /**
   * Cria um novo atleta na base de dados.
   *
   * @param {Object} data - Dados cadastrais e atributos.
   * @returns {Promise<PlayerEntity>} Entidade persistida.
   */
  async create(data: {
    name: string;
    position: Position;
    agility: number;
    age: number;
    baseValue: number;
    attributes: PlayerTechnicalAttributes;
    potential: number;
  }): Promise<PlayerEntity> {
    const created = await this.prisma.jogador.create({
      data: {
        nome: data.name,
        posicao: data.position,
        agilidade: data.agility,
        idade: data.age,
        valor_base: data.baseValue,
        condicao: 'APTO',
        clube_id: null,
        velocidade: data.attributes.pace,
        finalizacao: data.attributes.shooting,
        passe: data.attributes.passing,
        drible: data.attributes.dribbling,
        defesa: data.attributes.defending,
        fisico: data.attributes.physical,
        potencial: data.potential,
      },
    });

    return this.toDomain(created);
  }

  /**
   * Atualiza dados cadastrais do atleta.
   *
   * @param {PlayerEntity} player - Entidade com dados a atualizar.
   * @returns {Promise<PlayerEntity>} Entidade atualizada.
   */
  async update(player: PlayerEntity): Promise<PlayerEntity> {
    const updated = await this.prisma.jogador.update({
      where: { id: player.id },
      data: {
        nome: player.getName(),
        posicao: player.getPosition(),
        agilidade: player.getAgility(),
        idade: player.getAge(),
      },
    });

    return this.toDomain(updated);
  }

  /**
   * Atualiza a condição física do jogador.
   * Se for alterado para 'DOENTE', remove os registros de titularidade em escalações (RN19).
   *
   * @param {PlayerEntity} player - Entidade com a nova condição.
   * @returns {Promise<PlayerEntity>} Entidade atualizada.
   */
  async updateCondition(player: PlayerEntity): Promise<PlayerEntity> {
    const newCondition = player.getCondition();

    if (newCondition === 'DOENTE') {
      const updated = await this.prisma.$transaction(async (tx) => {
        await tx.escalacao.deleteMany({
          where: { jogador_id: player.id },
        });
        return tx.jogador.update({
          where: { id: player.id },
          data: { condicao: 'DOENTE' },
        });
      });
      return this.toDomain(updated);
    }

    const updated = await this.prisma.jogador.update({
      where: { id: player.id },
      data: { condicao: newCondition },
    });

    return this.toDomain(updated);
  }

  /**
   * Executa a exclusão lógica do jogador marcando a data atual em excluido_em (RN09).
   *
   * @param {number} id - Identificador do atleta.
   * @returns {Promise<void>}
   */
  async softDelete(id: number): Promise<void> {
    await this.prisma.jogador.update({
      where: { id },
      data: { excluido_em: new Date() },
    });
  }

  /**
   * Consulta atletas ativos filtrando por critérios de banco de dados.
   *
   * @param {PlayerFilterCriteria} filter - Critérios de filtro.
   * @returns {Promise<PlayerEntity[]>} Lista de atletas ativos.
   */
  async findMany(filter: PlayerFilterCriteria): Promise<PlayerEntity[]> {
    const where: {
      excluido_em: null;
      clube_id?: number | null | { not: null };
      posicao?: string;
      condicao?: string;
      idade?: { gte?: number; lte?: number };
    } = {
      excluido_em: null,
    };

    if (filter.clubId !== undefined) {
      where.clube_id = filter.clubId;
    } else if (filter.free === true) {
      where.clube_id = null;
    } else if (filter.free === false) {
      where.clube_id = { not: null };
    }

    if (filter.position) {
      where.posicao = filter.position;
    }

    if (filter.condition) {
      where.condicao = filter.condition;
    }

    if (filter.minAge !== undefined || filter.maxAge !== undefined) {
      where.idade = {};
      if (filter.minAge !== undefined) where.idade.gte = filter.minAge;
      if (filter.maxAge !== undefined) where.idade.lte = filter.maxAge;
    }

    const rawList = await this.prisma.jogador.findMany({ where });
    return rawList.map((r) => this.toDomain(r));
  }

  /**
   * Verifica se um determinado clube existe na tabela de clubes.
   *
   * @param {number} clubId - Identificador do clube.
   * @returns {Promise<boolean>} True se existir, false caso contrário.
   */
  async checkClubExists(clubId: number): Promise<boolean> {
    const club = await this.prisma.clube.findUnique({
      where: { id: clubId },
    });
    return club !== null;
  }
}
