/**
 * Dados de entrada para o caso de uso de criação de clube.
 *
 * @export
 * @interface CreateClubInput
 */
export interface CreateClubInput {
  /** Nome oficial do clube */
  name: string;
  /** Sigla oficial de 3 letras */
  acronym: string;
}
