import { INITIAL_CASH } from '../../../domain/league.js';
import { Money } from '../../../domain/money.js';
import { PlayerEntity } from '../../../players/domain/entities/player.entity.js';
import { compareSquadOrder } from '../../../players/domain/squad-order.js';

/**
 * Representa a entidade de domínio de um Clube na Liga.
 *
 * Encapsula os atributos fundamentais do clube, garantindo as regras
 * de negócio inerentes à sua existência, finanças e gerenciamento de elenco.
 *
 * @export
 * @class ClubEntity
 */
export class ClubEntity {
  /**
   * Construtor da entidade `ClubEntity`.
   *
   * @param {number} id - Identificador único do clube.
   * @param {string} name - Nome oficial do clube.
   * @param {string} normalizedName - Nome normalizado em minúsculas para controle de unicidade (RN10).
   * @param {string} acronym - Sigla oficial de 3 letras maiúsculas.
   * @param {Money} cash - Saldo financeiro em caixa (inicia em 300,00).
   * @param {Date} [createdAt] - Data de criação do clube.
   */
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly normalizedName: string,
    public readonly acronym: string,
    private readonly cash: Money = INITIAL_CASH,
    public readonly createdAt: Date = new Date(),
  ) {}

  /**
   * Nome usado na unicidade (RN10): sem diferenciar maiúsculas e minúsculas, mas com acentos.
   * Os espaços já chegam normalizados pela validação (V4).
   */
  public static normalizeName(name: string): string {
    return name.toLowerCase();
  }

  /**
   * Obtém o saldo financeiro atual do caixa do clube.
   *
   * @returns {Money} O saldo em caixa.
   */
  public getCash(): Money {
    return this.cash;
  }

  /**
   * Calcula o valor de mercado total do elenco somando o valor atual de cada atleta (RN05/RN11).
   *
   * @param {PlayerEntity[]} players - Atletas pertencentes ao elenco do clube.
   * @returns {Money} Valor total do elenco.
   */
  public calculateSquadValue(players: PlayerEntity[]): Money {
    return Money.sum(players.map((player) => player.calculateMarketValue()));
  }

  /**
   * Calcula o patrimônio líquido total do clube: saldo em caixa + valor de mercado do elenco (RN11).
   *
   * @param {PlayerEntity[]} players - Atletas pertencentes ao elenco do clube.
   * @returns {Money} Patrimônio total.
   */
  public calculateNetWorth(players: PlayerEntity[]): Money {
    return this.cash.plus(this.calculateSquadValue(players));
  }

  /**
   * Ordena os atletas do elenco de acordo com as regras de prioridade da RN11:
   * 1. Posição no campo: GOL, ZAG, LAT, MEI, ATA (ordem de `POSITIONS`)
   * 2. Nome oficial do atleta (alfabético insensível a acentos e maiúsculas)
   * 3. ID do jogador crescente (critério final de desempate)
   *
   * @param {PlayerEntity[]} players - Lista de jogadores do elenco a serem ordenados.
   * @returns {PlayerEntity[]} Nova lista de jogadores rigorosamente ordenada.
   */
  public sortSquad(players: PlayerEntity[]): PlayerEntity[] {
    return [...players].sort(compareSquadOrder);
  }
}
