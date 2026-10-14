/**
 * Dados de saída retornados pelo caso de uso de criação de clube.
 *
 * @export
 * @interface CreateClubOutput
 */
export interface CreateClubOutput {
  /** Identificador único gerado para o clube */
  id: number;
  /** Nome oficial do clube */
  name: string;
  /** Sigla oficial de 3 letras */
  acronym: string;
  /** Saldo inicial em caixa (300,00) */
  cash: number;
  /** Valor de mercado somado do elenco inicial (0,00) */
  squad_value: number;
  /** Patrimônio total (caixa + elenco = 300,00) */
  net_worth: number;
}
