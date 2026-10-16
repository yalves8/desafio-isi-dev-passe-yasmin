import { NotFoundError } from '../../../../common/errors/domain.errors.js';
import { IClubRepository } from '../../interfaces/repositories/club.repository.interface.js';
import { FindClubByIdInput } from './find-club-by-id.input.js';
import {
  toClubOutput,
  toSquadPlayerOutput,
} from '../../presenters/club.presenter.js';
import { FindClubByIdOutput } from './find-club-by-id.output.js';

/**
 * Caso de uso responsável por consultar detalhadamente um clube e seu elenco ordenado.
 *
 * Recupera a entidade do clube e seus atletas associados, delega a ordenação (RN11)
 * e o cálculo financeiro de patrimônio (RN05/RN11) às entidades de domínio correspondentes,
 * e formata o resultado incluindo dados contratuais (RN15).
 *
 * Fluxo principal:
 * 1. Busca os dados do clube e do elenco no repositório.
 * 2. Lança NotFoundError (404) caso o clube não exista.
 * 3. Ordena os atletas do elenco utilizando as regras de precedência da entidade ClubEntity (RN11).
 * 4. Calcula valor de mercado total e patrimônio líquido via métodos de domínio.
 * 5. Mapeia cada atleta formatando atributos técnicos, overall, valor de mercado e multa rescisória.
 *
 * @export
 * @class FindClubByIdUseCase
 */
export class FindClubByIdUseCase {
  /**
   * Cria uma nova instância de FindClubByIdUseCase.
   *
   * @param {IClubRepository} clubRepository - Repositório desacoplado para operações de clubes.
   */
  constructor(private readonly clubRepository: IClubRepository) {}

  /**
   * Executa a consulta do clube por id.
   *
   * @param {FindClubByIdInput} input - Contém o id do clube.
   * @returns {Promise<FindClubByIdOutput>} Detalhes do clube e elenco ordenado.
   * @throws {NotFoundError} Se o clube não for encontrado.
   */
  async execute(input: FindClubByIdInput): Promise<FindClubByIdOutput> {
    const data = await this.clubRepository.findByIdWithSquad(input.id);
    if (!data) {
      throw new NotFoundError('Clube não encontrado');
    }

    const { club, players } = data;
    const now = new Date();

    const squad = club.sortSquad(players);
    return {
      ...toClubOutput(club, squad),
      players: squad.map((player) => toSquadPlayerOutput(club, player, now)),
    };
  }
}
