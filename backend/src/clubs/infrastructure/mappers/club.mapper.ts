import { Money } from '../../../domain/money.js';
import { ClubEntity } from '../../domain/entities/club.entity.js';

/**
 * Linha da tabela `clubes` com os campos usados pela entidade.
 *
 * @interface ClubRow
 */
interface ClubRow {
  id: number;
  nome: string;
  nome_normalizado: string;
  sigla: string;
  caixa: { toString(): string } | number | string;
  criado_em: Date;
}

/**
 * Converte a linha de `clubes` na entidade de domínio `ClubEntity`.
 *
 * @param {ClubRow} raw - Linha lida pelo Prisma.
 * @returns {ClubEntity} Entidade de domínio.
 */
export function clubFromRow(raw: ClubRow): ClubEntity {
  return new ClubEntity(
    raw.id,
    raw.nome,
    raw.nome_normalizado,
    raw.sigla,
    Money.fromDecimal(raw.caixa),
    raw.criado_em,
  );
}
