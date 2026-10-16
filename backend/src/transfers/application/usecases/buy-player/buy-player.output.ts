import { PurchaseRecord } from '../../interfaces/repositories/transfer.repository.interface.js';

/**
 * Compra gravada, sem formato de transporte: o registro da operação (valores em centavos)
 * e o id da transação COMPRA.
 *
 * @export
 * @interface BuyPlayerOutput
 */
export interface BuyPlayerOutput extends PurchaseRecord {
  transactionId: number;
}
