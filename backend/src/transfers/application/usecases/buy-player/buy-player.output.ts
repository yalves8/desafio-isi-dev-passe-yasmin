/**
 * Resposta da compra: a transação `COMPRA`, o contrato criado e o novo caixa (2.3.1).
 *
 * @export
 * @interface BuyPlayerOutput
 */
export interface BuyPlayerOutput {
  id: number;
  club_id: number;
  player_id: number;
  player_name: string;
  type: 'COMPRA';
  value: number;
  fee: number;
  penalty: number;
  profit: null;
  cash_change: number;
  created_at: string;
  contract: {
    purchase_value: number;
    loyalty_until: string;
    status: 'ATIVO';
  };
  club_cash: number;
}
