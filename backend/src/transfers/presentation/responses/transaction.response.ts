import { ContractEnd } from '../../../domain/trade.js';
import { TransactionType } from '../../application/interfaces/repositories/transfer.repository.interface.js';

/**
 * Transação no contrato da API REST (2.3.3): campos em snake_case e valores em moedas.
 *
 * @export
 * @interface TransactionResponse
 */
export interface TransactionResponse {
  id: number;
  club_id: number;
  player_id: number;
  player_name: string;
  type: TransactionType;
  value: number;
  fee: number;
  penalty: number;
  profit: number | null;
  cash_change: number;
  created_at: string;
}

/** Totais das transações filtradas (RN17) */
export interface TransactionsSummaryResponse {
  total_spent: number;
  total_received: number;
  total_fees: number;
  total_penalties: number;
  total_profit: number;
}

/** Histórico do clube: `data` e `summary` (2.3.3) */
export interface TransactionsPageResponse {
  data: TransactionResponse[];
  summary: TransactionsSummaryResponse;
}

/** Resposta da compra (2.3.1): a transação COMPRA, o contrato criado e o novo caixa */
export interface PurchaseResponse extends TransactionResponse {
  type: 'COMPRA';
  profit: null;
  contract: {
    purchase_value: number;
    loyalty_until: string;
    status: 'ATIVO';
  };
  club_cash: number;
}

/** Resposta da venda (2.3.2): a transação VENDA, o acerto e o novo caixa */
export interface SaleResponse extends TransactionResponse {
  type: 'VENDA';
  profit: number;
  purchase_value: number;
  remaining_days: number;
  penalty_rate: number;
  contract_status: ContractEnd;
  club_cash: number;
}
