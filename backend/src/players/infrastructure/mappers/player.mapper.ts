import {
  ContractRow,
  contractFromRow,
} from '../../../contracts/infrastructure/mappers/contract.mapper.js';
import { Condition } from '../../../domain/condition.js';
import { Money } from '../../../domain/money.js';
import { Position } from '../../../domain/position.js';
import { PlayerEntity } from '../../domain/entities/player.entity.js';

/**
 * Linha da tabela `jogadores` com os campos usados pela entidade.
 *
 * @interface PlayerRow
 */
interface PlayerRow {
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
  /** Contratos ativos, quando a consulta os incluir; o primeiro vira o contrato ativo. */
  contratos?: ContractRow[];
}

/**
 * Converte a linha de `jogadores` na entidade de domínio `PlayerEntity`.
 *
 * @param {PlayerRow} raw - Linha lida pelo Prisma.
 * @returns {PlayerEntity} Entidade de domínio.
 */
export function playerFromRow(raw: PlayerRow): PlayerEntity {
  return PlayerEntity.restore({
    id: raw.id,
    name: raw.nome,
    position: raw.posicao as Position,
    agility: raw.agilidade,
    age: raw.idade,
    baseValue: Money.fromDecimal(raw.valor_base),
    condition: raw.condicao as Condition,
    clubId: raw.clube_id,
    attributes: {
      pace: raw.velocidade,
      shooting: raw.finalizacao,
      passing: raw.passe,
      dribbling: raw.drible,
      defending: raw.defesa,
      physical: raw.fisico,
    },
    potential: raw.potencial,
    deletedAt: raw.excluido_em,
    createdAt: raw.criado_em,
    activeContract: raw.contratos?.[0]
      ? contractFromRow(raw.contratos[0])
      : null,
  });
}
