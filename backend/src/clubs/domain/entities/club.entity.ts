import { fromCents, toCents } from '../../../domain/money.js';
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
   * @param {number} cash - Saldo financeiro em caixa (inicia em 300,00).
   * @param {string | null} formation - Formação tática atual da escalação, se houver.
   * @param {Date} [createdAt] - Data de criação do clube.
   */
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly normalizedName: string,
    public readonly acronym: string,
    private cash: number = 300.0,
    private formation: string | null = null,
    public readonly createdAt: Date = new Date(),
  ) {}

  /**
   * Obtém o saldo financeiro atual do caixa do clube.
   *
   * @returns {number} O saldo em caixa.
   */
  public getCash(): number {
    return this.cash;
  }

  /**
   * Obtém a formação tática cadastrada na escalação.
   *
   * @returns {string | null} A formação (ex: '2-1-1') ou null se não escalado.
   */
  public getFormation(): string | null {
    return this.formation;
  }

  /**
   * Atualiza a formação tática do clube.
   *
   * @param {string | null} newFormation - Nova formação tática.
   */
  public updateFormation(newFormation: string | null): void {
    this.formation = newFormation;
  }

  /**
   * Atualiza o saldo em caixa após operações de mercado.
   *
   * @param {number} newCash - Novo valor de caixa.
   */
  public updateCash(newCash: number): void {
    this.cash = newCash;
  }

  /**
   * Calcula o valor de mercado total do elenco somando o valor atual de cada atleta (RN05/RN11).
   *
   * @param {PlayerEntity[]} players - Atletas pertencentes ao elenco do clube.
   * @returns {number} Valor total do elenco formatado em moedas com 2 casas decimais.
   */
  public calculateSquadValue(players: PlayerEntity[]): number {
    let squadValueCents = 0;
    for (const player of players) {
      squadValueCents += toCents(player.calculateMarketValue());
    }
    return fromCents(squadValueCents);
  }

  /**
   * Calcula o patrimônio líquido total do clube: saldo em caixa + valor de mercado do elenco (RN11).
   *
   * @param {PlayerEntity[]} players - Atletas pertencentes ao elenco do clube.
   * @returns {number} Patrimônio total formatado em moedas com 2 casas decimais.
   */
  public calculateNetWorth(players: PlayerEntity[]): number {
    const cashCents = toCents(this.cash);
    let squadValueCents = 0;
    for (const player of players) {
      squadValueCents += toCents(player.calculateMarketValue());
    }
    return fromCents(cashCents + squadValueCents);
  }

  /**
   * Ordena os atletas do elenco de acordo com as regras de prioridade da RN11:
   * 1. Posição no campo: GOL, ZAG, LAT, MEI, ATA (via PositionPriorityEnum)
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

