import { PlayerEntity } from '../../../../players/domain/entities/player.entity.js';
import { ClubEntity } from '../../../domain/entities/club.entity.js';

export interface ClubWithSquadData {
  club: ClubEntity;
  players: PlayerEntity[];
}

/**
 * Interface abstrata que define o contrato do repositório de clubes.
 *
 * Desacopla a camada de aplicação da infraestrutura de banco de dados (Prisma/ORM).
 *
 * @export
 * @abstract
 * @class IClubRepository
 */
export abstract class IClubRepository {
  /**
   * Conta a quantidade total de clubes cadastrados na liga.
   *
   * @returns {Promise<number>} Quantidade total de clubes.
   */
  abstract count(): Promise<number>;

  /**
   * Busca um clube pelo seu nome normalizado (RN10).
   *
   * @param {string} normalizedName - Nome em minúsculas a verificar.
   * @returns {Promise<ClubEntity | null>} O clube encontrado ou null.
   */
  abstract findByNormalizedName(
    normalizedName: string,
  ): Promise<ClubEntity | null>;

  /**
   * Busca um clube pela sua sigla oficial.
   *
   * @param {string} acronym - Sigla de 3 caracteres.
   * @returns {Promise<ClubEntity | null>} O clube encontrado ou null.
   */
  abstract findByAcronym(acronym: string): Promise<ClubEntity | null>;

  /**
   * Busca um clube por ID com os dados do seu elenco ativo e contratos vigentes.
   *
   * @param {number} id - Identificador do clube.
   * @returns {Promise<ClubWithSquadData | null>} Clube com elenco ou null.
   */
  abstract findByIdWithSquad(id: number): Promise<ClubWithSquadData | null>;

  /**
   * Lista todos os clubes com os jogadores de seus elencos para cálculo de patrimônio.
   *
   * @returns {Promise<ClubWithSquadData[]>} Lista de clubes com elenco.
   */
  abstract findAllWithSquad(): Promise<ClubWithSquadData[]>;

  /**
   * Cria um novo clube na base de dados.
   *
   * @param {Object} data - Dados para persistência.
   * @returns {Promise<ClubEntity>} Entidade do clube persistida.
   */
  abstract create(data: {
    name: string;
    normalizedName: string;
    acronym: string;
    cash: number;
  }): Promise<ClubEntity>;
}
