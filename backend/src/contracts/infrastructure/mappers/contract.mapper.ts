import { Money } from '../../../domain/money.js';
import {
  ContractEntity,
  ContractStatus,
} from '../../domain/entities/contract.entity.js';

/**
 * Linha da tabela `contratos` com os campos usados pela entidade.
 *
 * @interface ContractRow
 */
export interface ContractRow {
  id: number;
  jogador_id: number;
  clube_id: number;
  valor_compra: { toString(): string } | number | string;
  fidelidade_ate: Date;
  situacao: string;
  iniciado_em: Date;
  encerrado_em: Date | null;
}

/**
 * Converte a linha de `contratos` na entidade de domínio `ContractEntity`.
 *
 * @param {ContractRow} raw - Linha lida pelo Prisma.
 * @returns {ContractEntity} Entidade de domínio.
 */
export function contractFromRow(raw: ContractRow): ContractEntity {
  return new ContractEntity(
    raw.id,
    raw.jogador_id,
    raw.clube_id,
    Money.fromDecimal(raw.valor_compra),
    raw.fidelidade_ate,
    raw.situacao as ContractStatus,
    raw.iniciado_em,
    raw.encerrado_em,
  );
}
