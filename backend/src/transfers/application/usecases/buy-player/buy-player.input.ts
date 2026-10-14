/**
 * Dados de entrada da compra de jogador (POST /players/{id}/buy).
 *
 * @export
 * @interface BuyPlayerInput
 */
export interface BuyPlayerInput {
  /** Jogador da URL */
  playerId: number;
  /** Clube comprador */
  clubId: number;
  /** Fim da fidelidade, já interpretado da RN01 */
  loyaltyUntil: Date;
}
