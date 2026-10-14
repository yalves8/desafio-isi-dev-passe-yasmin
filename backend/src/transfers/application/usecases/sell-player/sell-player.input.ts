/**
 * Dados de entrada da venda (POST /players/{id}/sell); a venda não tem corpo.
 *
 * @export
 * @interface SellPlayerInput
 */
export interface SellPlayerInput {
  /** Jogador da URL, vendido pelo clube atual dele */
  playerId: number;
}
