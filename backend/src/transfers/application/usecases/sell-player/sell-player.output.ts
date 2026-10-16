import { SaleRecord } from '../../interfaces/repositories/transfer.repository.interface.js';

/**
 * Venda gravada, sem formato de transporte: o acerto (valores em centavos) e o id da
 * transação VENDA.
 *
 * @export
 * @interface SellPlayerOutput
 */
export interface SellPlayerOutput extends SaleRecord {
  transactionId: number;
}
