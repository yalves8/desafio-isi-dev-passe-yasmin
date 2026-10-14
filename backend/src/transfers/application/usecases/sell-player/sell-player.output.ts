/**
 * Resposta da venda: a transação `VENDA`, os cálculos da RN15/RN16 e o novo caixa (2.3.2).
 *
 * @export
 * @interface SellPlayerOutput
 */
export interface SellPlayerOutput {
  id: number;
  club_id: number;
  player_id: number;
  player_name: string;
  type: 'VENDA';
  value: number;
  fee: number;
  penalty: number;
  profit: number;
  cash_change: number;
  created_at: string;
  purchase_value: number;
  remaining_days: number;
  penalty_rate: number;
  contract_status: 'RESCINDIDO' | 'ENCERRADO';
  club_cash: number;
}
