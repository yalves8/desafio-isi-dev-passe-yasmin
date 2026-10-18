import { Money } from '../../../../domain/money.js';

/**
 * Clube com os valores do momento (RN11), sem formato de transporte: caixa, valor do elenco
 * e patrimônio em `Money`.
 *
 * @export
 * @interface ClubSummary
 */
export interface ClubSummary {
  id: number;
  name: string;
  acronym: string;
  cash: Money;
  squadValue: Money;
  netWorth: Money;
}

/** Clubes na ordem pedida (nome ou patrimônio), com desempate pelo nome e pelo id */
export type FindClubsOutput = ClubSummary[];
