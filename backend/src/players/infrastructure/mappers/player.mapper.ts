import { Condition } from '../../../domain/market-value.js';
import { Position } from '../../../domain/player-rating.js';
import { PlayerEntity } from '../../domain/entities/player.entity.js';

/**
 * Linha da tabela `jogadores` com os campos usados pela entidade.
 *
 * @export
 * @interface PlayerRow
 */
export interface PlayerRow {
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
}

/**
 * Converte a linha de `jogadores` na entidade de domínio `PlayerEntity`.
 *
 * @param {PlayerRow} raw - Linha lida pelo Prisma.
 * @returns {PlayerEntity} Entidade de domínio.
 */
export function playerFromRow(raw: PlayerRow): PlayerEntity {
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
