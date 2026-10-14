/**
 * Resumo dos dados de um clube para listagem geral.
 *
 * @export
 * @interface ClubSummaryItemOutput
 */
export interface ClubSummaryItemOutput {
  id: number;
  name: string;
  acronym: string;
  cash: number;
  squad_value: number;
  net_worth: number;
}

/**
 * Dados de saída do caso de uso de listagem de clubes.
 */
export type FindClubsOutput = ClubSummaryItemOutput[];
