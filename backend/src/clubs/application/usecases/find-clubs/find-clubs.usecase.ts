import {
  ClubSortEnum,
  compareClubsBySortCriteria,
} from '../../../domain/enums/club-sort.enum.js';
import { IClubRepository } from '../../interfaces/repositories/club.repository.interface.js';
import { FindClubsInput } from './find-clubs.input.js';
import { ClubSummaryItemOutput, FindClubsOutput } from './find-clubs.output.js';

/**
 * Caso de uso responsável por listar os clubes participantes da liga.
 *
 * Delega o cálculo do valor de mercado do elenco e do patrimônio total a cada entidade
 * de domínio ClubEntity (RN11) e aplica a ordenação oficial delegando à função de comparação
 * do domínio (compareClubsBySortCriteria).
 *
 * Fluxo principal:
 * 1. Obtém todos os clubes e seus respectivos elencos ativos do repositório.
 * 2. Para cada clube, calcula valor de elenco e patrimônio através dos métodos de domínio da entidade.
 * 3. Aplica a ordenação por nome ou por patrimônio com desempate por nome e id (RN11).
 *
 * @export
 * @class FindClubsUseCase
 */
export class FindClubsUseCase {
  /**
   * Cria uma nova instância de FindClubsUseCase.
   *
   * @param {IClubRepository} clubRepository - Repositório desacoplado para operações de clubes.
   */
  constructor(private readonly clubRepository: IClubRepository) {}

  /**
   * Executa a listagem e cálculo financeiro dos clubes.
   *
   * @param {FindClubsInput} [input] - Critérios de ordenação opcionais.
   * @returns {Promise<FindClubsOutput>} Lista de clubes ordenados com os totais de patrimônio.
   */
  async execute(input?: FindClubsInput): Promise<FindClubsOutput> {
    const sort = input?.sort ?? ClubSortEnum.NAME;
    const rawClubs = await this.clubRepository.findAllWithSquad();

    const result: ClubSummaryItemOutput[] = rawClubs.map(
      ({ club, players }) => ({
        id: club.id,
        name: club.name,
        acronym: club.acronym,
        cash: club.getCash(),
        squad_value: club.calculateSquadValue(players),
        net_worth: club.calculateNetWorth(players),
      }),
    );

    result.sort((a, b) => compareClubsBySortCriteria(a, b, sort));

    return result;
  }
}
